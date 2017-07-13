<template>
  <a class="c-att-t" v-if="!isAttention" @click.stop="followToggle"><span>＋</span> 关注</a>
  <a class="c-att-t on" @click.stop="followToggle" v-else-if="!noAttention">已关注</a>
</template>

<script>
import * as util from '../api/util.js'

export default{
  props: ['attention', 'newsData', 'loginInfo', 'objecttypeid', 'noAttention'],
  computed: {
    isAttention: {
      get: function () {
        return this.attention
      },
      set: function (value) {
        this.attention = value
      }
    }
  },
  methods: {
    followToggle (e) {
      const self = this
      let pvMap = {
        'eventid': 'chejiahao_cancelorattention_click',
        'pagename': 'chejiahao_cancelorattention',
        'reportjson': {
          'userid#1': self.loginInfo.userId || 0, // loginId
          'typeid#2': !self.isAttention ? '1' : '2',
          'userid2#3': self.newsData.userid || 0,
          'objecttypeid#4': self.objecttypeid || ''
        }
      }
      util.chejiahaoPv(pvMap)

      if (Number(self.loginInfo.userId)) {
        let url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/Follow'
        if (self.isAttention) {
          url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/UnFollow'
        }
        util.ajax({
          url: url,
          type: 'POST',
          isJson: true,
          data: {
            userId: self.newsData.userid,
            _appid: util.mobileType() === 'iOS' ? 'app' : 'app_android',
            pcpopclub: self.loginInfo.userAuth,
            autohomeua: self.loginInfo.userAgent
          },
          dataType: 'json',
          success: function (res, xml) {
            res = JSON.parse(res)
            if (res.result) {
              if (!self.isAttention) {
                self.isAttention = 1
                util.callNative('ClientViewManager', 'showToastView', {
                  type: 1,
                  msg: '关注成功'
                })
              } else {
                self.isAttention = 0
                util.callNative('ClientViewManager', 'showToastView', {
                  type: 1,
                  msg: '取消关注成功'
                })
              }
            }
          },
          fail: function (status) {
            console.log('失败，请重试')
          }
        })
      } else {
        let url = !self.isAttention ? 'addLocalDataForFollow' : 'deletLocalDataForFollow'
        let post = {
          userid: self.newsData.userid
        }
        if (!self.isAttention) {
          post = {
            imgurl: self.newsData.userpic || '',
            time: self.newsData.usertime || '',
            userid: self.newsData.userid || '',
            username: self.newsData.username || '',
            title: self.newsData.title || '',
            description: self.newsData.userdesc || ''
          }
        }

        util.callNative('ClientDataManager', url, post, function (result) {
          if (result.result) {
            if (!self.isAttention) {
              self.isAttention = 1
              util.callNative('ClientViewManager', 'showToastView', {
                type: 1,
                msg: '关注成功'
              })
            } else {
              self.isAttention = 0
              util.callNative('ClientViewManager', 'showToastView', {
                type: 1,
                msg: '取消关注成功'
              })
            }
          }
        })
      }
    }
  }
}
</script>
<style lang="stylus">
</style>
