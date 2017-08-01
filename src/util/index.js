import * as util from './util.js'

export function followToggle (e, type, info, icon1, target) {
  const pvMap = {
    'eventid': 'chejiahao_cancelorattention_click',
    'pagename': 'chejiahao_cancelorattention',
    'reportjson': {
      'userid#1': info.loginId || 0, // loginId
      'typeid#2': !type ? '1' : '2',
      'userid2#3': info.userId || 0,
      'objecttypeid#4': info.objecttypeid || ''
    }
  }
  util.chejiahaoPv(pvMap)

  // 判断是否联网
  util.callNative('ClientDataManager', 'getNetworkState', {}, (state) => {
    if (!Number(state.result)) {
      util.callNative('ClientViewManager', 'showToastView', {
        type: 0,
        msg: '当前网络不可用,请检查网络设置'
      })
      return
    }
    if (Number(info.loginId)) {
      let url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/Follow'
      if (type) {
        url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/UnFollow'
      }
      util.ajax({
        url: url,
        type: 'POST',
        isJson: true,
        data: {
          userId: info.userId,
          _appid: util.mobileType() === 'iOS' ? 'app' : 'app_android',
          pcpopclub: info.userAuth,
          autohomeua: info.userAgent
        },
        dataType: 'json',
        success: function (res, xml) {
          res = JSON.parse(res)
          // res.result = 1
          if (res.returncode === 0 && res.result === 1) {
            if ((icon1) || (/author/.test(window.location.href))) {
              icon1 = {
                icon1: !type ? 'articleplatform_icon_correct' : 'articleplatform_icon_add',
                icon1_p: !type ? 'articleplatform_icon_correct_p' : 'articleplatform_icon_add_p'
              }
              target.setRightIcon(icon1)
            }
            if (!type) {
              target.isAttention = 1
              util.callNative('ClientViewManager', 'showToastView', {
                type: 1,
                msg: '关注成功'
              })
            } else {
              target.isAttention = 0
              util.callNative('ClientViewManager', 'showToastView', {
                type: 1,
                msg: '取消关注成功'
              })
            }
          } else {
            const msg = !type ? '关注失败' : '取消关注失败'
            util.callNative('ClientViewManager', 'showToastView', {
              type: 2,
              msg: msg
            })
          }
        },
        fail: function (status) {
          const msg = !type ? '关注失败' : '取消关注失败'
          util.callNative('ClientViewManager', 'showToastView', {
            type: 2,
            msg: msg
          })
        }
      })
    } else {
      let url = !type ? 'addLocalDataForFollow' : 'deletLocalDataForFollow'
      let post = {
        userid: info.userId
      }
      if (!type) {
        post = {
          imgurl: info.imgUrl || '',
          time: info.time || '',
          userid: info.userId || '',
          username: info.userName || '',
          title: info.title || '',
          description: info.description || ''
        }
      }

      util.callNative('ClientDataManager', url, post, function (result) {
        if (result.result) {
          if ((icon1) || (/author/.test(window.location.href))) {
            icon1 = {
              icon1: !type ? 'articleplatform_icon_correct' : 'articleplatform_icon_add',
              icon1_p: !type ? 'articleplatform_icon_correct_p' : 'articleplatform_icon_add_p'
            }
            target.setRightIcon(icon1)
          }
          if (!type) {
            target.isAttention = 1
            util.callNative('ClientViewManager', 'showToastView', {
              type: 1,
              msg: '关注成功'
            })
          } else {
            target.isAttention = 0
            util.callNative('ClientViewManager', 'showToastView', {
              type: 1,
              msg: '取消关注成功'
            })
          }
        }
      })
    }
  })
}

// 根据wifi 判断是否创建播放器
export function isCreatePlayer (fn) {
  if (util.mobileType() !== 'iOS') {
    fn && fn()
  } else {
    util.callNative('ClientDataManager', 'getWifiState', {}, function (state) {
      if (state.result === '0') {
        util.callNative('ClientDataManager', 'getVideoShowAlertState', {}, function (data) {
          if (data.result === '1') {
            util.callNative('ClientToastManager', 'showAlertForVideoPlayAlertForNoWifi', {}, function (info) {
              if (info.result === '1') {
                fn && fn()
              }
            })
          } else {
            fn && fn()
          }
        })
      } else {
        fn && fn()
      }
    })
  }
}

