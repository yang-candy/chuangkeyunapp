<template>
  <!-- <keep-alive></keep-alive>>   -->
  <div class="c-wp c-author" v-show="isLoaded">
    <!-- <div class="c-auth-top">
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
            <a href="javascript:;" class="c-auth-follow" v-show="!isAttention" @click.stop="followToggle($event, 0)"><span>＋</span> 关注</a>
            <a href="javascript:;" class="c-auth-follow on" v-show="isAttention" @click.stop="followToggle($event, 1)">已关注</a>
          </p>
          
        </div>
        
      </div>
    </div> -->
    <div class="c-tab-list" ref="tabList">
      <!-- <ul class="c-tab-title" ref="tabBar">
        <li :class="{on: tabIndex === index}" v-for="(item, index) in defaultData.navBar" @click.stop="tabClick($event, index)">{{item}}</li>
      </ul> -->

      <div ref="jsTb" v-scroll="getMore">
        <ul class="c-tab-ul">
          <li v-for="(item, index) in dataList" @click.stop.prevent="toArticleDetail($event, item, index)">
            <div class="c-media-item">
              <div class="c-media-info" @click.stop="toAuthorPage($event, item)">
                <img imgType="head" class="c-auth-img" v-lazy="userInfo.userpic || defaultData.headImg" alt="">
                <p class="c-auth-title">{{userInfo.name}}</p>
              </div>
              
              <a class="c-att-delete" v-show="isAuthor && item['iscandelete'] === 1" @click.stop="deleteNewModal(item, index, $event)"></a>
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
              <div class="c-media-img" v-show="item.thumbnailpics.length">
                <img imgType="article" v-lazy="item.thumbnailpics[0]" alt="">
              </div>
            </div>
            <div class="c-media-content" v-else-if="item.mediatype === 2 && item.thumbnailpics.length >= 3">
              <div class="c-media-desc" :class="{'c-media-qing': item.mediatype === 2}">
                {{item.mediatype === 2 ? item.description : item.title}}
              </div>
              <div class="c-media-img c-media-qing-more" v-show="item.thumbnailpics.length">
                <img imgType="article" class="c-auth-info-img c-auth-audio-img" alt=""
                  v-for="(img, imgIndex) in item.thumbnailpics"
                  v-if="imgIndex < 3"
                  v-lazy="img" 
                  @click.stop="scaleQingImg(item, imgIndex)"
                >
                <span class="c-qing-num" v-show="item.thumbnailpics.length > 3">{{item.thumbnailpics.length}}</span>
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
                <span class="c-error-tip" v-if="(item['status'] === 2 || item['status'] === 100 || item['status'] === 101 ) && isAuthor ">{{item['statusStr']}}</span>
                <span class="c-looked" v-else>{{item['pv'] || 0}}{{item['mediatype'] === 3 || item['mediatype'] === 4 ? '播放' : '浏览'}}</span>

                <span class="c-media-time" v-show="item['mediatype'] === 4">{{item['playtime']}}</span>
              </p>
              <zan-and-comment :newsData="item" :user="loginInfo" :media="media" @hasZaned="hasZaned"></zan-and-comment>
            </div>
          </li>
        </ul>
      </div>
      <div class="c-loading" v-show="isLoad">
        <span class="loading-icon"></span> 
        <p>加载中...</p>
      </div>
    </div>
    <div class="c-empty" v-show="isEmpty" ref="emptyEle"> 
      <p><img src="../assets/pic_empty.png"><br>暂无内容</p>
    </div>
  </div>
</template>

<script>
import * as func from '../util/index.js'
import * as util from '../util/util.js'
import zanAndComment from '../components/zanAndComment'

