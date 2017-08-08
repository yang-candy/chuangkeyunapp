<template>
  <div class="c-wp">
    <div class="c-att-fixed">
      <ul class="c-att-bar">
        <li :class="{on: tabIndex === index}" v-for="(item, index) in followBarList" @click.stop="tabClick(item.id, index)">{{item.name}}</li>
      </ul> 
    </div>
    <div class="c-att-more-list" @scroll="getMore">
      <ul class="c-att-ul">
        <li v-for="(item, index) in dataList" @click.stop="toAuthorPage($event, item)"> 
          <follow-toggle :objecttypeid="10" :attention="item.isattention" :newsData="item" :loginInfo="loginInfo" @followEvent="followToggle(item, $event)"></follow-toggle>
          <img class="c-auth-img" imgType="head" v-lazy="item.userpic || defaultData.headImg" alt="" @error="loadError($event)"> 
          <div class="c-att-des">
            <h3 class="c-att-title">{{item.username}}</h3> 
            <p class="c-att-fans">{{item.fansnum}}粉丝</p> 
            <p class="c-att-info">{{item.userdesc}}</p>
          </div>           
        </li>
      </ul>
      <div class="c-loading" v-show="isLoad">
        <span class="loading-icon"></span> 
        <p>加载中...</p>
      </div>
      
    </div>
    <div class="c-empty" v-show="isEmpty"> 
      <p><img src="../assets/pic_empty.png"><br>暂无内容</p>
    </div>
  </div>
</template>
<script>
import * as func from '../util/index.js'
import * as util from '../util/util.js'
import followToggle from '../components/followToggle'