export function createMedia (e, news, media, pageType) {
  if (news.status !== 0 && news.status !== 1) {
    return
  }
  util.callNative('ClientDataManager', 'getNetworkState', {}, (state) => {
    const isNet = state.result
    // 未联网
    if (!Number(isNet)) {
      util.callNative('ClientViewManager', 'showToastView', {
        type: 0,
        msg: '当前网络不可用，请检查网络设置'
      })
    } else {
      isCreatePlayer(function () {
        if (media.mediaType === 3) {
          let postData = {
            mediaid: media.mediaId,
            x: media.mediaX,
            y: media.mediaY,
            title: news.mediatitle,
            status: news.status,
            playtime: news.playtime,
            thumbnailpics: news.thumbnailpics,
            reportjson: {
              newsid: Number(news.newsid) || 0,
              seriesids: news.seriesids || '',
              session_id: news.session_id || '',
              pagetype: pageType || 3
            }
          }
          util.callNative('ClientVideoManager', 'createById', postData)
        }
        if (media.mediaType === 4) {
          let postData = {
            mediaid: media.mediaId,
            width: media.mediaWidth,
            height: media.mediaHeight,
            x: media.mediaX,
            y: media.mediaY,
            status: news.status,
            playurl: news.copieslist ? news.copieslist[0].playurl : '',
            thumbnailpics: news.thumbnailpics,
            reportjson: {
              newsid: Number(news.newsid) || 0,
              seriesids: news.seriesids || '',
              session_id: news.session_id || '',
              pagetype: pageType || 3
            }
          }
          util.callNative('ClientAudioManager', 'createById', postData)
        }
      })
    }
  })
}

// 销毁音频或视频
export function deleteMedia (media) {
  if (media.mediaType === 3) {
    util.callNative('ClientVideoManager', 'deleteById', {
      mediaid: media.mediaId
    })
  }
  if (media.mediaType === 4) {
    util.callNative('ClientAudioManager', 'deleteById', {
      mediaid: media.mediaId
    })
  }
}

// 监听销毁音频或视频
export function deleteMediaWatch (media) {
  window.addEventListener('scroll', function () {
    let offsetHeight = window.innerHeight
    let scrollTop = document.body.scrollTop
    if (media.mediaStatus) {
      if ((media.mediaHeight + media.mediaY) < scrollTop || (media.mediaY - offsetHeight > scrollTop)) {
        media.mediaStatus = false
        if (media.mediaType === 3) {
          util.callNative('ClientVideoManager', 'deleteById', {
            mediaid: media.mediaId
          })
        }
      }
    }
  })
}

export function scaleQingImg (e, news) {
  e.stopPropagation()

  let pics = []
  let picurl = news.pics
  picurl.map(function (item) {
    let map = {}
    map.picurl = item
    pics.push(map)
  })
  util.callNative('ClientViewManager', 'pushViewController', {
    pagetype: 9,
    animationtype: 1,
    set: {
      modename: 'author',
      ispagefullscreen: 1,
      navigationalpha: 0,
      navigationbacktype: 5,
      navigationrighticon: {
        icon1: 'articleplatform_icon_share_p'
      },
      navigationtype: 2
    },
    param: {
      newsid: news.newsid,
      index: news.index,
      pics: pics,
      sharecontent: news.sharecontent,
      reportjson: {
        seriesids: news.seriesids,
        sourcefrom: news.pageType || 3 // 主页5，标签列表3
      }
    }
  })
}

// 点击作者头像获取UserId跳转作者主页
export function toAuthorPage (userId, loginId) {
  let pageType = (loginId === userId) ? 5 : 7

  util.callNative('ClientViewManager', 'pushViewController', {
    pagetype: pageType,
    animationtype: 1,
    set: {
      modename: 'author',
      ispagefullscreen: 1,
      navigationalpha: 0,
      navigationbacktype: 1,
      navigationtype: 2
    },
    param: {
      userId: userId
    }
  })

  // pv
  let pvMap = {
    'eventid': 'chejiahao_list_bigvuser_click',
    'pagename': 'chejiahao_list_bigvuser',
    'reportjson': {
      'userid1#1': loginId,
      'userid2#2': userId
    }
  }
  util.chejiahaoPv(pvMap)
}

export function toArticleDetail (news) {
  let media = {
    mediaId: news.mediaId,
    mediaType: news.mediaType
  }
  deleteMedia(media)

  let mediaType = news.mediaType
  let odjectId = (mediaType === '3' || mediaType === '4') ? news.mediaId : news.newsId
  let pvMap = {
    'eventid': 'chejiahao_list_detail_click',
    'pagename': 'chejiahao_list_detail',
    'reportjson': {
      'userid#1': news.loginId,
      'typeid#2': news.mediaType,
      'objectid#3': odjectId,
      'position#4': news.position
    }
  }
  util.chejiahaoPv(pvMap)
  util.callNative('ClientViewManager', 'pushViewController', {
    pagetype: 2,
    animationtype: 2,
    param: {
      newsid: news.newsId,
      type: news.mediaType,
      autoscrolltocomment: 0
    }
  })
}
