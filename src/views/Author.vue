<template>
  <div class="c-wp">
    <div class="c-tab-list" ref="tabList">
      <div ref="jsTb" v-scroll="getMore">
        <ul class="c-tab-ul">
          <li v-for="(item, index) in newsList" @click.stop.prevent="toArticleDetail($event, item, index)">
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
              <div class="c-media-img" v-if="item.thumbnailpics.length">
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
              <span class="c-media-desc">
                {{item.title}}
              </span>
            </div>

            <div class="c-media-oper">
              <p>
                <span class="c-error-tip" v-if="(item['status'] === 2 || item['status'] === 100 || item['status'] === 101 ) && isAuthor ">{{item['statusStr']}}</span>
                <span class="c-looked" v-else>{{item['pv'] || 0}}{{item['mediatype'] === 3 || item['mediatype'] === 4 ? '播放' : '浏览'}}</span>

                <span class="c-media-time" v-show="item['mediatype'] === 4">{{item['playtime']}}</span>
              </p>
              <zan-and-comment pageName="author" :newsData="item" :user="loginInfo" :media="media" :typeId="typeId" @hasZaned="hasZaned"></zan-and-comment>
            </div>
          </li>
        </ul>
      </div>
      <div class="c-loading" v-show="isLoad">
        <span class="loading-icon"></span> 
        <p>加载中...</p>
      </div>
    </div>
    <!-- <div class="c-empty" v-show="isEmpty" ref="emptyEle"> 
      <p><img src="../assets/pic_empty.png"><br>暂无内容</p>
    </div> -->
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
        headImg: require('../assets/pic_head.png')
      },
      tabIndex: 0,
      hasRequest: false,
      isLoad: false,
      isEmpty: false,
      isAuthor: true,
      isAttention: 0,
      pageType: 4,
      typeId: 4,
      urlUserId: util.getParam('userId'),
      loginInfo: {}, // 当前用户的信息（登录者）
      userInfo: {}, // 某条消息的发布者的信息
      shareInfo: {},
      media: {},
      isloadmore: 0,
      lastpageid: '',
      newsList: []
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
      this.pageType = this.isAuthor ? 4 : 6
      this.typeId = this.isAuthor ? 4 : 3
      this.setTabBar()
    })
    this.deleteMediaWatch()
    this.registerNotice()
  },
  methods: {
    // 注册全局通知（点赞）
    registerNotice () {
      if (this.isAuthor) {
        util.callNative('ClientNoticeManager', 'registerNotice', {
          keys: ['kNotification_yc_praiseNotification', 'kNotification_yc_deleteNotification']
        }, (result) => {
          if (this.newsList.length && result.key === 'kNotification_yc_praiseNotification' && util.getParam('page') !== result.args.page) {
            this.newsList.map((v, i) => {
              if (Number(result.args.newsid) === Number(v['newsid'])) {
                this.$set(this.newsList[i], 'hasZan', true)
                v['praisenum'] = Number(v['praisenum']) + 1
              }
            })
          } else if (this.newsList.length && result.key === 'kNotification_yc_deleteNotification') {
            this.newsList.map((v, i) => {
              if (Number(result.args.newsid) === Number(v['newsid'])) {
                this.newsList.splice(i, 1)
                this.isEmpty = !this.newsList.length
                if (this.isEmpty) {
                  util.callNative('ClientViewManager', 'showEmptyDataWithMessage', {
                    msg: '您还没有发布任何内容'
                  })
                }
              }
            })
          }
        })
      } else {
        util.callNative('ClientNoticeManager', 'registerNotice', {
          keys: ['kNotification_yc_praiseNotification']
        }, (result) => {
          if (this.newsList.length && result.key === 'kNotification_yc_praiseNotification' && util.getParam('page') !== result.args.page) {
            this.newsList.map((v, i) => {
              if (Number(result.args.newsid) === Number(v['newsid'])) {
                this.$set(this.newsList[i], 'hasZan', true)
                v['praisenum'] = Number(v['praisenum']) + 1
              }
            })
          }
        })
      }
    },
    // tab切换通过url获取相应的index
    setTabBar () {
      this.isLoad = false
      this.isEmpty = false
      util.callNative('ClientViewManager', 'hideEmptyDataWithMessage')
      this.newsList = []
      this.lastpageid = ''
      this.tabIndex = Number(util.getParam('labelid'))
      func.deleteMedia(this.media)
      this.getPageList()
    },
    getPageList () {
      let pid = this.lastpageid || ''
      let dt = this.isAuthor ? 3 : 2
      let vuserid = this.urlUserId || ''
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
          // if (Number(this.tabIndex) !== Number(index)) {
          //   return
          // }
          res = JSON.parse(res)
          this.isLoad = false
          util.callNative('ClientViewManager', 'hideLoadingView')
          if (!res.result) {
            return
          }
          if (res.result.newslist.length) {
            this.newsList = this.newsList.concat(res.result.newslist)
            this.hasZaned()
          }
          if (res.result.userinfo) {
            // res.result.userinfo.userpic = res.result.userinfo.userpic + '&hybridCache=1'
            if (!this.hasRequest) {
              this.userInfo = res.result.userinfo
              this.shareInfo = res.result.shareinfo
            }
          }
          this.isEmpty = !this.newsList.length
          if (this.isEmpty) {
            util.callNative('ClientViewManager', 'showEmptyDataWithMessage', {
              msg: '您还没有发布任何内容'
            })
          }
          this.isloadmore = res.result.isloadmore || 0
          this.lastpageid = res.result.lastid || ''
          this.hasRequest = true
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
      if (!likes || !likes.length) {
        return
      }

      if (likes && likes.length) {
        likes.map((j) => {
          this.newsList.map((v) => {
            if (j === v['newsid']) {
              v['hasZan'] = true
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
            this.newsList.splice(index, 1)
            this.isEmpty = !this.newsList.length
            if (this.isEmpty) {
              util.callNative('ClientViewManager', 'showEmptyDataWithMessage', {
                msg: '您还没有发布任何内容'
              })
            }
            this.postDeleteNotice(item.newsid)
          }
        },
        fail: (status) => {}
      })
    },
    // 发送删除全局通知
    postDeleteNotice (newsid) {
      const args = {
        'key': 'kNotification_yc_deleteNotification',
        'args': {
          'newsid': newsid
        }
      }
      util.callNative('ClientNoticeManager', 'postNotice', args)
    },
    setEmpty () {
      let winHeight = window.innerHeight
      let offsetHeight = this.$refs.tabList.clientHeight
      let offsetTop = this.$refs.tabList.offsetTop
      let emptyHeight = winHeight - offsetHeight - offsetTop
      this.$refs.emptyEle.style.height = emptyHeight + 'px'
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
      if (!this.isAuthor && news.mediatype === 3) {
        this.pageType = 6
      }
      if (!this.isAuthor && news.mediatype === 4) {
        this.pageType = 5
      }
      func.createMedia(e, news, this.media, this.pageType)
    },
    deleteMediaWatch () {
      window.addEventListener('scroll', () => {
        const scrollTop = document.body.scrollTop
        const titleHeight = this.$refs.tabBar.clientHeight
        func.deleteMediaWatch(scrollTop, this.media, titleHeight)
      })
    },
    getMore () {
      if (this.isLoad || !this.isloadmore) {
        return
      }
      util.callNative('ClientDataManager', 'getNetworkState', {}, (state) => {
        if (!Number(state.result)) {
          util.callNative('ClientViewManager', 'showErrorTipsViewForNoNetWork')
        } else {
          this.isEmpty = false
          util.callNative('ClientViewManager', 'hideEmptyDataWithMessage')
          func.deleteMedia(this.media)
          if (this.isloadmore) {
            this.isLoad = true
            this.getPageList()
          }
        }
      })
      // if (!this.isLoad) {
      //   this.isEmpty = false
      //   util.callNative('ClientViewManager', 'hideEmptyDataWithMessage')
      //   func.deleteMedia(this.media)
      //   if (this.isloadmore) {
      //     this.isLoad = true
      //     this.getPageList()
      //   }
      // }
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
    }
  }
}
</script>

<style lang="stylus" scoped>
.c-error-tip
  color #f00
</style>
