<template>
  <!-- <keep-alive></keep-alive>>   -->
  <div class="c-wp" v-scroll="getMore">
    <top-load-more :afterPull="afterPull" :beforePull="beforePull">
    <div class="c-tab-list" slot="list">
      <div ref="jsTb">
        <ul class="c-tab-ul">
          <li v-for="(item, index) in dataList" @click.stop.prevent="toArticleDetail($event, item, index)">
            <div class="c-media-item">
              <div class="c-media-info" @click.stop="toAuthorPage($event, item)">
                <img imgType="head" class="c-auth-img" alt="" v-lazy="item.userpic">
                <p class="c-auth-title">{{item.username}}</p>
              </div>
              <follow-toggle :noAttention="true" :objecttypeid="2" :attention="item.isattention" :newsData="item" :loginInfo="loginInfo" @followEvent="followToggle(item, $event)"></follow-toggle>
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
              <div class="c-media-img c-media-qing-more">
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
                <span class="c-looked">{{item['pv'] || 0}}{{item['mediatype'] === 3 || item['mediatype'] === 4 ? '播放' : '浏览'}}</span>

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
    </top-load-more>
    
    <div class="c-empty" v-show="isEmpty"> 
      <p><img src="../assets/pic_empty.png"><br>暂无内容</p>
    </div>
  </div>
</template>

<script>
import * as func from '../util/index.js'
import * as util from '../util/util.js'
import zanAndComment from '../components/zanAndComment'
import followToggle from '../components/followToggle'
import topLoadMore from '../components/topLoadMore'

export default {
  name: 'tagName',
  components: {
    zanAndComment,
    followToggle,
    topLoadMore
  },
  data () {
    return {
      defaultData: {
        headImg: require('../assets/pic_head.png')
      },
      tabIndex: 0,
      hasReFresh: false,
      isLoad: false,
      isEmpty: false,
      isFirst: false,
      pageType: 3,
      urlUserId: util.getParam('userId'),
      loginInfo: {}, // 当前用户的信息（登录者）
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
    util.callNative('ClientDataManager', 'getNetworkState', {}, (data) => {
      // 未联网
      if (!Number(data.result)) {
        util.callNative('ClientViewManager', 'hideLoadingView')
        util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
          util.callNative('ClientViewManager', 'showLoadingView')
          // this.isFirst = true
          // this.setTabBar()
        })
      } else {
        util.callNative('ClientDataManager', 'getUserInfo', {}, (user) => {
          this.loginInfo = user
          // this.isFirst = true
          // this.setTabBar()
        })
      }
      this.isFirst = true
      this.setTabBar()
    })
    this.deleteMediaWatch()
  },
  methods: {
    beforePull () {
      func.deleteMedia(this.media)
    },
    afterPull () {
      setTimeout(() => {
        if (!this.isLoad) {
          this.isLoad = true
          this.newsList[this.tabIndex] = []
          this.lastpageid[this.tabIndex] = ''
          this.getPageList()
        }
      }, 1500)
    },
    setTabBar () {
      util.callNative('ClientViewManager', 'setTitleLabelCallback', {}, (index) => {
        if (this.tabIndex === Number(index.index) && !this.isFirst) {
          return
        }
        this.isLoad = false
        this.isEmpty = false
        this.isFirst = false
        this.dataList = []
        // this.newsList = []
        // this.lastpageid = ''
        // document.body.scrollTop = 0
        this.tabIndex = Number(index.index)
        func.deleteMedia(this.media)
        // this.getPageList(Number(index.index))

        setTimeout(() => {
          if (!this.newsList[this.tabIndex].length) {
            // this.getPageInfo(index)
            this.getPageList(Number(index.index))
          } else {
            this.dataList = this.newsList[this.tabIndex]
          }
        }, 0)
      })
    },
    getPageList (index) {
      let pid = this.lastpageid[this.tabIndex] || ''
      index = index || this.tabIndex
      util.ajax({
        url: util.api.npnewlistfortagid,
        type: 'GET',
        data: {
          pm: util.mobileType() === 'iOS' ? 1 : 2,
          tagid: util.getParam('tagid'),
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
          util.callNative('ClientViewManager', 'hideLoadingView')
          this.isLoad = false
          if (!res.result) {
            return
          }
          if (res.result.newslist.length) {
            this.newsList[this.tabIndex] = [...this.newsList[this.tabIndex], ...res.result.newslist]
            this.dataList = this.newsList[this.tabIndex]
            this.getLocalDataForFollow()
          }
          this.isloadmore[this.tabIndex] = res.result.isloadmore || 0
          this.lastpageid[this.tabIndex] = res.result.lastid || ''
          this.isEmpty = !this.newsList[this.tabIndex].length
          const pvMap = {
            'eventid': 'chejiahao_tag_list_page_pv',
            'pagename': 'chejiahao_tag_list_page',
            'isdata': res.result.newslist.length ? 1 : 0,
            'reportjson': {
              'userid1#1': this.loginInfo.userId || 0,
              'objectid#2': util.getParam('tagid')
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
    getLocalDataForFollow () {
      this.hasZaned()
      // 未登录
      if (!Number(this.loginInfo.userId)) {
        try {
          util.callNative('ClientDataManager', 'getLocalDataForFollow', {}, (follow) => {
            // 本地数据有
            if (follow.result.length) {
              follow.result.map((v) => {
                this.dataList.map((j) => {
                  if (Number(v['userId']) === Number(j['userid'])) {
                    j['isattention'] = '1'
                  }
                })
              })
            }
          })
        } catch (e) {}
      }
    },
    resize (e) {
      e.target.style.height = e.target.clientWidth * 0.5625 + 'px'
    },
    loadError (e) {
      e.target.onerror = null
      e.target.src = ''
    },
    followToggle (item, value) {
      item.isattention = value
      this.newsList.map((news, index) => {
        news.map((v) => {
          if (item.userid === v['userid']) {
            v.isattention = value
          }
        })
      })
    },
    createMedia (e, news) {
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
    deleteMediaWatch () {
      window.addEventListener('scroll', () => {
        const offsetHeight = window.innerHeight
        const scrollTop = document.body.scrollTop
        const titleHeight = 40
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
        pageType: 3
      }
      func.scaleQingImg(data)
    },
    toAuthorPage (e, news) {
      func.deleteMedia(this.media)
      func.toAuthorPage(e, news.userid, this.loginInfo.userId)
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