export default {
  name: 'author',
  components: {
    zanAndComment
  },
  data () {
    return {
      defaultData: {
        navBar: ['动态', '长文', '轻文', '视频', '音频'],
        navBarImg: require('../assets/navbar_bg.png'),
        headImg: require('../assets/pic_head.png')
      },
      tabIndex: 0,
      isFirst: false,
      hasRequest: false,
      isLoaded: false,
      isLoad: false,
      isEmpty: false,
      isAuthor: true,
      isAttention: 0,
      pageType: 4,
      urlUserId: util.getParam('userId'),
      loginInfo: {}, // 当前用户的信息（登录者）
      userInfo: {}, // 某条消息的发布者的信息
      shareInfo: {},
      media: {},
      isloadmore: [0, 0, 0, 0, 0],
      lastpageid: ['', '', '', '', ''],
      dataList: [],
      newsList: [[], [], [], [], []]
    }
  },
  directives: { // 自定义指令
    scroll: {
      bind (el, binding) {
        window.addEventListener('scroll', () => {
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
  mounted () {
    util.callNative('ClientDataManager', 'getUserInfo', {}, (user) => {
      this.loginInfo = user
      this.isAuthor = Number(this.urlUserId) === Number(this.loginInfo.userId)
      this.pageType = this.isAuthor ? 4 : 5
      this.isFirst = true
      this.setTabBar()
    })
    // util.setViewBounces()
    this.deleteMediaWatch()
    this.registerNotice()
  },
  methods: {
    // tab切换
    tabClick (e, index) {
      this.isEmpty = false
      this.isLoad = false
      if (this.tabIndex === index) {
        return
      }
      this.dataList = []
      // this.newsList = []
      // this.lastpageid = ''
      this.tabIndex = index
      func.deleteMedia(this.media)
      setTimeout(() => {
        if (!this.newsList[this.tabIndex].length) {
          this.getPageList(index)
        } else {
          this.dataList = this.newsList[this.tabIndex]
        }
      }, 0)
    },
    // tab切换调用native返回相应的index
    setTabBar () {
      if (this.tabIndex === Number(util.getParam('index')) && !this.isFirst) {
        return
      }
      this.isLoad = false
      this.isEmpty = false
      this.isFirst = false
      this.dataList = []
      this.tabIndex = Number(util.getParam('index'))
      func.deleteMedia(this.media)

      setTimeout(() => {
        if (!this.newsList[this.tabIndex].length) {
          this.getPageList(this.tabIndex)
        } else {
          this.dataList = this.newsList[this.tabIndex]
        }
      }, 0)
      // util.callNative('ClientViewManager', 'setTitleLabelCallback', {}, (index) => {
      //   if (this.tabIndex === Number(index.index) && !this.isFirst) {
      //     return
      //   }
      //   this.isLoad = false
      //   this.isEmpty = false
      //   this.isFirst = false
      //   this.dataList = []
      //   // this.newsList = []
      //   // this.lastpageid = ''
      //   // document.body.scrollTop = 0
      //   this.tabIndex = Number(index.index)
      //   func.deleteMedia(this.media)
      //   // this.getPageList(Number(index.index))

      //   setTimeout(() => {
      //     if (!this.newsList[this.tabIndex].length) {
      //       // this.getPageList(index)
      //       this.getPageList(Number(index.index))
      //     } else {
      //       this.dataList = this.newsList[this.tabIndex]
      //     }
      //   }, 0)
      // })
    },
    // 注册全局通知（点赞）
    registerNotice () {
      util.callNative('ClientNoticeManager', 'registerNotice', {
        keys: ['kNotification_yc_followNotification', 'kNotification_yc_praiseNotification']
      }, (result) => {
        if (this.newsList.length && result.key === 'kNotification_yc_praiseNotification') {
          this.newsList.map((news, index) => {
            if (news.length) {
              news.map((v) => {
                if (Number(result.args.newsid) === Number(v['newsid'])) {
                  v['hasZan'] = true
                }
              })
            }
          })
        }
      })
    },
    getPageList (index) {
      let pid = this.lastpageid[this.tabIndex] || ''
      let dt = this.isAuthor ? 3 : 2
      let vuserid = this.urlUserId || ''
      index = index || this.tabIndex
      util.ajax({
        url: util.api.newListforvuser,
        type: 'GET',
        data: {
          pm: util.mobileType() === 'iOS' ? 1 : 2,
          dt: dt, // 主客页区分  主页3，客页2
          vuserid: vuserid,
          au: this.loginInfo.userAuth,
          pid: pid,
          pagesize: 20,
          otype: 0,
          itype: this.tabIndex || 0
        },
        dataType: 'json',
        success: (res, xml) => {
          if (Number(this.tabIndex) !== Number(index)) {
            return
          }
          res = JSON.parse(res)
          this.isLoad = false
          this.isLoaded = true
          util.callNative('ClientViewManager', 'hideLoadingView')
          if (!res.result) {
            return
          }
          if (res.result.newslist.length) {
            this.newsList[this.tabIndex] = this.newsList[this.tabIndex].concat(res.result.newslist)
            this.hasZaned()
            this.dataList = this.newsList[this.tabIndex]
          }
          if (res.result.userinfo) {
            // res.result.userinfo.userpic = res.result.userinfo.userpic + '&hybridCache=1'
            if (!this.hasRequest) {
              this.userInfo = res.result.userinfo
              this.shareInfo = res.result.shareinfo
              // this.isAttention = res.result.userinfo.isattention
              // this.getLocalDataForFollow()
              // this.setImgWithBlur()
              // this.navBarWatch()
            }
          }
          this.isEmpty = !this.newsList[this.tabIndex].length
          this.isloadmore[this.tabIndex] = res.result.isloadmore || 0
          this.lastpageid[this.tabIndex] = res.result.lastid || ''
          this.hasRequest = true
          // setTimeout(() => {
          //   if (this.isEmpty) {
          //     this.setEmpty()
          //   }
          // }, 0)
          const pvMap = {
            'eventid': this.isAuthor ? 'chejiahao_bigvuser_pv' : 'chejiahao_mainbigvuser_pv',
            'pagename': this.isAuthor ? 'chejiahao_bigvuser' : 'chejiahao_mainbigvuser',
            'isdata': res.result.userinfo ? 1 : 0,
            'reportjson': {
              'userid1#1': this.loginInfo.userId || 0,
              'userid2#2': this.urlUserId || 0
            }
          }
          util.chejiahaopagePv(pvMap)
        },
        fail: (status) => {
          this.isLoad = false
          util.callNative('ClientViewManager', 'hideLoadingView')
          util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
            util.callNative('ClientViewManager', 'showLoadingView')
            this.getPageList()
          })
        }
      })
    },
    hasZaned (value) {
      // 判断赞
      const likes = this.getLs('tagliked')
      if (likes && likes.length) {
        likes.map((j) => {
          this.newsList.map((news, index) => {
            if (news.length) {
              news.map((v) => {
                if (j === v['newsid']) {
                  v['hasZan'] = true
                }
              })
            }
          })
        })
      }
    },
    getLs (key) {
      if (!key) return
      var value = window.localStorage.getItem(key)
      return JSON.parse(value)
    },
    // 点击删除某条信息
    deleteNewModal (item, index, e) {
      util.callNative('ClientViewManager', 'showDrawerView', {
        names: ['删除']
      }, (result) => {
        if (Number(result.result) === 0) {
          this.deleteNew(item, index, e)
        }
      })
    },
    // 删除相应的信息
    deleteNew (item, index, e) {
      util.ajax({
        url: util.api.deleteForUserSelf,
        type: 'POST',
        isJson: true,
        data: {
          _appid: util.mobileType() === 'iOS' ? 'app' : 'app_android',
          pcpopclub: this.loginInfo.userAuth,
          infoId: item.newsid
        },
        dataType: 'json',
        success: (res, xml) => {
          res = JSON.parse(res)
          if (res.result === 1) {
            func.deleteMedia(this.media)
            if (this.tabIndex) {
              this.newsList[0].map((item2, index2) => {
                if (item2.newsid === item.newsid) {
                  this.newsList[0].splice(index2, 1)
                }
              })
            }
            this.dataList.splice(index, 1)
            this.isEmpty = !this.dataList.length
            // setTimeout(() => {
            //   if (this.isEmpty) {
            //     this.setEmpty()
            //   }
            // }, 0)
          }
        },
        fail: (status) => {}
      })
    },
    resize (e) {
      e.target.style.height = e.target.clientWidth * 0.5625 + 'px'
    },
    setEmpty () {
      let winHeight = window.innerHeight
      let offsetHeight = this.$refs.tabList.clientHeight
      let offsetTop = this.$refs.tabList.offsetTop
      let emptyHeight = winHeight - offsetHeight - offsetTop
      this.$refs.emptyEle.style.height = emptyHeight + 'px'
    },
    loadError (e) {
      e.target.onerror = null
      e.target.src = ''
    },
    createMedia (e, news) {
      const curTarget = e.currentTarget
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
    deleteMediaWatch () {
      window.addEventListener('scroll', () => {
        const offsetHeight = window.innerHeight
        const scrollTop = document.body.scrollTop
        const titleHeight = this.$refs.tabBar.clientHeight
        if (this.media.mediaStatus) {
          if ((this.media.mediaHeight + this.media.mediaY - titleHeight) < scrollTop || (this.media.mediaY - offsetHeight > scrollTop)) {
            this.media.mediaStatus = false
            if (this.media.mediaType === 3) {
              util.callNative('ClientVideoManager', 'deleteById', {
                mediaid: this.media.mediaId
              })
            }
          }
        }
      })
    },
    getMore () {
      if (!this.isLoad) {
        this.isEmpty = false
        func.deleteMedia(this.media)
        if (this.isloadmore[this.tabIndex]) {
          this.isLoad = true
          this.getPageList()
        }
      }
    },
    scaleQingImg (news, index) {
      const data = {
        index: index,
        newsid: news.newsid,
        pics: news.pics,
        sharecontent: news.description,
        seriesids: news.seriesids,
        pageType: 5
      }
      func.scaleQingImg(data)
    },
    toAuthorPage (e, news) {
      return
    },
    toArticleDetail (e, item, index) {
      const data = {
        loginId: this.loginInfo.userId,
        newsId: item.newsid,
        mediaId: item.mediaid,
        mediaType: item.mediatype,
        position: index + 1
      }

      func.toArticleDetail(e, data)
    },
    getLocalDataForFollow () {
      // 未登录
      if (!Number(this.loginInfo.userId)) {
        try {
          util.callNative('ClientDataManager', 'getLocalDataForFollow', {}, (follow) => {
            // 本地数据有
            if (follow.result.length) {
              follow.result.map((v) => {
                if (v['userId'] === Number(this.urlUserId)) {
                  this.isAttention = 1
                }
              })
            }
          })
        } catch (e) {}
      }
    },
    // 高斯模糊设置
    setImgWithBlur () {
      const opt = {
        url: this.userInfo.userpic,
        set: {
          radius: util.mobileType() === 'iOS' ? 10 : 30,
          saturationdeltafactor: util.mobileType() === 'iOS' ? 1 : 1.8,
          outwidth: '375',
          leftrightmargin: '30'
        }
      }

      util.callNative('ClientImageManager', 'getImageWithBlur', opt, (result) => {
        this.userInfo.bgimg = 'data:image/jpeg;base64,' + result.result
      })
    },
    // 监听顶部导航
    navBarWatch (data) {
      let isScrollIn = false
      let isScrollOut = false

      this.setNavBar({})
      window.addEventListener('scroll', () => {
        let $scrollTop = document.body.scrollTop
        let $titleHeight = this.$refs.authTitle.clientHeight
        let $offsetTop = this.$refs.authTitle.offsetTop
        let icon1 = {
          icon1: '',
          icon1_p: ''
        }
        let info = {}
        if ($scrollTop >= ($offsetTop + $titleHeight)) {
          isScrollIn = false
          info = {
            imgurl: this.userInfo.userpic,
            title: this.userInfo.name,
            icon2: 'articleplatform_icon_share',
            icon2_p: 'articleplatform_icon_share_p',
            navigationbacktype: 1,
            statusBarStyle: 0,
            alpha: 1
          }

          let type = this.isAttention ? 1 : 0
          icon1 = {
            icon1: type ? 'articleplatform_icon_correct' : 'articleplatform_icon_add',
            icon1_p: type ? 'articleplatform_icon_correct_p' : 'articleplatform_icon_add_p'
          }

          if (!isScrollOut) {
            isScrollOut = true
            this.setNavBar(info)
          }
        } else {
          isScrollOut = false
          if (!isScrollIn) {
            isScrollIn = true
            this.setNavBar(info)
          }
        }
        this.setRightIcon(icon1)
      })
    },
    setRightIcon (icon, flag) {
      let shareInfo = this.shareInfo
      if (!this.isAuthor) {
        let $scrollTop = document.body.scrollTop
        let $titleHeight = this.$refs.authTitle.clientHeight
        let $offsetTop = this.$refs.authTitle.offsetTop
        if (flag !== 'icon2' && $scrollTop < ($offsetTop + $titleHeight)) {
          icon = {
            icon1: '',
            icon1_p: ''
          }
        }

        util.callNative('ClientNavigationManager', 'setRightIcon', {
          righticons: icon
        }, (result) => {
          if (result.result === 'icon2') {
            const opt = {
              share: {
                url: shareInfo.shareurl || '',
                title: shareInfo.sharetitle || '',
                logo: shareInfo.sharelogo || '',
                icon: shareInfo.shareicon || ' ',
                summary: shareInfo.sharesummary || ''
              },
              pagetype: 5,
              sharepositiontype: 44,
              objectid: this.urlUserId
            }
            util.callNative('ClientShareManager', 'shareAction', opt)
          } else {
            const type = this.isAttention ? 1 : 0
            const icon1 = true
            this.followToggle(null, type, icon1)
          }
        })
      }
    },
    setNavBar (info) {
      util.callNative('ClientNavigationManager', 'setNavBackIcon', {
        navigationbacktype: info.navigationbacktype || 5
      })
      // util.callNative('ClientNavigationManager', 'setNavCircleIcon', {
      //   imgurl: info.imgurl || ''
      // })
      util.callNative('ClientNavigationManager', 'setNavTitle', {
        title: info.title || ''
      })

      util.callNative('ClientNavigationManager', 'setNavAlpha', {
        alpha: info.alpha || 0
      })

      const statusBarStyle = (info.statusBarStyle === 0) ? 0 : 1
      util.callNative('ClientViewManager', 'setStatusBarStyle', {
        statusBarStyle: statusBarStyle
      })

      if (!this.isAuthor) {
        const icon2 = {
          icon2: info.icon2 || 'articleplatform_icon_share_w',
          icon2_p: info.icon2_p || 'articleplatform_icon_share_w_p'
        }
        this.setRightIcon(icon2, 'icon2')
      }
    },
    followToggle (e, type, icon1) {
      const info = {
        loginId: this.loginInfo.userId,
        userId: this.urlUserId,
        userAuth: this.loginInfo.userAuth,
        userAgent: this.loginInfo.userAgent,
        objecttypeid: this.isAuthor ? 7 : 8,
        userName: this.userInfo.name,
        imgUrl: this.userInfo.userpic,
        title: this.userInfo.title || '',
        description: this.userInfo.description || ''
      }
      func.followToggle(e, type, info, icon1, this)
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
        height 100%
        border 1px solid rgba(238,238,238,.3)
        border-radius 50%
        // background url(../assets/pic_head.png) no-repeat
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

// .c-tab-list 
//   border-top .5rem solid #F8F8F8
.c-error-tip
  color #f00
.c-author
  display block
</style>
