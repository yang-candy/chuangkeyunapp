<template>
  <div class="c-wp">
    <div class="c-att-fixed">
      <ul class="c-att-bar">
        <li :class="{on: tabIndex === index}" v-for="(item, index) in followBarList" @click.stop="tabClick(item.id, index)">{{item.name}}</li>
      </ul> 
    </div>
    <div class="c-att-more-list" @scroll="getMore">
      <ul class="c-att-ul">
        <li v-for="(item, index) in followList" @click.stop="toAuthorPage($event, item)"> 
          <follow-toggle :objecttypeid="10" :attention="item.isattention" :newsData="item" :loginInfo="loginInfo"></follow-toggle>
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
      isNet: true,
      isloadMore: false,
      followId: '',
      lastpageid: '',
      urlUserId: util.getParam('userId'),
      loginInfo: {}, // 当前用户的信息（登录者）
      followBarList: [],
      followList: []
    }
  },
  mounted () {
    this.getNavBar()
    util.setViewBounces()
  },
  methods: {
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
            this.followId = this.followBarList[0].id
            this.getFollowMore()
          }
        },
        fail: (status) => {
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
          lastId: this.lastpageid || ''
        },
        dataType: 'json',
        success: (res, xml) => {
          if (Number(this.tabIndex) !== Number(index)) {
            return
          }
          res = JSON.parse(res)
          this.isLoad = false
          this.isEmpty = !res.result.users.length
          this.isloadMore = res.result.loadMore
          util.callNative('ClientViewManager', 'hideLoadingView')
          if (res.result.users.length) {
            this.lastpageid = res.result.lastId
            this.followList = [...this.followList, ...res.result.users]
            this.getLocalDataForFollow()
          }
          // 添加pv
          const pvMap = {
            'eventid': 'chejiahao_allbigvlist_page_pv',
            'pagename': 'chejiahao_allbigvlist_page',
            'isdata': res.result.users.length ? 1 : 0,
            'reportjson': {
              'userid#1': this.loginInfo.userId || 0
            }
          }
          util.chejiahaoPv(pvMap)
        },
        fail: (status) => {}
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
                this.followList.map((j) => {
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
    // tab切换
    tabClick (id, index) {
      this.isLoad = false
      this.isEmpty = false
      this.followList = []
      this.tabIndex = index
      this.followId = id
      this.lastpageid = ''
      this.getFollowMore(index)
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
      if ($height + $scrollTop >= $scrollHeight) {
        if (!Number(this.isNet)) {
          if (!this.isLoad) {
            this.isLoad = true
            util.callNative('ClientViewManager', 'showErrorTipsViewForNoNetWork', {
              top: 'topNavTop'
            }, () => {
              this.isLoad = false
            })
          }
        } else {
          if (!this.isLoad) {
            if (this.isloadMore) {
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
.c-empty
  margin-left 5rem
  z-index 1
.c-att-fixed
  position absolute
  left 0
  top 0
  bottom 0
  width 5rem
  background #F8F8F8
  overflow-y scroll

.c-att-bar
  li
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
  overflow-y scroll
  background #fff
  
</style>
