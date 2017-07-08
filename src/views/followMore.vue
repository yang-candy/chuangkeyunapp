<template>
  <div class="c-wp">
    <div class="c-att-fixed">
      <ul class="c-att-bar">
        <li :class="{on: navIndex === index}" v-for="(item, index) in followBarList" @click.stop="tabClick(item.id, index)">{{item.name}}</li>
      </ul> 
    </div>
    <div class="c-att-more-list" @scroll="getMore">
      <ul class="c-att-ul">
        <li v-for="(item, index) in followList" @click.stop="toAuthorPage($event, item)"> 
          <follow-toggle :objecttypeid="9" :attention="item.isattention" :newsData="item" :authInfo="authInfo"></follow-toggle>
          <img class="c-auth-img" :src="item.userpic || defaultData.headImg" alt="" @error="loadError($event)"> 
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
import * as func from '../api/index.js'
import * as util from '../api/util.js'
import followToggle from '../components/followToggle'

export default {
  name: 'followMore',
  components: {
    followToggle
  },
  data: function () {
    return {
      defaultData: {
        navBarImg: require('../assets/navbar_bg.png'),
        headImg: require('../assets/pic_head.png')
      },
      navIndex: 0,
      isLoad: false,
      isEmpty: false,
      isNet: true,
      isloadMore: false,
      followId: '',
      lastpageid: '',
      urlUserId: util.getParam('userId'),
      authInfo: {}, // 当前用户的信息（登录者）
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
      const self = this
      util.ajax({
        url: util.api.getCategoryList,
        type: 'GET',
        data: {},
        dataType: 'json',
        success: function (res, xml) {
          res = JSON.parse(res)
          util.callNative('ClientViewManager', 'hideLoadingView')

          if (res.result.length) {
            self.followBarList = res.result
            self.followId = self.followBarList[0].id
            self.getFollowMore(self.followBarList[0].id, 0)
          }
        },
        fail: function (status) {
          util.callNative('ClientViewManager', 'loadingFailed', {}, function () {
            util.callNative('ClientViewManager', 'showLoadingView')
            self.getNavBar()
          })
        }
      })
    },
    getFollowMore () {
      const self = this
      util.callNative('ClientDataManager', 'getNetworkState', {}, function (state) {
        self.isNet = state.result
        if (!Number(self.isNet)) {
          util.callNative('ClientViewManager', 'loadingFailed', {}, function () {
            util.callNative('ClientViewManager', 'showLoadingView')
            self.isLoad = true
            self.getNavBar()
          })
        } else {
          util.callNative('ClientDataManager', 'getUserInfo', {}, function (user) {
            self.authInfo = user
            self.getFollowMoreList()
          })
        }
      })
    },
    getFollowMoreList () {
      const self = this
      util.ajax({
        url: util.api.getUserPageByCategory,
        type: 'GET',
        data: {
          userCategoryId: self.followId,
          size: 20,
          au: self.authInfo.userAuth || '',
          lastId: self.lastpageid || ''
        },
        dataType: 'json',
        success: function (res, xml) {
          res = JSON.parse(res)
          self.isLoad = false
          self.isEmpty = !res.result.users.length
          self.isloadMore = res.result.loadMore
          util.callNative('ClientViewManager', 'hideLoadingView')
          if (res.result.users.length) {
            self.lastpageid = res.result.lastId
            self.followList = [...self.followList, ...res.result.users]
            self.getLocalDataForFollow()
          }
          // 添加pv
          let pvMap = {
            'eventid': 'chejiahao_allbigvlist_page_pv',
            'pagename': 'chejiahao_allbigvlist_page',
            'isdata': self.followList.length ? 1 : 0,
            'reportjson': {
              'userid#1': self.authInfo.userId || 0
            }
          }
          util.chejiahaoPv(pvMap)
        },
        fail: function (status) {}
      })
    },
    getLocalDataForFollow: function () {
      let self = this
      // 未登录
      if (!Number(self.authInfo.userId)) {
        try {
          util.callNative('ClientDataManager', 'getLocalDataForFollow', {}, function (follow) {
            // 本地数据有
            if (follow.result.length) {
              follow.result.map(function (v) {
                self.followList.map(function (j) {
                  if (v['userId'] === j['userid']) {
                    j['isattention'] = '1'
                  }
                })
              })
            }
          })
        } catch (e) {}
      }
    },
    loadError: function (e) {
      e.target.onerror = null
      e.target.src = ''
    },
    // tab切换
    tabClick: function (id, index) {
      this.followList = []
      this.navIndex = index
      this.followId = id
      this.lastpageid = ''
      util.callNative('ClientViewManager', 'showLoadingView')
      this.getFollowMore()
    },
    getMore: function (e) {
      const self = this
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
        if (!Number(self.isNet)) {
          if (!self.isLoad) {
            self.isLoad = true
            util.callNative('ClientViewManager', 'showErrorTipsViewForNoNetWork', {
              top: 'topNavTop'
            }, function () {
              self.isLoad = false
            })
          }
        } else {
          if (!self.isLoad) {
            if (self.isloadMore) {
              self.isLoad = true
              self.getFollowMoreList(self.followId, self.navIndex)
            } else {
              self.isLoad = false
            }
          }
        }
      }
    },
    toAuthorPage: function (e, news) {
      func.toAuthorPage(e, news.userid, this.authInfo.userId)
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
