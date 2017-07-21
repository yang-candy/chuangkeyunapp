<template>
  <a class="c-att-t" v-if="!isAttention" @click.stop="followToggle"><span>＋</span> 关注</a>
  <a class="c-att-t on" @click.stop="followToggle" v-else-if="!noAttention">已关注</a>
</template>

<script>
import * as util from '../util/util.js'

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
      const pvMap = {
        'eventid': 'chejiahao_cancelorattention_click',
        'pagename': 'chejiahao_cancelorattention',
        'reportjson': {
          'userid#1': this.loginInfo.userId || 0, // loginId
          'typeid#2': !this.isAttention ? '1' : '2',
          'userid2#3': this.newsData.userid || 0,
          'objecttypeid#4': this.objecttypeid || ''
        }
      }
      util.chejiahaoPv(pvMap)

      if (Number(this.loginInfo.userId)) {
        let url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/Follow'
        if (this.isAttention) {
          url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/UnFollow'
        }
        util.ajax({
          url: url,
          type: 'POST',
          isJson: true,
          data: {
            userId: this.newsData.userid,
            _appid: util.mobileType() === 'iOS' ? 'app' : 'app_android',
            pcpopclub: this.loginInfo.userAuth,
            autohomeua: this.loginInfo.userAgent
          },
          dataType: 'json',
          success: (res, xml) => {
            res = JSON.parse(res)
            if (res.returncode === 0 && res.result === 1) {
              if (!this.isAttention) {
                this.isAttention = 1
                util.callNative('ClientViewManager', 'showToastView', {
                  type: 1,
                  msg: '关注成功'
                })
              } else {
                this.isAttention = 0
                util.callNative('ClientViewManager', 'showToastView', {
                  type: 1,
                  msg: '取消关注成功'
                })
              }
            } else {
              const msg = !this.isAttention ? '关注失败' : '取消关注失败'
              ApiBridge.callNative('ClientViewManager', 'showToastView', {
                type: 2,
                msg: msg
              })
            }
          },
          fail: (status) => {
            const msg = !this.isAttention ? '关注失败' : '取消关注失败'
            ApiBridge.callNative('ClientViewManager', 'showToastView', {
              type: 2,
              msg: msg
            })
          }
        })
      } else {
        let url = !this.isAttention ? 'addLocalDataForFollow' : 'deletLocalDataForFollow'
        let post = {
          userid: this.newsData.userid
        }
        if (!this.isAttention) {
          post = {
            imgurl: this.newsData.userpic || '',
            time: this.newsData.usertime || '',
            userid: this.newsData.userid || '',
            username: this.newsData.username || '',
            title: this.newsData.title || '',
            description: this.newsData.userdesc || ''
          }
        }

        util.callNative('ClientDataManager', url, post, (result) => {
          if (result.result) {
            if (!this.isAttention) {
              this.isAttention = 1
              util.callNative('ClientViewManager', 'showToastView', {
                type: 1,
                msg: '关注成功'
              })
            } else {
              this.isAttention = 0
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