export default {
  name: 'followMore',
  components: {
    followToggle
  },
  data () {
    return {
      defaultData: {
        headImg: require('../assets/pic_head.png')
      },
      tabIndex: 0,
      isLoad: false,
      isEmpty: false,
      isFirst: false,
      isNet: true,
      followId: '',
      urlUserId: util.getParam('userId'),
      loginInfo: {}, // 当前用户的信息（登录者）
      followBarList: [],
      isloadmore: [],
      lastpageid: [],
      dataList: [],
      followList: [[]]
    }
  },
  mounted () {
    this.getNavBar()
    this.registerNotice()
    util.setViewBounces()
  },
  methods: {
    // 注册全局通知（点赞和关注）
    registerNotice () {
      util.callNative('ClientNoticeManager', 'registerNotice', {
        keys: ['kNotification_yc_followNotification', 'kNotification_yc_praiseNotification']
      }, (result) => {
        if (this.followList.length && result.key === 'kNotification_yc_followNotification') {
          this.followList.map((news, index) => {
            if (news.length) {
              news.map((v) => {
                if (result.args.state === 1 && Number(result.args.userid) === Number(v['userid'])) {
                  v['isattention'] = result.args.operation
                }
              })
            }
          })
        }
      })
    },
    getNavBar () {
      util.ajax({
        url: util.api.getCategoryList,
        type: 'GET',
        data: {},
        dataType: 'json',
        success: (res, xml) => {
          res = JSON.parse(res)
          util.callNative('ClientViewManager', 'hideLoadingView')

          if (res.result.length) {
            this.followBarList = res.result
            this.followId = this.followBarList[this.tabIndex].id
            this.followList.length = this.followBarList.length
            for (let i of this.followList.keys()) {
              if (!this.followList[i]) {
                this.followList[i] = []
              }
            }
            this.getFollowMore()
          }
        },
        fail: (status) => {
          util.callNative('ClientViewManager', 'hideLoadingView')
          util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
            util.callNative('ClientViewManager', 'showLoadingView')
            this.getNavBar()
          })
        }
      })
    },
    getFollowMore (index) {
      util.callNative('ClientDataManager', 'getNetworkState', {}, (state) => {
        this.isNet = state.result
        if (!Number(this.isNet)) {
          util.callNative('ClientViewManager', 'hideLoadingView')
          util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
            util.callNative('ClientViewManager', 'showLoadingView')
            this.getNavBar()
          })
        } else {
          util.callNative('ClientDataManager', 'getUserInfo', {}, (user) => {
            this.loginInfo = user
            this.getFollowMoreList(index)
          })
        }
      })
    },
    getFollowMoreList (index) {
      index = index || this.tabIndex
      util.ajax({
        url: util.api.getUserPageByCategory,
        type: 'GET',
        data: {
          userCategoryId: this.followId,
          size: 20,
          au: this.loginInfo.userAuth || '',
          lastId: this.lastpageid[this.tabIndex] || ''
        },
        dataType: 'json',
        success: (res, xml) => {
          if (Number(this.tabIndex) !== Number(index)) {
            return
          }
          res = JSON.parse(res)
          this.isLoad = false
          this.isloadmore[this.tabIndex] = res.result.loadMore || false
          this.lastpageid[this.tabIndex] = res.result.lastId || ''
          util.callNative('ClientViewManager', 'hideLoadingView')
          if (res.result.users.length) {
            this.followList[this.tabIndex] = [...this.followList[this.tabIndex], ...res.result.users]
            this.dataList = this.followList[this.tabIndex]
            this.getLocalDataForFollow()
          }
          this.isEmpty = !this.followList[this.tabIndex].length
          // 添加pv
          const pvMap = {
            'eventid': 'chejiahao_allbigvlist_page_pv',
            'pagename': 'chejiahao_allbigvlist_page',
            'isdata': res.result.users.length ? 1 : 0,
            'reportjson': {
              'userid#1': this.loginInfo.userId || 0
            }
          }
          util.chejiahaopagePv(pvMap)
        },
        fail: (status) => {
          this.isLoad = false
          util.callNative('ClientViewManager', 'hideLoadingView')
          util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
            util.callNative('ClientViewManager', 'showLoadingView')
            // this.getFollowMoreList()
          })
        }
      })
    },
    getLocalDataForFollow () {
      // 未登录
      if (!Number(this.loginInfo.userId)) {
        try {
          util.callNative('ClientDataManager', 'getLocalDataForFollow', {}, (follow) => {
            // 本地数据有
            if (follow.result.length) {
              follow.result.map((v) => {
                this.dataList.map((j) => {
                  if (v['userId'] === j['userid']) {
                    j['isattention'] = 1
                  }
                })
              })
            }
          })
        } catch (e) {}
      }
    },
    loadError (e) {
      e.target.onerror = null
      e.target.src = ''
    },
    followToggle (item, value) {
      item.isattention = value
    },
    // tab切换
    tabClick (id, index) {
      if (this.tabIndex === index) {
        return
      }
      this.isLoad = false
      this.isEmpty = false
      this.dataList = []
      this.tabIndex = index
      this.followId = id
      setTimeout(() => {
        if (!this.followList[this.tabIndex].length) {
          this.followList[this.tabIndex] = []
          this.getFollowMore(index)
        } else {
          this.dataList = this.followList[this.tabIndex]
        }
      }, 0)
    },
    getMore (e) {
      const $target = e.currentTarget
      const $scrollHeight = $target.scrollHeight
      const $height = $target.clientHeight
      const $scrollTop = $target.scrollTop
      const $docScrollTop = document.body.scrollTop
      if (util.mobileType() === 'iOS') {
        if ($scrollTop === 0) {
          window.scrollTop = $docScrollTop
        }
      }
      if ($scrollTop && $height + $scrollTop >= $scrollHeight) {
        this.isEmpty = false
        if (!Number(this.isNet)) {
          if (!this.isLoad) {
            util.callNative('ClientViewManager', 'showErrorTipsViewForNoNetWork')
          }
        } else {
          if (!this.isLoad) {
            if (this.isloadmore[this.tabIndex]) {
              this.isLoad = true
              this.getFollowMoreList()
            } else {
              this.isLoad = false
            }
          }
        }
      }
    },
    toAuthorPage (e, news) {
      func.toAuthorPage(e, news.userid, this.loginInfo.userId)
    }
  }
}
</script>
<style lang="stylus" scoped>
.c-att-info
  margin-right 5px
.c-empty
  margin-left 5rem
  z-index 1
.c-att-fixed
  position absolute
  left 0
  top 0
  bottom 0
  width 5rem
  height 100%
  height 100vh
  background #F8F8F8
  overflow-y scroll

.c-att-bar
  li
    border-left 4px solid #f8f8f8
    line-height 5
    text-indent 1rem
    color #999
    &.on
      border-left 4px solid #333
      background #fff
      color #333
    
.c-att-more-list
  position absolute
  left 5rem
  top 0
  right 0
  bottom 0
  height 100%
  height 100vh
  overflow-y scroll
  background #fff
.c-att-ul .c-att-title
  width 90px
@media only screen and (max-width: 320px)
  .c-att-fixed
    width 4.5rem
  .c-att-more-list
    left 4.5rem
  .c-att-bar li
    height 60px
    line-height 60px
    text-indent .6rem
  .c-att-ul img
    width 2rem
    height 2rem
    margin-right .5rem
  .c-att-ul li  
    height 2.5rem
    padding .7rem .75rem .8rem
  .c-att-ul .c-att-title
    width 75px
    font-size 14px
    margin-right 3rem
  .c-att-ul .c-att-fans, .c-att-ul .c-att-info
    font-size 10px
</style>
