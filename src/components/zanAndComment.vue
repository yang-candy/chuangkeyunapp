<template>
  <p class="c-tab-ue">
    <span class="c-zan" @click.stop="likeZan">
      <span class="zan-icon" :class="{'on-no-inmation': news.hasZan, 'on': isAddZan}"></span>
      <span class="c-num">{{news['praisenum']}}<span class="c-add1" v-show="isAddZan">+1</span></span>

    </span>
    <span class="c-comment" @click.stop="tagCommon">
      <span class="c-num">{{news['replycount']}}</span>
    </span>
  </p>
</template>

<script>
import * as util from '../util/util.js'
import * as func from '../util/index.js'

export default{
  props: ['newsData', 'user', 'media'],
  data () {
    return {
      hasZan: false,
      isAddZan: false,
      likesLocal: []
    }
  },
  computed: {
    news () {
      return this.newsData
    }
  },
  mounted () {
    this.likesLocal = this.getLs('tagliked') || []
  },
  methods: {
    chijiaohaoZanPv () {
      // click埋点
      const pvMap = {
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
    tagCommon () {
      // pv
      const pvMap = {
        'eventid': 'chejiahao_comment_click',
        'pagename': 'chejiahao_comment',
        'reportjson': {
          'userid#1': this.user.userId || 0,
          'objectid#2': this.news.newsid
        }
      }
      util.chejiahaoPv(pvMap)
      func.deleteMedia(this.media)
      util.callNative('ClientViewManager', 'pushViewController', {
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
    likeZan () {
      if (this.news.hasZan) {
        return
      }
      if (!this.user.userId) {
        func.deleteMedia(this.media)
        util.callNative('ClientViewManager', 'login', {}, (res) => {
          if (Number(res.result) === 1) {
            this.zanHandler(this)
          }
        })
      } else {
        this.zanHandler(this)
      }
    },
    zanHandler () {
      this.hasZan = true
      this.isAddZan = true
      this.news.hasZan = true
      this.news.praisenum++
      this.chijiaohaoZanPv()
      setTimeout(() => {
        this.isAddZan = false
      }, 1000)

      // 记录点赞
      this.likesLocal.push(this.news.newsid)
      this.setLs('tagliked', this.likesLocal)
      this.$emit('hasZaned', 'zaned')
      util.callNative('ClientDataManager', 'getSystemConstant', {}, (follow) => {
        util.ajax({
          url: util.api.zanSet,
          type: 'POST',
          isJson: true,
          data: {
            appid: '21',
            _appid: util.mobileType() === 'iOS' ? 'app' : 'app_android',
            liketype: '1',
            objid: this.news.newsid,
            secobj: '',
            sessionid: follow.uniqueDeviceIMEI,
            autohomeua: this.user.userAgent,
            authorization: this.user.userAuth,
            extdata: ''
          },
          dataType: 'json',
          success: (res, xml) => {
            this.hasZan = true
          },
          fail: (status) => {}
        })
      })
    },
    // 保存到localStorage
    setLs (key, value) {
      if (!key) return
      value = (typeof value === 'string') ? value : JSON.stringify(value)
      window.localStorage.setItem(key, value)
    },
    getLs (key) {
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
      background url(../assets/zan.png) center no-repeat
      background-size 100% auto
      transform scale(1)
      animation zans 800ms linear 1 forwards
    .on-no-inmation
      background url(../assets/tag-zan.png) center no-repeat
      background-size 100% auto
    .c-add1
      position absolute
      right -13px
      z-index 99
      color #4C92FB
      animation add 800ms linear 1 forwards
  .c-num
    position absolute
    top -5px
    left 17px
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
