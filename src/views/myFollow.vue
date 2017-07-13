<template>
  <div class="c-wp" v-scroll="getMore">
    <div class="js-follow-more" slot="list">
      <a class="c-att-more" v-if="!isV" @click.stop="toFollowMore">
        <span></span> 关注更多
      </a>
      <h3 class="c-att-tit" v-else>推荐作者</h3>
      <ul class="c-att-ul att-more">
        <li v-for="(item, index) in followList" @click.stop="toAuthorPage($event, item)">
          <span class="c-att-time" v-if="!isV">{{item.createtime}}</span>

          <follow-toggle :objecttypeid="9" :attention="item.isattention" :newsData="item" :loginInfo="loginInfo" v-if="isV"></follow-toggle>

          <img class="c-auth-img" imgType="head" v-lazy="item.userpic || defaultData.headImg" alt="" @error="loadError($event)"> 
          
          <div class="c-att-des" v-if="!isV">
            <h3 class="c-att-title c-att-title-f">{{item.username}}</h3> 
            <p class="c-att-info">{{item.title}}</p>
          </div>
          <div class="c-att-des" v-else>
            <h3 class="c-att-title">{{item.username}}</h3> 
            <p class="c-att-fans">{{item.fansnum}}粉丝</p> 
            <p class="c-att-info">{{item.userdesc}}</p>
          </div>
        </li>
      </ul>
      <a class="c-att-more" href="javascript:;" v-if="isV" @click.stop="toFollowMore">更多作者</a>
      <div class="c-loading" v-show="isLoad">
        <span class="loading-icon"></span> 
        <p>加载中...</p>
      </div>
    </div>
  </div>
</template>
<script>
import * as func from '../api/index.js'
import * as util from '../api/util.js'
import followToggle from '../components/followToggle'

