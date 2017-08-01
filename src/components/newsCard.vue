<template>
<ul class="c-tab-ul">
  <li v-for="(item, index) in dataList" @click.stop.prevent="toArticleDetail(item, index)">
    <div class="c-media-item">
      <div class="c-media-info" @click.stop="toAuthorPage(item)">
        <img imgType="head" class="c-auth-img" alt="" v-lazy="item.userpic">
        <p class="c-auth-title">{{item.username}}</p>
      </div>
      <follow-toggle :noAttention="true" :objecttypeid="2" :attention="item.isattention" :newsData="item" :loginInfo="loginInfo"></follow-toggle>
    </div>
    <div class="c-media-content c-media-long" v-if="item.mediatype === 1 && !item.recommendShowBigImg">
      <p>{{item.title}}</p>
      <img imgType="article" v-lazy="item.thumbnailpics[0]" alt="">
    </div>
    <div class="c-media-content" v-else-if="item.mediatype === 1 && item.recommendShowBigImg">
      <div class="c-media-desc">
        {{item.mediatype === 2 ? item.description : item.title}}
      </div>
      <div class="c-media-img">
        <img imgType="article" v-lazy="item.thumbnailpics[0]" alt="">
      </div>
    </div>

    <div class="c-media-content" v-else-if="item.mediatype === 2 && item.thumbnailpics.length < 3">
      <div class="c-media-desc" :class="{'c-media-qing': item.mediatype === 2}">
        {{item.mediatype === 2 ? item.description : item.title}}
      </div>
      <div class="c-media-img">
        <img imgType="article" v-lazy="item.thumbnailpics[0]" alt="">
      </div>
    </div>
    <div class="c-media-content" v-else-if="item.mediatype === 2 && item.thumbnailpics.length > 3">
      <div class="c-media-desc" :class="{'c-media-qing': item.mediatype === 2}">
        {{item.mediatype === 2 ? item.description : item.title}}
      </div>
      <div class="c-media-img c-media-qing-more">
        <img imgType="article" class="c-auth-info-img c-auth-audio-img" alt=""
          v-for="(img, imgIndex) in item.thumbnailpics"
          v-if="imgIndex < 3"
          v-lazy="img" 
          @click="scaleQingImg($event, item, imgIndex)"
        >
      </div>
    </div>
    <div v-else-if="item.mediatype === 3" class="c-media-content c-media-video">
      <div class="c-media-desc" :class="{'c-media-qing': item.mediatype === 2}">
        {{item.mediatype === 2 ? item.description : item.title}}
      </div>
      <div class="c-media-img c-media-video" @click.stop="createMedia($event, item)">
        <img imgType="article" v-lazy="item.thumbnailpics[0]">
        <span class="media-video-btn"></span>
        <span class="c-media-time">{{item.playtime}}</span>
      </div>
    </div>
    <div v-else-if="item.mediatype === 4" class="c-media-audio">
      <div class="media-audio-pic" @click.stop="createMedia($event, item)">
        <img imgType="audio" class="c-auth-info-img c-auth-audio-img" v-lazy="item.thumbnailpics[0]" alt="">
      </div>
      <span>
        {{item.title}}
      </span>
    </div>
  
    <div class="c-media-oper">
      <p>
        <span class="c-looked">{{item['pv'] || 0}}{{item['mediatype'] === 3 || item['mediatype'] === 4 ? '播放' : '浏览'}}</span>

        <span class="c-media-time" v-show="item['mediatype'] === 4">{{item['playtime']}}</span>
      </p>
      <zan-and-comment :newsData="item" :user="loginInfo"></zan-and-comment>
    </div>
  </li>
</ul>
</template>

<script>
import * as util from '../util/util.js'
import zanAndComment from './zanAndComment'
import followToggle from '../components/followToggle'

