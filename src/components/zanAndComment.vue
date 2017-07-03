<template>
  <p class="c-tab-ue">
    <span class="c-zan" @click.stop="likeZan">
      <span class="zan-icon" :class="{on: hasZan}"></span>
      <span class="c-add1" v-show="isAddZan">+1</span>
      <span class="c-num">{{news['praisenum']}}</span>
    </span>
    <span class="c-comment" @click.stop="tagCommon">
      <span class="c-num">{{news['replycount']}}</span>
    </span>
  </p>
</template>

<script>
import * as ApiBridge from '../mock/apibridge.mock.js'
import * as util from '../api/util.js'

export default{
  props: ['newsData', 'user'],
  data: function () {
    return {
      hasZan: false,
      isAddZan: false,
      likesLocal: []
    }
  },
  computed: {
    news: function () {
      return this.newsData
    }
  },
  methods: {
    chijiaohaoZanPv: function () {
      // click埋点
      let pvMap = {
        'eventid': 'chejiahao_praise_click',
        'pagename': 'chejiahao_praise',
        'reportjson': {
          'userid#1': this.user.userId || 0,
          'objectid#2': this.news.newsid,
          'typeid#3': this.news.typeid
        }
      }
      util.chejiahaoPv(pvMap)
    },
    tagCommon: function () {
      // pv
      let pvMap = {
        'eventid': 'chejiahao_comment_click',
        'pagename': 'chejiahao_comment',
        'reportjson': {
          'userid#1': this.user.userId || 0,
          'objectid#2': this.news.newsid
        }
      }
      util.chejiahaoPv(pvMap)
      ApiBridge.callNative('ClientViewManager', 'pushViewController', {
        pagetype: 2,
        animationtype: 2,
        set: {
          navigationtype: 2
        },
        param: {
          newsid: this.news.newsid,
          type: this.news.mediatype,
          autoscrolltocomment: 1
        }
      })
    },
    likeZan: function () {
      let self = this
      if (self.hasZan) {
        return
      }

      if (!self.user.userId) {
        ApiBridge.callNative('ClientViewManager', 'login', {}, (res) => {
          if (res.result === 1) {
            self.zanHandler(self)
          }
        })
      } else {
        self.zanHandler(self)
      }
    },
    zanHandler: function () {
      let self = this
      self.hasZan = true
      self.isAddZan = true
      self.news.praisenum++

      self.chijiaohaoZanPv()
      setTimeout(function () {
        self.isAddZan = false
      }, 1000)

      // 记录点赞
      self.likesLocal.push(self.news.newsid)
      self.setLs('tagliked', self.likesLocal)

      ApiBridge.callNative('ClientDataManager', 'getSystemConstant', {}, function (follow) {
        util.ajax({
          url: util.api.zanSet,
          type: 'POST',
          isJson: true,
          data: {
            appid: '21',
            _appid: util.mobileType() === 'iOS' ? 'app' : 'app_android',
            liketype: '1',
            objid: self.news.newsid,
            secobj: '',
            sessionid: follow.uniqueDeviceIMEI,
            autohomeua: self.user.userAgent,
            authorization: self.user.userAuth,
            extdata: ''
          },
          dataType: 'json',
          success: function (res, xml) {
            self.hasZan = true
          },
          fail: function (status) {
            self.hasZan = false
          }
        })
      })
    },
    // 保存到localStorage
    setLs: function (key, value) {
      if (!key) return
      value = (typeof value === 'string') ? value : JSON.stringify(value)
      window.localStorage.setItem(key, value)
    },
    getLs: function (key) {
      if (!key) return
      var value = window.localStorage.getItem(key)
      return JSON.parse(value)
    }
  }
}
</script>
<style lang="stylus">
.c-media-oper
  .c-tab-ue
    float right
    margin-right .75rem
    height 20px
    > span
      position relative
      z-index 15
      display inline-block
      width 20px
      height 20px
      margin-left 20px
  .c-zan
    .zan-icon
      display inline-block
      height 20px
      width 20px
      background url(../assets/zan.png) center no-repeat
      background-size 100% auto
    .on
      background url(../assets/tag-zan.png) center no-repeat
      background-size 100% auto
      transform scale(1)
      animation zans 800ms linear 1 forwards
    .on-no-inmation
      background url(../assets/tag-zan.png) center no-repeat
      background-size 100% auto
    .c-add1
      position absolute
      top -9px
      right -15px
      z-index 99
      color #4C92FB
      animation add 800ms linear 1 forwards
  .c-num
    position absolute
    top -5px
    left 16px
    line-height 1
    color #4C92FB
    font-size .5rem
           
  .c-comment
    background url(../assets/comment.png) center no-repeat
    background-size 100% auto
    
    .c-num
      padding 2px
      top -7px
      left 14px
      background #fff
  @keyframes add{
    0%{
      opacity 1
      transform translateY(0px)
    }
    100%{
      opacity 0
      transform translateY(-12px)
    }
  }
  @keyframes zans{
    0%{
      transform scale(1)
    }
    50%{
      transform scale(1.8)
    }
    100%{
      transform scale(1)
    }
  }
</style>
