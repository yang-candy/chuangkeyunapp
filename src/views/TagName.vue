<template>
  <!-- <keep-alive></keep-alive>>   -->
  <div class="c-wp">
    <div class="c-tab-list">
      <div ref="jsTb" class="c-tab-bd js-tb" v-scroll="getMore">
        <ul class="c-tab-ul">
          <li v-for="(item, index) in newsList" @click.stop="toArticleDetail($event, item, index)">
            <div class="c-media-item">
              <div class="c-media-info" @click.stop="toAuthorPage($event, item)">
                <img class="c-auth-img" :src="item.userpic || defaultData.headImg" alt="">
                <p class="c-auth-title">{{item.username}}</p>
              </div>
              
              <a class="c-att-t" v-show="!item.isattention" @click.stop="followToggle($event, 0)"><span>＋</span> 关注</a>
            </div>
            <div class="c-media-desc" v-if="item.mediatype !== 4">
              {{item.mediatype === 2 ? item.description : item.title}}
            </div>

            <div class="c-media-content" v-if="item.mediatype === 1 || (item.mediatype === 2 && item.thumbnailpics.length < 3)">
              <img class="c-auth-info-img c-auth-audio-img" :src="item.thumbnailpics[0]" alt="" @load="resize($event)" @error="loadError($event)">
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
                <img class="c-auth-info-img c-auth-audio-img" :src="item.thumbnailpics[0]" alt="">
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
      <div class="c-loading" v-show="!isLoad">
        <span class="loading-icon"></span> 
        <p>加载中...</p>
      </div>
    </div>
    <!-- <pull-refresh></pull-refresh> -->
    <div class="c-empty" v-show="isEmpty"> 
      <p><img src="../assets/pic_empty.png"><br>暂无内容</p>
    </div>
  </div>
</template>

<script>
import * as func from '../api/index.js'
import * as util from '../api/util.js'
import * as ApiBridge from '../mock/apibridge.mock.js'
import zanAndComment from '../components/zanAndComment'
import pullRefresh from '../components/pullRefresh'

export default {
  name: 'tagName',
  components: {
    zanAndComment,
    pullRefresh
  },
  data: function () {
    return {
      defaultData: {
        navBarImg: require('../assets/navbar_bg.png'),
        headImg: require('../assets/pic_head.png')
      },
      tabIndex: 0,
      hasReFresh: false,
      isLoad: true,
      isEmpty: true,
      isloadmore: 0,
      pageType: 4,
      lastpageid: '',
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

    ApiBridge.callNative('ClientDataManager', 'getNetworkState', {}, function (data) {
      // 未联网
      if (!Number(data.result)) {
        ApiBridge.callNative('ClientViewManager', 'loadingFailed', {}, function () {
          ApiBridge.callNative('ClientViewManager', 'showLoadingView')
          self.setTabBar()
        })
      } else {
        ApiBridge.callNative('ClientDataManager', 'getUserInfo', {}, function (user) {
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
    setTabBar: function () {
      let self = this
      ApiBridge.callNative('ClientViewManager', 'setTitleLabelCallback', {}, function (index) {
        document.body.scrollTop = 0
        self.isLoad = true
        // if (vm.data.tagListIndex !== 3 || vm.data.tagListIndex !== 0) {
        //   ApiBridge.callNative('ClientVideoManager', 'deleteById', {
        //     mediaid: vm.data.mediaid,
        //   });
        // }
        // if (vm.data.tagListIndex !== 4 || vm.data.tagListIndex !== 0) {

        //   ApiBridge.callNative('ClientAudioManager', 'deleteById', {
        //     mediaid: vm.data.mediaid,
        //   });
        // }
        self.tabIndex = Number(index.index)

        self.getPageList('set', 1)
        // $('.js-tag-list-ul ul').eq(vm.data.tagListIndex).show().siblings().hide();

        // //判断是否请求过内容
        // if ($('.js-tag-list-ul ul').eq(vm.data.tagListIndex).html() == '') {
        //   vm.tagList(vm.data.tagListIndex, 'set', 1);
        // }
      })
    },
    getPageList: function () {
      let self = this
      let pid = self.lastpageid || ''
      // var lastpageid = vm.data.lastpageid[index] || '';
      // var pid = '';

      // if (flag == 'up') {
      //   pid = lastpageid;
      // }

      // if (!!vm.data.hasReFresh) {
      //   $('.c-loading').hide();
      // }
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
          document.body.scrollTop = 0
          ApiBridge.callNative('ClientViewManager', 'hideLoadingView')
          self.isLoad = true
          self.hasReFresh = false
          self.newsList = res.result.newslist
          self.isEmpty = !res.result.newslist.length
          self.isloadmore = res.result.isloadmore || ''
          self.lastpageid = res.result.lastid || ''

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
          ApiBridge.callNative('ClientViewManager', 'loadingFailed', {}, function () {
            ApiBridge.callNative('ClientViewManager', 'showLoadingView')
            self.getPageList()
          })
        }
      })
    },
    getLocalDataForFollow: function (userinfo) {
      let self = this
      // 未登录
      if (!Number(self.authInfo.userId)) {
        try {
          ApiBridge.callNative('ClientDataManager', 'getLocalDataForFollow', {}, function (follow) {
            // 本地数据有
            if (follow.result.length) {
              follow.result.map(function (v) {
                if (v['userId'] === self.urlUserId) {
                  self.userInfo.isattention = 1
                }
              })
            }
          })
        } catch (e) {}
      }
    },
    followToggle: function (e, type, userId, info) {
      let self = this
      info = {
        userId: self.authInfo.userId,
        username: self.userInfo.name,
        imgurl: self.userInfo.userpic
      }
      func.followToggle(e, type, self.authInfo, info, self)
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
              ApiBridge.callNative('ClientVideoManager', 'deleteById', {
                mediaid: self.media.mediaId
              })
            }
          }
        }
      })
    },
    getMore: function () {
      if (this.isLoad) {
        // if (vm.data.tagListIndex !== 3) {
        //   ApiBridge.callNative('ClientVideoManager', 'deleteById', {
        //     mediaid: vm.data.mediaid,
        //   })
        // }
        // if (vm.data.tagListIndex !== 4) {
        //   ApiBridge.callNative('ClientAudioManager', 'deleteById', {
        //     mediaid: vm.data.mediaid,
        //   })
        // }
        if (this.isloadmore) {
          this.isLoad = false
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

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