export default{
  props: ['dataList', 'loginInfo'],
  components: {
    zanAndComment,
    followToggle
  },
  data () {
    return {
      hasZan: false,
      isAddZan: false,
      likesLocal: [],
      datasList: {
        'result': {
          'isloadmore': 1,
          'lastid': '2017-01-05 15:42:09023|89843',
          'newslist': [{
            'content': '',
            'description': '保时捷Macan漏油隐患波及奥迪，24万台Q5、Q7将被召回/',
            'identifiertype': '',
            'imageheight': 0,
            'imagewidth': 0,
            'isattention': 0,
            'iscandelete': 0,
            'mediaid': '333',
            'mediatype': 1,
            'recommendShowBigImg': 0,
            'newsid': 101175,
            'pics': [],
            'playtime': '',
            'praisenum': 0,
            'publishtime': '2017-05-16',
            'pv': 159,
            'replycount': '4',
            'seriesids': '',
            'session_id': 'f86b69c046d34ebca5ccb9e19918b4ea',
            'status': 0,
            'statusNote': '',
            'statusStr': '',
            'thumbnailpics': ['https://qnwww2.autoimg.cn/youchuang/g14/M15/A2/5D/autohomecar__wKjByVkaav6AODgqAAJh9Is28Mg542.png?imageView2/1/w/400/h/225'],
            'title': '保时捷Macan漏油隐患波及奥迪，24万台Q5、Q7将被召回',
            'userid': 39356249,
            'username': '汽车评中评',
            'userpic': 'https://qnwww2.autoimg.cn/youchuang/g9/M11/54/73/autohomecar__wKjBzljsQ52AWTKgAADEllW0O8w133.jpg?imageView2/1/w/120/h/120'
          }, {
            'content': '',
            'description': '保时捷Macan漏油隐患波及奥迪，24万台Q5、Q7将被召回/',
            'identifiertype': '',
            'imageheight': 0,
            'imagewidth': 0,
            'isattention': 0,
            'iscandelete': 0,
            'mediaid': '333',
            'mediatype': 1,
            'recommendShowBigImg': 1,
            'newsid': 101175,
            'pics': [],
            'playtime': '',
            'praisenum': 0,
            'publishtime': '2017-05-16',
            'pv': 159,
            'replycount': '4',
            'seriesids': '',
            'session_id': 'f86b69c046d34ebca5ccb9e19918b4ea',
            'status': 0,
            'statusNote': '',
            'statusStr': '',
            'thumbnailpics': ['https://qnwww2.autoimg.cn/youchuang/g14/M15/A2/5D/autohomecar__wKjByVkaav6AODgqAAJh9Is28Mg542.png?imageView2/1/w/400/h/225'],
            'title': '保时捷Macan漏油隐患波及奥迪，24万台Q5、Q7将被召回',
            'userid': 39356249,
            'username': '汽车评中评',
            'userpic': 'https://qnwww2.autoimg.cn/youchuang/g9/M11/54/73/autohomecar__wKjBzljsQ52AWTKgAADEllW0O8w133.jpg?imageView2/1/w/120/h/120'
          }, {
            'content': '',
            'description': '',
            'identifiertype': '',
            'imageheight': 0,
            'imagewidth': 0,
            'indexdetail': [],
            'isattention': 1,
            'iscandelete': 1,
            'mediaid': '04D323D5A73A6932',
            'mediatype': 4,
            'newsid': 195275,
            'pics': [],
            'playtime': '02:18',
            'praisenum': '',
            'publishtime': '2017-05-22',
            'pv': '4',
            'replycount': '',
            'seriesids': '',
            'session_id': '11',
            'status': 0,
            'statusNote': '',
            'statusStr': '待审核',
            'thumbnailpics': [
              'https://qnwww2.autoimg.cn/youchuang/g11/M0B/07/98/autohomecar__wKgH0liix22Acy7HAA7qxSaViaI155.jpg?imageView2/1/w/400/h/225'
            ],
            'title': '大有进步 全新宝马5系IIHS 25%碰撞解析！！！',
            'userid': 0,
            'username': '汽车评中评',
            'userpic': ''
          }, {
            'content': '',
            'identifiertype': '',
            'imageheight': 0,
            'imagewidth': 0,
            'indexdetail': [],
            'isattention': 0,
            'iscandelete': 0,
            'mediaid': '',
            'mediatype': 2,
            'newsid': 101380,
            'pics': [
              'https://qnwww2.autoimg.cn/youchuang/g12/M09/9F/E9/autohomecar__wKgH01kbPDuAI3xSAAGNMMeSgqk414.jpg?imageView2/2/w/640',
              'https://qnwww2.autoimg.cn/youchuang/g12/M0C/A9/7B/autohomecar__wKgH4lkbPFSAActaAAF5vXvNJdU798.jpg?imageView2/2/w/640',
              'https://qnwww2.autoimg.cn/youchuang/g12/M09/9F/E9/autohomecar__wKgH01kbPDuAI3xSAAGNMMeSgqk414.jpg?imageView2/2/w/640',
              'https://qnwww2.autoimg.cn/youchuang/g12/M0C/A9/7B/autohomecar__wKgH4lkbPFSAActaAAF5vXvNJdU798.jpg?imageView2/2/w/640'
            ],
            'playtime': '',
            'praisenum': 31,
            'publishtime': '2017-05-17',
            'pv': '',
            'replycount': '23',
            'seriesids': 'ss',
            'session_id': '81dd865770894ab3bd0b41b1c918c770',
            'status': 1,
            'statusNote': '',
            'statusStr': '正常',
            'thumbnailpics': [
              'https://qnwww2.autoimg.cn/youchuang/g12/M09/9F/E9/autohomecar__wKgH01kbPDuAI3xSAAGNMMeSgqk414.jpg?imageView2/2/w/640',
              'https://qnwww2.autoimg.cn/youchuang/g12/M0C/A9/7B/autohomecar__wKgH4lkbPFSAActaAAF5vXvNJdU798.jpg?imageView2/2/w/640',
              'https://qnwww2.autoimg.cn/youchuang/g12/M09/9F/E9/autohomecar__wKgH01kbPDuAI3xSAAGNMMeSgqk414.jpg?imageView2/2/w/640',
              'https://qnwww2.autoimg.cn/youchuang/g12/M0C/A9/7B/autohomecar__wKgH4lkbPFSAActaAAF5vXvNJdU798.jpg?imageView2/2/w/640'
            ],
            'title': '大有进步 全新宝马5系IIHS 25%碰撞解',
            'description': '大有进步 全新宝马5系IIHS 25%碰撞解',
            'userid': 0,
            'username': '汽车评中评',
            'userpic': 'https://qnwww2.autoimg.cn/youchuang/g9/M11/54/73/autohomecar__wKjBzljsQ52AWTKgAADEllW0O8w133.jpg?imageView2/1/w/120/h/120'
          }, {
            'content': '',
            'description': '',
            'identifiertype': '',
            'imageheight': 0,
            'imagewidth': 0,
            'indexdetail': [],
            'isattention': 0,
            'iscandelete': 0,
            'mediaid': '8D3C26C16C397BD8',
            'mediatype': 2,
            'newsid': 91996,
            'pics': [],
            'playtime': '05:35',
            'praisenum': 1140,
            'publishtime': '2017-02-14',
            'pv': 0,
            'replycount': '459',
            'seriesids': '',
            'session_id': '95c3ac2b44294fc1939f9e43a8173651',
            'status': 1,
            'statusNote': '',
            'statusStr': '正常',
            'thumbnailpics': [
              'https://qnwww2.autoimg.cn/youchuang/g11/M0B/07/98/autohomecar__wKgH0liix22Acy7HAA7qxSaViaI155.jpg?imageView2/1/w/400/h/225'
            ],
            'title': '请放开那个座椅加热！曾经加价9万的2014款路虎揽胜运动',
            'userid': 0,
            'username': '汽车评中评',
            'userpic': ''
          }, {
            'content': '',
            'description': '',
            'identifiertype': '',
            'imageheight': 0,
            'imagewidth': 0,
            'indexdetail': [],
            'isattention': 0,
            'iscandelete': 0,
            'mediaid': 'E071119BD7F5DB1D',
            'mediatype': 1,
            'newsid': 91629,
            'pics': [
              'https://qnwww2.autoimg.cn/newsdfs/g14/M13/02/F1/autohomecar__wKgH5FibDYOAYlqtAAFoxOZNEZs882.jpg?imageView2/2/w/640'
            ],
            'playtime': '04:14',
            'praisenum': 1016,
            'publishtime': '2017-02-08',
            'pv': 0,
            'replycount': '479',
            'seriesids': '3845',
            'session_id': 'ff988206578f46c387412282dfe11ee1',
            'status': 1,
            'statusNote': '编辑待审核',
            'statusStr': '正常',
            'thumbnailpics': [
              'https://qnwww2.autoimg.cn/newsdfs/g14/M13/02/F1/autohomecar__wKgH5FibDYOAYlqtAAFoxOZNEZs882.jpg?imageView2/1/w/400/h/225'
            ],
            'title': '听说这是个看脸讲情怀的世界？唠唠国产指南者1.4T',
            'userid': 0,
            'username': '汽车评中评',
            'userpic': 'https://qnwww2.autoimg.cn/youchuang/g9/M11/54/73/autohomecar__wKjBzljsQ52AWTKgAADEllW0O8w133.jpg?imageView2/1/w/120/h/120'
          }, {
            'content': '',
            'description': '',
            'identifiertype': '',
            'imageheight': 0,
            'imagewidth': 0,
            'indexdetail': [],
            'isattention': 0,
            'iscandelete': 0,
            'mediaid': '6BADDEEFC8FE6F43',
            'mediatype': 3,
            'newsid': 90675,
            'pics': [
              'https://qnwww2.autoimg.cn/youchuang/g12/M12/F3/82/autohomecar__wKjBy1h_VACABUh9AAw6Ln_Kdeg162.jpg?imageView2/2/w/640'
            ],
            'playtime': '03:54',
            'praisenum': 1552,
            'publishtime': '2017-01-18',
            'pv': 0,
            'replycount': '563',
            'seriesids': '',
            'session_id': '8b798432f39c4dbb9ff194e9676d24ee',
            'status': 1,
            'statusNote': '',
            'statusStr': '正常',
            'thumbnailpics': [
              'https://qnwww2.autoimg.cn/youchuang/g12/M12/F3/82/autohomecar__wKjBy1h_VACABUh9AAw6Ln_Kdeg162.jpg?imageView2/1/w/400/h/225'
            ],
            'title': '别再加价买丰田埃尔法了！开车如开房的奔驰V260',
            'userid': 0,
            'username': '汽车评中评',
            'userpic': 'https://qnwww2.autoimg.cn/youchuang/g9/M11/54/73/autohomecar__wKjBzljsQ52AWTKgAADEllW0O8w133.jpg?imageView2/1/w/120/h/120'
          }]
        }
      }
    }
  },
  computed: {
    list () {
      return this.dataList
    }
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
      if (!this.user.userId) {
        util.callNative('ClientViewManager', 'login', {}, (res) => {
          if (res.result === 1) {
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
      this.news.praisenum++

      this.chijiaohaoZanPv()
      setTimeout(() => {
        this.isAddZan = false
      }, 1000)

      // 记录点赞
      this.likesLocal.push(this.news.newsid)
      this.setLs('tagliked', this.likesLocal)

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
          fail: (status) => {
            this.hasZan = false
          }
        })
      })
    },
    // 保存到localStorage
    setLs (key, value) {
      if (!key) return
      value = (typeof value === 'string') ? value : JSON.stringify(value)
      window.localStorage.setItem(key, value)
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
