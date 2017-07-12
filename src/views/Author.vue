<template>
  <!-- <keep-alive></keep-alive>>   -->
  <div class="c-wp c-author">
    <div class="c-auth-top">
      <div class="c-auth-bg">
        <img imgType="headBg" v-lazy="userInfo.bgimg || defaultData.navBarImg">
      </div>
      <div class="c-auth-info">
        <div class="c-auth-head">
          <img imgType="head" class="c-auth-img" v-lazy="userInfo.userpic || defaultData.headImg">
        </div>
        <div class="c-author-intro">
          <h3 ref="authTitle" class="c-auth-title">{{userInfo.name}}</h3>
          <p class="c-auth-jj">{{userInfo.desc}}</p>
          <p class="c-auth-tips">
            <span class="c-auth-fans">{{userInfo.fanscount}}粉丝</span>
            <span class="c-auth-work">{{userInfo.publishcount}}作品</span>
          </p>
          <p v-if="!isAuthor">
            <a href="javascript:;" class="c-auth-follow" v-show="!isAttention" @click="followToggle($event, 0)"><span>＋</span> 关注</a>
            <a href="javascript:;" class="c-auth-follow on" v-show="isAttention" @click="followToggle($event, 1)">已关注</a>
          </p>
          
        </div>
        
      </div>
    </div>
    <div class="c-tab-list">
      <ul class="c-tab-title js-td c-auth-tab">
        <li :class="{on: defaultData.navIndex === index}" v-for="(item, index) in defaultData.navBar" @click="tabClick($event, index)">{{item}}</li>
      </ul>

      <div ref="jsTb" class="c-tab-bd js-tb" v-scroll="getMore">
        <ul class="c-tab-ul">
          <li v-for="(item, index) in newsList" @click.stop.prevent="toArticleDetail($event, item, index)">
            <div class="c-media-item">
              <div class="c-media-info">
                <img imgType="head" class="c-auth-img" v-lazy="userInfo.userpic || defaultData.headImg" alt="">
                <p class="c-auth-title">{{userInfo.name}}</p>
              </div>
              
              <a class="c-att-delete" v-show="isAuthor && item['iscandelete'] === 1" @click.stop="deleteNewModal(item, index, $event)"></a>
            </div>
            <div class="c-media-desc" v-if="(item.mediatype !== 4 && item.mediatype !== 1) || ( item.mediatype === 1 && item.recommendShowBigImg)">
              {{item.mediatype === 2 ? item.description : item.title}}
            </div>
            <div class="c-media-content c-media-long" v-if="item.mediatype === 1 && !item.recommendShowBigImg">
              <p>{{item.title}}</p>
              <img class="c-auth-info-img" v-lazy="item.thumbnailpics[0]" alt="" @load="resize($event)">
            </div>
            <div class="c-media-content" v-if="(item.mediatype === 1 && item.recommendShowBigImg) || (item.mediatype === 2 && item.thumbnailpics.length < 3)">
              <img class="c-auth-info-img" v-lazy="item.thumbnailpics[0]" alt="" @load="resize($event)">
            </div>

            <div class="c-media-content c-media-qing-more" v-if="item.mediatype === 2 && item.thumbnailpics.length > 3">
              <img class="c-auth-info-img" alt=""
                v-for="(img, imgIndex) in item.thumbnailpics"
                v-if="imgIndex < 3"
                v-lazy="img" 
                @load="resize($event)" 
                @click="scaleQingImg($event, item, imgIndex)"
              >
            </div>

            <div v-if="item.mediatype === 3" class="c-media-content c-media-video" @click.stop="createMedia($event, item)">
              <img class="c-auth-info-img" v-lazy="item.thumbnailpics[0]" @load="resize($event)">
              <span class="media-video-btn"></span>
              <span class="c-media-time">{{item.playtime}}</span>
            </div>

            <div v-if="item.mediatype === 4" class="c-media-audio">
              <div class="media-audio-pic" @click.stop="createMedia($event, item)">
                <img imgType="audio" class="c-auth-info-img" v-lazy="item.thumbnailpics[0]" alt="">
              </div>
              <span>
                {{item.title}}
              </span>
            </div>

            <div class="c-media-oper">
              <p>
                <span class="c-error-tip" v-if="(item['status'] === 2 || item['status'] === 100 || item['status'] === 101 ) && isAuthor ">{{item['statusStr']}}</span>
                <span class="c-looked" v-else>{{item['pv'] || 0}}{{item['mediatype'] === 3 || item['mediatype'] === 4 ? '播放' : '浏览'}}</span>

                <span class="c-media-time" v-show="item['mediatype'] === 4">{{item['playtime']}}</span>
              </p>
              <zan-and-comment :newsData="item" :user="authInfo"></zan-and-comment>
            </div>
          </li>
        </ul>
      </div>
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
import zanAndComment from '../components/zanAndComment'

