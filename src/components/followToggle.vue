<template>
  <a class="c-att-t" v-if="!isAttention" @click.stop="followToggle"><span>＋</span> 关注</a>
  <a class="c-att-t on" @click.stop="followToggle" v-else-if="!noAttention">已关注</a>
</template>

<script>
import * as util from '../api/util.js'

export default{
  props: ['attention', 'newsData', 'authInfo', 'objecttypeid', 'noAttention'],
  data: function () {
    return {
      isAttention: this.attention
    }
  },
  methods: {
    followToggle (e) {
      var pvMap = {
        'eventid': 'chejiahao_cancelorattention_click',
        'pagename': 'chejiahao_cancelorattention',
        'reportjson': {
          'userid#1': this.authInfo.userId || 0, // loginId
          'typeid#2': !this.isAttention ? '1' : '2',
          'userid2#3': this.newsData.userId || 0,
          'objecttypeid#4': this.objecttypeid || ''
        }
      }
      util.chejiahaoPv(pvMap)

      if (Number(this.authInfo.userId)) {
        let url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/Follow'
        if (this.isAttention) {
          url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/UnFollow'
        }
        util.ajax({
          url: url,
          type: 'POST',
          isJson: true,
          data: {
            userId: this.newsData.userId,
            _appid: util.mobileType() === 'iOS' ? 'app' : 'app_android',
            pcpopclub: this.authInfo.userAuth,
            autohomeua: this.authInfo.userAgent
          },
          dataType: 'json',
          success: (res, xml) => {
            res = JSON.parse(res)
            // res.result = '1'
            if (res.result) {
              // if ((icon1) || (/author/.test(window.location.href))) {
              //   this.icon1 = {
              //     icon1: !this.isAttention ? 'articleplatform_icon_correct' : 'articleplatform_icon_add',
              //     icon1_p: !this.isAttention ? 'articleplatform_icon_correct_p' : 'articleplatform_icon_add_p'
              //   }
              //   // target.setRightIcon(icon1)
              // }
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
              // data = {
              //   isAttention: this.isAttention
              // }
              // this.$emit('on-follow', data)
            }
          },
          fail: function (status) {
            console.log('失败，请重试')
          }
        })
      } else {
        let url = !this.isAttention ? 'addLocalDataForFollow' : 'deletLocalDataForFollow'
        let post = {
          userid: this.newsData.userId
        }
        if (!this.isAttention) {
          post = {
            imgurl: this.newsData.imgUrl || '',
            time: this.newsData.time || '',
            userid: this.newsData.userId || '',
            username: this.newsData.userName || '',
            title: this.newsData.title || '',
            description: this.newsData.description || ''
          }
        }

        util.callNative('ClientDataManager', url, post, function (result) {
          if (result.result) {
            // if ((icon1) || (/author/.test(window.location.href))) {
            //   this.icon1 = {
            //     icon1: !this.isAttention ? 'articleplatform_icon_correct' : 'articleplatform_icon_add',
            //     icon1_p: !this.isAttention ? 'articleplatform_icon_correct_p' : 'articleplatform_icon_add_p'
            //   }
            //   // target.setRightIcon(icon1)
            // }
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

            // data = {
            //   icon1: this.icon1,
            //   isAttention: this.isAttention
            // }
            // this.$emit('on-follow', data)
          }
        })
      }
    }
  }
}
</script>
<style lang="stylus">
</style>
