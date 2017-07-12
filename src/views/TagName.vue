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
                <img class="c-auth-img" :src="item.userpic || defaultData.headImg" alt="" @error="loadError($event)">
                <p class="c-auth-title">{{item.username}}</p>
              </div>
              <follow-toggle :noAttention="true" :objecttypeid="2" :attention="item.isattention" :newsData="item" :authInfo="authInfo"></follow-toggle>
            </div>
            <div class="c-media-desc" v-if="(item.mediatype !== 4 && item.mediatype !== 1) || ( item.mediatype === 1 && item.recommendShowBigImg)">
              {{item.mediatype === 2 ? item.description : item.title}}
            </div>
            <div class="c-media-content c-media-long" v-if="item.mediatype === 1 && !item.recommendShowBigImg">
              <p>{{item.title}}</p>
              <img class="c-auth-info-img" :src="item.thumbnailpics[0]" alt="" @load="resize($event)" @error="loadError($event)">
            </div>
            <div class="c-media-content" v-if="(item.mediatype === 1 && item.recommendShowBigImg) || (item.mediatype === 2 && item.thumbnailpics.length < 3)">
              <img class="c-auth-info-img" :src="item.thumbnailpics[0]" alt="" @load="resize($event)" @error="loadError($event)">
            </div>

            <div class="c-media-content c-media-qing-more" v-if="item.mediatype === 2 && item.thumbnailpics.length > 3">
              <img class="c-auth-info-img c-auth-audio-img" alt=""
                v-for="(img, imgIndex) in item.thumbnailpics"
                v-if="imgIndex < 3"
                :src="img" 
                @load="resize($event)" 
                @error="loadError($event)"
                @click="scaleQingImg($event, item, imgIndex)"
              >
            </div>

            <div v-if="item.mediatype === 3" class="c-media-content c-media-video" @click.stop="createMedia($event, item)">
              <img class="c-auth-info-img" :src="item.thumbnailpics[0]" @load="resize($event)" @error="loadError($event)">
              <span class="media-video-btn"></span>
              <span class="c-media-time">{{item.playtime}}</span>
            </div>

            <div v-if="item.mediatype === 4" class="c-media-audio">
              <div class="media-audio-pic" @click.stop="createMedia($event, item)">
                <img class="c-auth-info-img c-auth-audio-img" :src="item.thumbnailpics[0]" alt="" @error="loadError($event)">
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
    </top-load-more>
    
    <div class="c-empty" v-show="isEmpty"> 
      <p><img src="../assets/pic_empty.png"><br>暂无内容</p>
    </div>
  </div>
</template>

<script>
import * as func from '../api/index.js'
import * as util from '../api/util.js'
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
  data: function () {
    return {
      defaultData: {
        navBarImg: require('../assets/navbar_bg.png'),
        headImg: require('../assets/pic_head.png')
      },
      tabIndex: 0,
      hasReFresh: false,
      isLoad: false,
      isEmpty: false,
      isloadmore: 0,
      pageType: 3,
      lastpageid: '',
      topStatus: '',
      urlUserId: util.getParam('userId'),
      authInfo: {}, // 当前用户的信息（登录者）
      media: {},
      newsList: []
    }
  },
  computed: {
    getMedia: function () {
      return this.media
    }
  },
  mounted: function () {
    let self = this

    util.callNative('ClientDataManager', 'getNetworkState', {}, function (data) {
      // 未联网
      if (!Number(data.result)) {
        util.callNative('ClientViewManager', 'loadingFailed', {}, function () {
          util.callNative('ClientViewManager', 'showLoadingView')
          self.setTabBar()
        })
      } else {
        util.callNative('ClientDataManager', 'getUserInfo', {}, function (user) {
          self.authInfo = user
          self.setTabBar()
        })
      }
    })
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
    setTabBar: function () {
      let self = this
      util.callNative('ClientViewManager', 'setTitleLabelCallback', {}, function (index) {
        self.isEmpty = false
        document.body.scrollTop = 0
        self.tabIndex = Number(index.index)
        self.newsList = []
        self.lastpageid = ''

        func.deleteMedia(self.media)
        self.getPageList()
      })
    },
    getPageList: function () {
      let self = this
      let pid = self.lastpageid || ''
      util.ajax({
        url: util.api.npnewlistfortagid,
        type: 'GET',
        data: {
          pm: util.mobileType() === 'iOS' ? 1 : 2,
          tagid: util.getParam('tagid'),
          au: self.authInfo.userAuth,
          pid: pid,
          pagesize: 20,
          otype: 0,
          itype: self.tabIndex || 0
        },
        dataType: 'json',
        success: function (res, xml) {
          res = JSON.parse(res)
          util.callNative('ClientViewManager', 'hideLoadingView')
          self.isLoad = false
          self.hasReFresh = false
          if (!res.result) {
            return
          }
          if (res.result.newslist.length) {
            self.newsList = [...self.newsList, ...res.result.newslist]
          }
          self.isEmpty = !res.result.newslist.length
          self.isloadmore = res.result.isloadmore || ''
          self.lastpageid = res.result.lastid || ''
          if (self.newsList.length) {
            self.getLocalDataForFollow()
          }
          let pvMap = {
            'eventid': 'chejiahao_tag_list_page_pv',
            'pagename': 'chejiahao_tag_list_page',
            'isdata': res.result.newslist.length ? 1 : 0,
            'reportjson': {
              'userid1#1': self.authInfo.userId || 0,
              'objectid#2': util.getParam('tagid')
            }
          }
          util.chejiahaoPv(pvMap)
        },
        fail: function (status) {
          util.callNative('ClientViewManager', 'loadingFailed', {}, function () {
            util.callNative('ClientViewManager', 'showLoadingView')
            self.getPageList()
          })
        }
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
                self.newsList.map(function (j) {
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
          this.getPageList()
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
        pageType: 3
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
    // beforePull () {
    //   func.deleteMedia(this.media)
    // },
    // refresh () {
    //   return new Promise((resolve, reject) => {
    //     this.getPageList()
    //     setTimeout(() => {
    //       func.deleteMedia(this.media)
    //       resolve()
    //     }, 1200)
    //   })
    // }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="stylus" scoped>
</style>