export default {
  name: 'author',
  components: {
    zanAndComment
  },
  data: function () {
    return {
      defaultData: {
        navBar: ['动态', '长文', '轻文', '视频', '音频'],
        navIndex: 0,
        navBarImg: require('../assets/navbar_bg.png'),
        headImg: require('../assets/pic_head.png')
      },
      isFirstRequest: false,
      isLoad: false,
      isEmpty: false,
      isAuthor: true,
      isAttention: 0,
      isloadmore: 0,
      pageType: 4,
      lastpageid: '',
      urlUserId: util.getParam('userId'),
      authInfo: {}, // 当前用户的信息（登录者）
      userInfo: {}, // 某条消息的发布者的信息
      shareInfo: {},
      media: {},
      newsList: []
    }
  },
  mounted: function () {
    let self = this

    util.callNative('ClientDataManager', 'getNetworkState', {}, function (data) {
      // 未联网
      if (!Number(data.result)) {
        util.callNative('ClientViewManager', 'loadingFailed', {}, function () {
          util.callNative('ClientViewManager', 'showLoadingView')
          self.getPageInfo()
        })
      } else {
        util.callNative('ClientDataManager', 'getUserInfo', {}, function (user) {
          self.authInfo = user
          self.isAuthor = self.urlUserId === self.authInfo.userId
          self.pageType = self.isAuthor ? 4 : 5
          self.getPageInfo()
        })
      }
    })
    util.setViewBounces()
    self.deleteMediaWatch()
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
    getPageInfo: function () {
      let self = this
      let pid = self.lastpageid || ''
      let dt = (self.urlUserId !== self.authInfo.userId) ? 2 : 3
      let vuserid = self.urlUserId || ''

      util.ajax({
        url: util.api.newListforvuser,
        type: 'GET',
        data: {
          pm: util.mobileType() === 'iOS' ? 1 : 2,
          dt: dt, // 主客页区分  主页3，客页2
          vuserid: vuserid,
          au: self.authInfo.userAuth,
          pid: pid,
          pagesize: 20,
          otype: 0,
          itype: self.defaultData.navIndex || 0
        },
        dataType: 'json',
        success: function (res, xml) {
          res = JSON.parse(res)
          self.isLoad = false
          setTimeout(function () {
            util.callNative('ClientViewManager', 'hideLoadingView')
          }, 1500)
          if (res.result.newslist.length) {
            self.newsList = [...self.newsList, ...res.result.newslist]
          }
          if (res.result.userinfo) {
            res.result.userinfo.userpic = res.result.userinfo.userpic + '&hybridCache=1'
            if (!self.isFirstRequest) {
              self.userInfo = res.result.userinfo
            }
            self.isAttention = res.result.userinfo.isattention
            self.getLocalDataForFollow(self.newsList)
          }
          if (!self.isFirstRequest) {
            self.setImgWithBlur()
            self.navBarWatch()
          }
          self.isEmpty = !res.result.newslist.length
          self.isloadmore = res.result.isloadmore || ''
          self.lastpageid = res.result.lastid || ''
          self.isFirstRequest = true

          let pvMap = {
            'eventid': self.isAuthor ? 'chejiahao_bigvuser_pv' : 'chejiahao_mainbigvuser_pv',
            'pagename': self.isAuthor ? 'chejiahao_bigvuser' : 'chejiahao_mainbigvuser',
            'isdata': res.result.userinfo ? 1 : 0,
            'reportjson': {
              'userid1#1': self.authInfo.userId || 0,
              'userid2#2': self.urlUserId || 0
            }
          }
          util.chejiahaoPv(pvMap)
        },
        fail: function (status) {
          console.log(2222222222222)
        }
      })
    },
    getLocalDataForFollow: function (userinfo) {
      let self = this
      // 未登录
      if (!Number(self.authInfo.userId)) {
        try {
          util.callNative('ClientDataManager', 'getLocalDataForFollow', {}, function (follow) {
            // 本地数据有
            if (follow.result.length) {
              follow.result.map(function (v) {
                if (v['userId'] === Number(self.urlUserId)) {
                  console.log(v['userId'], self.urlUserId)
                  self.isAttention = 1
                }
              })
            }
          })
        } catch (e) {}
      }
    },
    // 点击删除某条信息
    deleteNewModal: function (item, index, e) {
      let self = this
      util.callNative('ClientViewManager', 'showDrawerView', {
        names: ['删除']
      }, (result) => {
        if (result.result === 0) {
          self.deleteNew(item, index, e)
        }
      })
    },
    // 删除相应的信息
    deleteNew: function (item, index, e) {
      let self = this

      util.ajax({
        url: util.api.deleteForUserSelf,
        type: 'POST',
        isJson: true,
        data: {
          _appid: util.mobileType() === 'iOS' ? 'app' : 'app_android',
          pcpopclub: self.authInfo.userAuth,
          // autohomeua: user.userAgent,
          infoId: item.newsid
        },
        dataType: 'json',
        success: function (res, xml) {
          res = JSON.parse(res)
          if (res.result === 1) {
            self.newsList.splice(index, 1)
          }
        },
        fail: function (status) {}
      })
    },
    // 高斯模糊设置
    setImgWithBlur: function () {
      let self = this
      let opt = {
        url: this.userInfo.userpic,
        set: {
          radius: util.mobileType() === 'iOS' ? 10 : 30,
          saturationdeltafactor: util.mobileType() === 'iOS' ? 1 : 1.8,
          outwidth: '375',
          leftrightmargin: '30'
        }
      }

      util.callNative('ClientImageManager', 'getImageWithBlur', opt, (result) => {
        self.userInfo.bgimg = 'data:image/jpeg;base64,' + result.result
      })
    },
    // 监听顶部导航
    navBarWatch: function (data) {
      let self = this
      let isScrollIn = false
      let isScrollOut = false

      self.setNavBar({})
      window.addEventListener('scroll', function () {
        let $scrollTop = document.body.scrollTop
        let $titleHeight = self.$refs.authTitle.clientHeight
        let $offsetTop = self.$refs.authTitle.offsetTop
        let icon1 = {
          icon1: '',
          icon1_p: ''
        }
        let info = {}
        if ($scrollTop >= ($offsetTop + $titleHeight)) {
          isScrollIn = false
          info = {
            imgurl: self.userInfo.userpic,
            title: self.userInfo.name,
            icon2: 'articleplatform_icon_share',
            icon2_p: 'articleplatform_icon_share_p',
            navigationbacktype: 1,
            statusBarStyle: 0,
            alpha: 1
          }

          let type = self.isAttention ? 1 : 0
          icon1 = {
            icon1: type ? 'articleplatform_icon_correct' : 'articleplatform_icon_add',
            icon1_p: type ? 'articleplatform_icon_correct_p' : 'articleplatform_icon_add_p'
          }

          if (!isScrollOut) {
            isScrollOut = true
            self.setNavBar(info)
          }
        } else {
          isScrollOut = false
          if (!isScrollIn) {
            isScrollIn = true
            self.setNavBar(info)
          }
        }
        self.setRightIcon(icon1)
      })
    },
    setRightIcon: function (icon, flag) {
      let self = this
      let shareInfo = self.shareInfo
      if (!self.isAuthor) {
        // if (flag !== 'icon2') {
        //   icon = self.icon1
        // }
        let $scrollTop = document.body.scrollTop
        let $titleHeight = self.$refs.authTitle.clientHeight
        let $offsetTop = self.$refs.authTitle.offsetTop
        if (flag !== 'icon2' && $scrollTop < ($offsetTop + $titleHeight)) {
          icon = {
            icon1: '',
            icon1_p: ''
          }
        }

        util.callNative('ClientNavigationManager', 'setRightIcon', {
          righticons: icon
        }, function (result) {
          if (result.result === 'icon2') {
            let opt = {
              share: {
                url: shareInfo.shareurl || '',
                title: shareInfo.sharetitle || '',
                logo: shareInfo.sharelogo || '',
                icon: shareInfo.shareicon || ' ',
                summary: shareInfo.sharesummary || ''
              },
              pagetype: 5,
              sharepositiontype: 44,
              objectid: self.authInfo.userId
            }
            util.callNative('ClientShareManager', 'shareAction', opt)
          } else {
            const type = self.isAttention ? 1 : 0
            const icon1 = true
            self.followToggle(null, type, icon1)
          }
        })
      }
    },
    setNavBar: function (info) {
      util.callNative('ClientNavigationManager', 'setNavBackIcon', {
        navigationbacktype: info.navigationbacktype || 5
      })

      util.callNative('ClientNavigationManager', 'setNavCircleIcon', {
        imgurl: info.imgurl || ''
      })

      util.callNative('ClientNavigationManager', 'setNavTitle', {
        title: info.title || ''
      })

      util.callNative('ClientNavigationManager', 'setNavAlpha', {
        alpha: info.alpha || 0
      })

      let statusBarStyle = (info.statusBarStyle === 0) ? 0 : 1
      util.callNative('ClientViewManager', 'setStatusBarStyle', {
        statusBarStyle: statusBarStyle
      })

      if (!this.isAuthor) {
        let icon2 = {
          icon2: info.icon2 || 'articleplatform_icon_share_w',
          icon2_p: info.icon2_p || 'articleplatform_icon_share_w_p'
        }
        this.setRightIcon(icon2, 'icon2')
      }
    },
    followToggle: function (e, type, icon1) {
      const info = {
        loginId: this.authInfo.userId,
        userId: this.urlUserId,
        userAuth: this.authInfo.userAuth,
        userAgent: this.authInfo.userAgent,
        objecttypeid: this.isAuthor ? 7 : 8,
        userName: this.userInfo.name,
        imgUrl: this.userInfo.userpic,
        title: this.userInfo.title || '',
        description: this.userInfo.description || ''
      }
      func.followToggle(e, type, info, icon1, this)
    },
    // tab切换
    tabClick: function (e, index) {
      this.isEmpty = false
      this.newsList = []
      this.lastpageid = ''
      this.defaultData.navIndex = index
      this.getPageInfo()
    },
    resize: function (e) {
      e.target.style.height = e.target.clientWidth * 0.5625 + 'px'
    },
    loadError: function (e) {
      e.target.onerror = null
      e.target.src = ''
    },
    createMedia: function (e, news) {
      let curTarget = e.currentTarget
      this.media = {
        mediaWidth: curTarget.offsetWidth,
        mediaHeight: curTarget.offsetHeight,
        mediaX: curTarget.firstChild.x - curTarget.clientLeft,
        mediaY: curTarget.firstChild.y - curTarget.clientTop,
        mediaId: news.mediaid,
        mediaType: news.mediatype,
        mediaTitle: news.title,
        mediaStatus: true
      }
      func.createMedia(e, news, this.media, this.pageType)
    },
    deleteMediaWatch: function () {
      var self = this
      window.addEventListener('scroll', function () {
        let offsetHeight = window.innerHeight
        let scrollTop = document.body.scrollTop
        if (self.media.mediaStatus) {
          if ((self.media.mediaHeight + self.media.mediaY) < scrollTop || (self.media.mediaY - offsetHeight > scrollTop)) {
            self.media.mediaStatus = false
            if (self.media.mediaType === 3) {
              util.callNative('ClientVideoManager', 'deleteById', {
                mediaid: self.media.mediaId
              })
            }
          }
        }
      })
    },
    getMore: function () {
      if (!this.isLoad) {
        func.deleteMedia(this.media)
        if (this.isloadmore) {
          this.isLoad = true
          this.getPageInfo()
        }
      }
    },
    scaleQingImg: function (e, news, index) {
      let data = {
        index: index,
        newsid: news.newsid,
        pics: news.pics,
        sharecontent: news.description,
        seriesids: news.seriesids,
        pageType: 5
      }
      func.scaleQingImg(e, data)
    },
    toAuthorPage: function (e, news) {
      func.toAuthorPage(e, news.userid, this.authInfo.userId)
    },
    toArticleDetail: function (e, item, index) {
      let data = {
        loginId: this.authInfo.userId,
        newsId: item.newsid,
        mediaId: item.mediaid,
        mediaType: item.mediatype,
        position: index + 1
      }

      func.toArticleDetail(e, data)
    }
  }
}
</script>

