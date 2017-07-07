<template>
  <div class="c-wp" v-scroll="getMore">
    <div class="js-follow-more">
      <a class="c-att-more" v-if="!isV" @click.stop="toFollowMore">
        <span></span> 关注更多
      </a>
      <h3 class="c-att-tit" v-else>推荐作者</h3>
      <ul class="c-att-ul att-more">
        <li v-for="(item, index) in followList">
          <span class="c-att-time" v-if="!isV">{{item.createtime}}</span>
          <a class="c-att-t" v-show="isV && !item.isattention" @click.stop="followToggle($event, 0, item)"><span>＋</span> 关注</a>
          <a class="c-att-t on" v-show="isV && item.isattention" @click.stop="followToggle($event, 1, item)">已关注</a> 
          <img class="c-auth-img" :src="item.userpic || defaultData.headImg" alt="" @error="loadError($event)"> 
          
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
require('../api/kerkee.js')
// import * as ApiBridge from '../mock/apibridge.mock.js'

export default {
  name: 'myFollow',
  data: function () {
    return {
      defaultData: {
        navBarImg: require('../assets/navbar_bg.png'),
        headImg: require('../assets/pic_head.png')
      },
      isLoad: true,
      isEmpty: false,
      isNet: true,
      isV: false,
      isloadMore: false,
      lastpageid: '',
      urlUserId: util.getParam('userId'),
      mobileType: util.mobileType() === 'iOS' ? 1 : 2,
      authInfo: {}, // 当前用户的信息（登录者
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
      ApiBridge.callNative('ClientDataManager', 'getNetworkState', {}, (state) => {
        this.isNet = state.result
        // 未联网
        if (!Number(this.isNet)) {
          self.getLocalDataNoNet()
        } else {
          ApiBridge.callNative('ClientDataManager', 'getUserInfo', {}, (user) => {
            self.authInfo = user
            if (Number(self.authInfo.userId)) {
              // 已登录
              const opt = {
                au: self.authInfo.userAuth
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
      ApiBridge.callNative('ClientDataManager', 'getLocalDataForFollow', {}, (follow) => {
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
          ApiBridge.callNative('ClientViewManager', 'loadingFailed', {}, () => {
            ApiBridge.callNative('ClientViewManager', 'showLoadingView')
            self.init()
          })
        }
      })
    },
    // 有网未登录
    getLocalDataNet () {
      let self = this
      ApiBridge.callNative('ClientDataManager', 'getLocalDataForFollow', {}, (follow) => {
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
          document.body.scrollTop = 0
          res = JSON.parse(res)
          self.isLoad = true
          ApiBridge.callNative('ClientViewManager', 'hideLoadingView')

          self.isloadmore = res.result.isloadmore || ''
          self.lastpageid = res.result.lastpageid || ''
          // res.result.vuserlist.length = 0
          if (res.result.vuserlist.length) {
            self.isV = false
            self.followList = [...self.followList, ...res.result.vuserlist]
          } else {
            // 已登录本地数据没有
            if (opt.au) {
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
              'userid#1': self.authInfo.userId || 0
            }
          }
          util.chejiahaoPv(pvMap)
        },
        fail: function (status) {
          // $('.js-follow-more').hide()
          // $('.js-follow-v').hide()
          // $('.c-loading').hide()
          if (self.localData.length) {
            self.isV = false
          } else {
            ApiBridge.callNative('ClientViewManager', 'loadingFailed', {}, () => {
              ApiBridge.callNative('ClientViewManager', 'showLoadingView')
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
          ApiBridge.callNative('ClientViewManager', 'hideLoadingView')
          self.isLoad = true
          if (res.result.vuserlist.length) {
            self.followList = res.result.vuserlist
            self.isV = true
          } else {
            self.isEmpty = true
          }
        },
        fail: function (status) {
          ApiBridge.callNative('ClientViewManager', 'loadingFailed', {}, () => {
            ApiBridge.callNative('ClientViewManager', 'showLoadingView')
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
        ApiBridge.callNative('ClientViewManager', 'showErrorTipsViewForNoNetWork', {
          top: 'topNavTop'
        })
        return
      }
      // 已登录
      if (Number(this.authInfo.userId)) {
        // 取网络数据
        // 传lastpageid分页
        if (this.isloadmore) {
          this.isLoad = true

          let opt = {
            au: this.authInfo.userAuth
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
      this.localIndex++
      this.localData.map(function (i, v) {
        if (i < ((this.localIndex + 1) * 19) && (i >= this.localIndex * 19)) {
          this.followList.push(v)
        }
      })
      this.isLoad = true
    },
    followToggle (e, type, item, info) {
      let self = this
      info = {
        userId: item.userid,
        username: item.username,
        imgurl: item.userpic
      }
      func.followToggle(e, type, self.authInfo, info, self)
    },
    loadError (e) {
      e.target.onerror = null
      e.target.src = ''
    },
    toAuthorPage (e, news) {
      func.toAuthorPage(e, news.userid, this.authInfo.userId)
    },
    toFollowMore () {
      ApiBridge.callNative('ClientViewManager', 'pushViewController', {
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
  background #f6f6f6
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
  color #333
  border 1px solid #ccc
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