export default {
  name: 'myFollow',
  components: {
    followToggle
  },
  data: function () {
    return {
      defaultData: {
        navBarImg: require('../assets/navbar_bg.png'),
        headImg: require('../assets/pic_head.png')
      },
      isLoad: false,
      isEmpty: false,
      isNet: true,
      isV: false,
      isloadMore: false,
      lastpageid: '',
      urlUserId: util.getParam('userId'),
      mobileType: util.mobileType() === 'iOS' ? 1 : 2,
      loginInfo: {}, // 当前用户的信息（登录者
      followList: [],
      localData: []
    }
  },
  mounted () {
    this.init()
  },
  directives: { // 自定义指令
    scroll: {
      bind: function (el, binding) {
        window.addEventListener('scroll', function () {
          let offsetHeight = window.innerHeight
          let scrollHeight = document.body.scrollHeight
          let scrollTop = document.body.scrollTop
          if ((scrollTop + offsetHeight) >= scrollHeight) {
            let fnc = binding.value
            fnc()
          }
        })
      }
    }
  },
  methods: {
    init () {
      const self = this
      // 判断是否联网
      util.callNative('ClientDataManager', 'getNetworkState', {}, (state) => {
        this.isNet = state.result
        // 未联网
        if (!Number(this.isNet)) {
          self.getLocalDataNoNet()
        } else {
          util.callNative('ClientDataManager', 'getUserInfo', {}, (user) => {
            self.loginInfo = user
            if (Number(self.loginInfo.userId)) {
              // 已登录
              const opt = {
                au: self.loginInfo.userAuth
              }
              self.getFollow(opt)
            } else {
              self.getLocalDataNet()
            }
          })
        }
      })
    },
    // 无网
    getLocalDataNoNet () {
      // 未联网
      let self = this
      util.callNative('ClientDataManager', 'getLocalDataForFollow', {}, (follow) => {
        self.localData = follow.result
        if (self.localData.length) {
          self.isV = false
          self.localData.map(function (i, item) {
            item.userid = item.userId
            item.userpic = item.imgurl
            item.createtime = item.time
            item.username = item.userName
            if (i < 20) {
              self.followList.push(item)
            }
          })
        } else {
          util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
            util.callNative('ClientViewManager', 'showLoadingView')
            self.init()
          })
        }
      })
    },
    // 有网未登录
    getLocalDataNet () {
      let self = this
      util.callNative('ClientDataManager', 'getLocalDataForFollow', {}, (follow) => {
        self.localData = follow.result
        // 本地数据有
        if (self.localData.length) {
          let ids = []
          // vm.data.localData = follow.result;
          self.localData.map(function (v) {
            ids.push(v.userId)
          })
          const opt = {
            vids: ids.toString()
          }
          self.getFollow(opt)
          self.isV = false
        } else {
          self.getV()
        }
      })
    },
    // 获取已关注作者列表
    getFollow (opt) {
      const self = this
      let postData = {}
      if (opt.au) {
        postData = {
          pm: self.mobileType,
          dt: 1,
          pid: self.lastpageid || '',
          pagesize: 10,
          au: opt.au
        }
      } else {
        postData = {
          pm: self.mobileType,
          dt: 1,
          vids: opt.vids
        }
      }
      util.ajax({
        url: util.api.npgetvuserlist,
        type: 'GET',
        data: postData,
        dataType: 'json',
        success: function (res, xml) {
          res = JSON.parse(res)
          util.callNative('ClientViewManager', 'hideLoadingView')

          self.isloadmore = res.result.isloadmore || ''
          self.lastpageid = res.result.lastpageid || ''
          if (res.result.vuserlist.length) {
            self.isV = false
            self.isLoad = false
            self.followList = [...self.followList, ...res.result.vuserlist]
          } else {
            // 已登录本地数据没有
            if (opt.au) {
              self.isLoad = true
              self.getV(opt.au)
            } else {
              self.isEmpty = true
            }
          }

          // 添加pv
          const pvMap = {
            'eventid': 'chejiahao_myattention_page_pv',
            'pagename': 'chejiahao_myattention_page',
            'isdata': res.result.vuserlist.length ? 1 : 0,
            'reportjson': {
              'userid#1': self.loginInfo.userId || 0
            }
          }
          util.chejiahaoPv(pvMap)
        },
        fail: function (status) {
          if (self.localData.length) {
            self.isV = false
          } else {
            util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
              util.callNative('ClientViewManager', 'showLoadingView')
              self.init()
            })
          }
        }
      })
    },
    // 获取大V列表
    getV (au) {
      const self = this
      util.ajax({
        url: util.api.npgetvuserlist,
        type: 'GET',
        data: {
          pm: self.mobileType,
          dt: 0,
          au: au || ''
        },
        dataType: 'json',
        success: function (res, xml) {
          res = JSON.parse(res)
          util.callNative('ClientViewManager', 'hideLoadingView')
          self.isLoad = false
          if (res.result.vuserlist.length) {
            self.followList = res.result.vuserlist
            self.isV = true
          } else {
            self.isEmpty = true
          }
        },
        fail: function (status) {
          util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
            util.callNative('ClientViewManager', 'showLoadingView')
            self.init()
          })
        }
      })
    },
    // 上拉加载下一页
    getMore (e) {
      if (this.isV) {
        return
      }
      if (!Number(this.isNet)) {
        util.callNative('ClientViewManager', 'showErrorTipsViewForNoNetWork', {
          top: 'topNavTop'
        })
        return
      }
      // 已登录
      if (Number(this.loginInfo.userId)) {
        // 取网络数据
        // 传lastpageid分页
        if (this.isloadmore) {
          this.isLoad = true

          let opt = {
            au: this.loginInfo.userAuth
          }
          this.getFollow(opt)
        } else {
          this.isLoad = false
        }
      } else {
        if (this.localData) {
          let ids = []
          this.localData.map(function (v) {
            ids.push(v.userId)
          })
          if (ids.length < 20) {
            return
          }
          this.localNextPage()
        }
      }
    },
    // 本地上拉翻页
    localNextPage () {
      this.isLoad = true
      this.localIndex++
      this.localData.map(function (i, v) {
        if (i < ((this.localIndex + 1) * 19) && (i >= this.localIndex * 19)) {
          this.followList.push(v)
        }
      })
    },
    loadError (e) {
      e.target.onerror = null
      e.target.src = ''
    },
    toAuthorPage (e, news) {
      func.toAuthorPage(e, news.userid, this.loginInfo.userId)
    },
    toFollowMore () {
      util.callNative('ClientViewManager', 'pushViewController', {
        pagetype: 7,
        animationtype: 1,
        set: {
          modename: 'follow-more-tab',
          navigationtype: 1,
          title: ''
        }
      })
    }
  }
}
</script>
<style lang="stylus" scoped>
.c-att-tit
  box-sizing border-box
  background #F8F8F8
  color #666
  font-size 0.75rem
  font-weight 400
  height 1.5rem
  margin 0
  padding-top 6px
  padding-left .55rem

.c-att-time
  float right
  font-size .6rem
  color #c3c3c3
  
.c-att-more
  display block
  margin 1rem
  font-size .85rem
  color #2873ff
  border 1px solid #2873ff
  line-height 2.5
  text-align center
  text-decoration none
  span
    width 15px
    height 15px
    display inline-block
    background url(../assets/follow.png) no-repeat
    background-size 100%
    vertical-align -2px
  
</style>