<style lang="stylus" scoped>
.c-auth-top
  .c-auth-bg
    width 100%
    height 6rem
    &:after
      content ''
      position fixed
      top 0
      left 0
      z-index 10
      width 100%
      height 3.2rem
      background url(../assets/layer.png) no-repeat
      background-size 100% 100%
    img
      width 100%
      height 100%
  .c-auth-info
    text-align center
    position relative
    .c-auth-head
      width 3rem
      height 3rem
      position absolute
      top -44px
      text-align center
      margin auto
      left 0
      right 0
      img
        width 100%
        border 1px solid rgba(238,238,238,.3)
        border-radius 50%
        background url(../assets/pic_head.png) no-repeat
        background-color #fff
        background-size 100% 100%
        background-clip padding-box
        overflow hidden
        
  .c-author-intro
    padding 26px 20px 15px
    text-align center
    h3
      font-size 17px
      color #333
      font-weight 400
      margin 0
    .c-auth-jj 
      font-size 12px
      color #666
      line-height 16px
      margin 7px 0
    .c-auth-tips span
      font-size 12px
      margin 0 20px
      &:first-of-type
        margin 0
        &:after
          content ''
          width 1px
          height 12px
          background #333
          display inline-block
          margin-left 20px
          vertical-align -2px
  .c-auth-follow
    display block
    width 105px
    height 32px
    line-height 32px
    margin auto
    margin-top: 15px;
    border 1px solid #2873ff
    color #2873ff
    text-decoration none
    font-size .6rem
    &.on
      color #ccc
      border 1px solid #eee
    
    span
      font-size .7rem

.c-tab-list 
  border-top .5rem solid #F8F8F8
 
</style>
