<template>
  <div class="c-wp" v-scroll="getMore" v-show="isLoaded">
    <div class="js-follow-more">
      <a class="c-att-more" v-if="!isV" @click.stop="toFollowMore">
        <span></span> 关注更多
      </a>
      <h3 class="c-att-tit" v-else>推荐作者</h3>
      <ul class="c-att-ul att-more">
        <li v-for="(item, index) in followList" @click.stop="toAuthorPage($event, item)">
          <span class="c-att-time" v-if="!isV">{{item.createtime}}</span>

          <follow-toggle :objecttypeid="9" :attention="item.isattention" :newsData="item" :loginInfo="loginInfo" v-if="isV" @followEvent="followToggle(item, $event)"></follow-toggle>

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
import * as func from '../util/index.js'
import * as util from '../util/util.js'
import followToggle from '../components/followToggle'

export default {
  name: 'myFollow',
  components: {
    followToggle
  },
  data () {
    return {
      defaultData: {
        headImg: require('../assets/pic_head.png')
      },
      isLoad: false,
      isLoaded: false,
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
  directives: { // 自定义指令
    scroll: {
      bind (el, binding) {
        window.addEventListener('scroll', () => {
          const offsetHeight = window.innerHeight
          const scrollHeight = document.body.scrollHeight
          const scrollTop = document.body.scrollTop
          if ((scrollTop + offsetHeight) >= scrollHeight) {
            let fnc = binding.value
            fnc()
          }
        })
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      // 判断是否联网
      util.callNative('ClientDataManager', 'getNetworkState', {}, (state) => {
        this.isNet = state.result
        // 未联网
        if (!Number(this.isNet)) {
          this.getLocalDataNoNet()
        } else {
          util.callNative('ClientDataManager', 'getUserInfo', {}, (user) => {
            this.loginInfo = user
            if (Number(this.loginInfo.userId)) {
              // 已登录
              const opt = {
                au: this.loginInfo.userAuth
              }
              this.getFollow(opt)
            } else {
              this.getLocalDataNet()
            }
          })
        }
      })
    },
    // 无网
    getLocalDataNoNet () {
      // 未联网
      util.callNative('ClientDataManager', 'getLocalDataForFollow', {}, (follow) => {
        this.localData = follow.result
        this.isLoaded = true
        util.callNative('ClientViewManager', 'hideLoadingView')
        if (this.localData.length) {
          this.isV = false
          this.localData.map((item, i) => {
            item.userid = item.userId
            item.userpic = item.imgurl
            item.createtime = item.time
            item.username = item.userName
          })
          this.followList = this.localData
        } else {
          this.isLoaded = false
          util.callNative('ClientViewManager', 'hideLoadingView')
          util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
            util.callNative('ClientViewManager', 'showLoadingView')
            this.init()
          })
        }
      })
    },
    // 有网未登录
    getLocalDataNet () {
      util.callNative('ClientDataManager', 'getLocalDataForFollow', {}, (follow) => {
        this.localData = follow.result
        // 本地数据有
        if (this.localData.length) {
          this.isV = false
          let ids = []
          // vm.data.localData = follow.result;
          this.localData.map(function (v) {
            ids.push(v.userId)
          })
          const opt = {
            vids: ids.toString()
          }
          this.getFollow(opt)
        } else {
          this.getV()
        }
      })
    },
    // 获取已关注作者列表
    getFollow (opt) {
      let postData = {}
      if (opt.au) {
        postData = {
          pm: this.mobileType,
          dt: 1,
          pid: this.lastpageid || '',
          pagesize: 10,
          au: opt.au
        }
      } else {
        postData = {
          pm: this.mobileType,
          dt: 1,
          vids: opt.vids
        }
      }
      util.ajax({
        url: util.api.npgetvuserlist,
        type: 'GET',
        data: postData,
        dataType: 'json',
        success: (res, xml) => {
          res = JSON.parse(res)
          util.callNative('ClientViewManager', 'hideLoadingView')
          this.isloadmore = res.result.isloadmore || ''
          this.lastpageid = res.result.lastpageid || ''
          if (res.result.vuserlist.length) {
            this.isV = false
            this.isLoad = false
            this.isLoaded = true
            this.followList = [...this.followList, ...res.result.vuserlist]
          } else {
            // 已登录本地数据没有
            if (opt.au) {
              this.isLoaded = false
              this.isLoad = true
              this.getV(opt.au)
            } else {
              this.isEmpty = true
            }
          }
          this.isEmpty = !this.followList.length
          // 添加pv
          const pvMap = {
            'eventid': 'chejiahao_myattention_page_pv',
            'pagename': 'chejiahao_myattention_page',
            'isdata': res.result.vuserlist.length ? 1 : 0,
            'reportjson': {
              'userid#1': this.loginInfo.userId || 0
            }
          }
          util.chejiahaopagePv(pvMap)
        },
        fail: (status) => {
          if (this.localData.length) {
            this.isV = false
          } else {
            util.callNative('ClientViewManager', 'hideLoadingView')
            util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
              util.callNative('ClientViewManager', 'showLoadingView')
              this.init()
            })
          }
        }
      })
    },
    // 获取大V列表
    getV (au) {
      util.ajax({
        url: util.api.npgetvuserlist,
        type: 'GET',
        data: {
          pm: this.mobileType,
          dt: 0,
          au: au || ''
        },
        dataType: 'json',
        success: (res, xml) => {
          this.isLoaded = true
          res = JSON.parse(res)
          util.callNative('ClientViewManager', 'hideLoadingView')
          this.isLoad = false
          if (res.result.vuserlist.length) {
            this.followList = res.result.vuserlist
            this.isV = true
          } else {
            this.isEmpty = true
          }
        },
        fail: (status) => {
          util.callNative('ClientViewManager', 'hideLoadingView')
          util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
            util.callNative('ClientViewManager', 'showLoadingView')
            this.init()
          })
        }
      })
    },
    // 上拉加载下一页
    getMore (e) {
      this.isEmpty = false
      if (this.isV || this.isEmpty) {
        return
      }
      if (!Number(this.isNet)) {
        util.callNative('ClientViewManager', 'showErrorTipsViewForNoNetWork')
        return
      }
      // 已登录
      if (Number(this.loginInfo.userId)) {
        // 取网络数据
        // 传lastpageid分页
        if (!this.isLoad) {
          if (this.isloadmore) {
            this.isLoad = true

            let opt = {
              au: this.loginInfo.userAuth
            }
            this.getFollow(opt)
          } else {
            this.isLoad = false
          }
        }
      } else {
        // if (this.localData) {
        //   let ids = []
        //   this.localData.map(function (v) {
        //     ids.push(v.userId)
        //   })
        //   const opt = {
        //     vids: ids.toString()
        //   }
        //   this.getFollow(opt)
        //   // if (ids.length < 20) {
        //   //   return
        //   // }
        //   // this.localNextPage()
        // }
      }
    },
    // 本地上拉翻页
    localNextPage () {
      this.localIndex++
      this.localData.map((v, i) => {
        if (i < ((this.localIndex + 1) * 19) && (i >= this.localIndex * 19)) {
          this.followList.push(v)
        }
      })
    },
    followToggle (item, value) {
      item.isattention = value
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
.c-att-ul
  li:first-of-type
    border-top 1px solid #eee
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
    
.c-att-title-f
  margin-top .35rem
  margin-bottom 8px
  & + .c-att-info
    margin-right 1.85rem
</style>
