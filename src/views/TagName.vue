<template>
  <!-- <keep-alive></keep-alive>>   -->
  <div class="c-wp" v-scroll="getMore">
    <top-load-more :afterPull="afterPull" :beforePull="beforePull">
    <div class="c-tab-list" slot="list">
      <div ref="jsTb" class="c-tab-bd js-tb">
        <ul class="c-tab-ul">
          <li v-for="(item, index) in newsList" @click.stop.prevent="toArticleDetail($event, item, index)">
            <div class="c-media-item">
              <div class="c-media-info" @click.stop="toAuthorPage($event, item)">
                <img imgType="head" class="c-auth-img" alt="" v-lazy="item.userpic">
                <p class="c-auth-title">{{item.username}}</p>
              </div>
              <follow-toggle :noAttention="true" :objecttypeid="2" :attention="item.isattention" :newsData="item" :loginInfo="loginInfo"></follow-toggle>
            </div>
            <div class="c-media-desc" :class="{'c-media-qing': item.mediatype === 2}" v-if="(item.mediatype !== 4 && item.mediatype !== 1) || ( item.mediatype === 1 && item.recommendShowBigImg)">
              {{item.mediatype === 2 ? item.description : item.title}}
            </div>
            <div class="c-media-content c-media-long" :class="{'c-media-qing': item.mediatype === 1}" v-if="item.mediatype === 1 && !item.recommendShowBigImg">
              <p>{{item.title}}</p>
              <img imgType="article" class="c-auth-info-img" v-lazy="item.thumbnailpics[0]" alt="">
            </div>
            <div class="c-media-content" v-if="(item.mediatype === 1 && item.recommendShowBigImg) || (item.mediatype === 2 && item.thumbnailpics.length < 3)">
              <img imgType="article" class="c-auth-info-img" v-lazy="item.thumbnailpics[0]" alt="">
            </div>

            <div class="c-media-content c-media-qing-more" v-if="item.mediatype === 2 && item.thumbnailpics.length > 3">
              <img imgType="article" class="c-auth-info-img c-auth-audio-img" alt=""
                v-for="(img, imgIndex) in item.thumbnailpics"
                v-if="imgIndex < 3"
                v-lazy="img" 
                @click="scaleQingImg($event, item, imgIndex)"
              >
            </div>

            <div v-if="item.mediatype === 3" class="c-media-content c-media-video" @click.stop="createMedia($event, item)">
              <img imgType="article" class="c-auth-info-img" v-lazy="item.thumbnailpics[0]">
              <span class="media-video-btn"></span>
              <span class="c-media-time">{{item.playtime}}</span>
            </div>

            <div v-if="item.mediatype === 4" class="c-media-audio">
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
      isloadmore: 0,
      pageType: 3,
      lastpageid: '',
      urlUserId: util.getParam('userId'),
      loginInfo: {}, // 当前用户的信息（登录者）
      media: {},
      newsList: []
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
        util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
          util.callNative('ClientViewManager', 'showLoadingView')
          this.setTabBar()
        })
      } else {
        util.callNative('ClientDataManager', 'getUserInfo', {}, (user) => {
          this.loginInfo = user
          this.setTabBar()
        })
      }
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
          this.getPageList()
        }
      }, 1500)
    },
    setTabBar () {
      util.callNative('ClientViewManager', 'setTitleLabelCallback', {}, (index) => {
        this.isLoad = false
        this.isEmpty = false
        if (this.tabIndex === Number(index.index)) {
          return
        }
        this.newsList = []
        this.lastpageid = ''
        document.body.scrollTop = 0
        this.tabIndex = Number(index.index)
        func.deleteMedia(this.media)
        this.getPageList(Number(index.index))
      })
    },
    getPageList (index) {
      let pid = this.lastpageid || ''
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
            this.newsList = [...this.newsList, ...res.result.newslist]
          }
          this.isEmpty = !res.result.newslist.length
          this.isloadmore = res.result.isloadmore || ''
          this.lastpageid = res.result.lastid || ''
          if (this.newsList.length) {
            this.getLocalDataForFollow()
          }
          const pvMap = {
            'eventid': 'chejiahao_tag_list_page_pv',
            'pagename': 'chejiahao_tag_list_page',
            'isdata': res.result.newslist.length ? 1 : 0,
            'reportjson': {
              'userid1#1': this.loginInfo.userId || 0,
              'objectid#2': util.getParam('tagid')
            }
          }
          util.chejiahaoPv(pvMap)
        },
        fail: (status) => {
          this.isLoad = false
          util.callNative('ClientViewManager', 'loadingFailed', {}, () => {
            util.callNative('ClientViewManager', 'showLoadingView')
            this.getPageList()
          })
        }
      })
    },
    getLs (key) {
      if (!key) return
      var value = window.localStorage.getItem(key)
      return JSON.parse(value)
    },
    getLocalDataForFollow () {
      // 未登录
      if (!Number(this.loginInfo.userId)) {
        try {
          // 判断赞
          const likes = this.getLs('tagliked')
          if (likes.length) {
            likes.map((j) => {
              this.newsList.map((v) => {
                if (j === v['newsid']) {
                  v['zaned'] = 1
                } else {
                  v['zaned'] = 0
                }
              })
            })
          }

          util.callNative('ClientDataManager', 'getLocalDataForFollow', {}, (follow) => {
            // 本地数据有
            if (follow.result.length) {
              follow.result.map((v) => {
                this.newsList.map((j) => {
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
        func.deleteMedia(this.media)
        if (this.isloadmore) {
          this.isLoad = true
          this.getPageList()
        }
      }
    },
    scaleQingImg (e, news, index) {
      const data = {
        index: index,
        newsid: news.newsid,
        pics: news.pics,
        sharecontent: news.description,
        seriesids: news.seriesids,
        pageType: 3
      }
      func.scaleQingImg(e, data)
    },
    toAuthorPage (e, news) {
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
</style>
