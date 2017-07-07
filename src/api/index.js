import * as util from './util.js'

// import * as ApiBridge from '../mock/apibridge.mock.js'
require('./kerkee.js')

export function followToggle (e, type, user, info, target) {
  e.stopPropagation()

  if (Number(user.userId)) {
    if (!type) {
      var $url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/Follow'
    } else {
      $url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/UnFollow'
    }
    util.ajax({
      url: $url,
      type: 'POST',
      isJson: true,
      data: {
        userId: user.userId,
        _appid: util.mobileType() === 'iOS' ? 'app' : 'app_android',
        pcpopclub: user.userAuth,
        autohomeua: user.userAgent
      },
      dataType: 'json',
      success: function (res, xml) {
        res = JSON.parse(res)
        res.result = '1'
        if (res.result) {
          if ((info.icon1) || (/author/.test(window.location.href))) {
            let icon1 = {
              icon1: !type ? 'articleplatform_icon_correct' : 'articleplatform_icon_add',
              icon1_p: !type ? 'articleplatform_icon_correct_p' : 'articleplatform_icon_add_p'
            }
            target.setRightIcon(icon1)
          }
          if (!type) {
            target.isAttention = 1
            ApiBridge.callNative('ClientViewManager', 'showToastView', {
              type: 1,
              msg: '关注成功'
            })
          } else {
            target.isAttention = 0
            ApiBridge.callNative('ClientViewManager', 'showToastView', {
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
    let url = !type ? 'addLocalDataForFollow' : 'deletLocalDataForFollow'
    let post = !type ? info : {
      userid: info.userId
    }
    ApiBridge.callNative('ClientDataManager', url, post, function (result) {
      if (result.result) {
        if ((info.icon1) || (/author/.test(window.location.href))) {
          let icon1 = {
            icon1: !type ? 'articleplatform_icon_correct' : 'articleplatform_icon_add',
            icon1_p: !type ? 'articleplatform_icon_correct_p' : 'articleplatform_icon_add_p'
          }
          target.setRightIcon(icon1)
        }
        if (!type) {
          target.isAttention = 1
          ApiBridge.callNative('ClientViewManager', 'showToastView', {
            type: 1,
            msg: '关注成功'
          })
          // 判断流
          // if (/tag-name/.test(window.location.href)) {
          //   target.remove();
          // }
        } else {
          target.isAttention = 0
          ApiBridge.callNative('ClientViewManager', 'showToastView', {
            type: 1,
            msg: '取消关注成功'
          })
        }
      }
    })
  }
}

// 根据wifi 判断是否创建播放器
export function isCreatePlayer (fn) {
  if (util.mobileType() !== 'iOS') {
    fn && fn()
  } else {
    ApiBridge.callNative('ClientDataManager', 'getWifiState', {}, function (state) {
      if (state.result === '0') {
        ApiBridge.callNative('ClientDataManager', 'getVideoShowAlertState', {}, function (data) {
          if (data.result === '1') {
            ApiBridge.callNative('ClientToastManager', 'showAlertForVideoPlayAlertForNoWifi', {}, function (info) {
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
  // e.stopPropagation()
  if (news.status !== 0 && news.status !== 1) {
    return
  }
  ApiBridge.callNative('ClientDataManager', 'getNetworkState', {}, function (state) {
    let isNet = state.result
    // 未联网
    if (!Number(isNet)) {
      ApiBridge.callNative('ClientViewManager', 'showToastView', {
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
          ApiBridge.callNative('ClientVideoManager', 'createById', postData)
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
          ApiBridge.callNative('ClientAudioManager', 'createById', postData)
        }
      })
    }
  })
}

// 销毁音频或视频
export function deleteMedia (media) {
  if (media.mediaType === 3) {
    ApiBridge.callNative('ClientVideoManager', 'deleteById', {
      mediaid: media.mediaId
    })
  }
  if (media.mediaType === 4) {
    ApiBridge.callNative('ClientAudioManager', 'deleteById', {
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
          ApiBridge.callNative('ClientVideoManager', 'deleteById', {
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
  ApiBridge.callNative('ClientViewManager', 'pushViewController', {
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
export function toAuthorPage (e, userId, loginId) {
  let pageType = (loginId === userId) ? 5 : 7

  ApiBridge.callNative('ClientViewManager', 'pushViewController', {
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

export function author2 (e, self) {
  // e.stopPropagation()

  // var $followTarget = e.target
  // var $curTarget = $(e.currentTarget)

  // if ($followTarget.tagName == 'A') {
  //   var $type = $($followTarget).hasClass('on') ? 1 : 0;
  //   var $info = {
  //     imgurl: $($followTarget).attr('userpic'),
  //     time: $($followTarget).attr('usertime') || '',
  //     userid: $($followTarget).attr('userid'),
  //     title: $($followTarget).attr('title'),
  //     description: $($followTarget).attr('userdesc') || '',
  //     username: $($followTarget).attr('username')
  //   }

  //   //单独拿出来vivo7使用
  //   ApiBridge.callNative("ClientDataManager", "getUserInfo", {}, function(user) {
  //     var pvMap = {
  //       "eventid":  'chejiahao_cancelorattention_click',
  //       "pagename": 'chejiahao_cancelorattention',
  //       "reportjson": {
  //         "userid#1": user.userId || '',
  //         "typeid#2": !$type ? '1': '2',
  //         "userid2#3": $curTarget.attr('userid') || '',
  //         "objecttypeid#4": $curTarget.attr('objecttypeid') || ''
  //       }
  //     };
  //     vm.chejiahaoClick(pvMap);

  //     //已登录
  //     if (!!Number(user.userId)) {
  //       if (!$type) {
  //         var $url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/Follow';
  //       } else {
  //         var $url = 'https://chejiahaoopen.api.autohome.com.cn/OpenUserService.svc/UnFollow';
  //       }
  //       vm.ajax({
  //         url: $url,
  //         type: "POST",
  //         isJson: true,
  //         data: {
  //           userId: $($followTarget).attr('userid'),
  //           _appid: vm.mobileType() == 'iOS' ? 'app' : 'app_android',
  //           pcpopclub: user.userAuth,
  //           autohomeua: user.userAgent
  //         },
  //         dataType: "json",
  //         success: function(res, xml) {
  //           res = JSON.parse(res);
  //           if (!!res.result) {
  //             if((!!$info.icon1) || (/author/.test(window.location.href))){
  //               var icon1 = {
  //                 icon1: !$type ? 'articleplatform_icon_correct' : 'articleplatform_icon_add',
  //                 icon1_p: !$type ? 'articleplatform_icon_correct_p' : 'articleplatform_icon_add_p',
  //               };
  //               vm.setRightIcon(icon1);
  //             }

  //             if (!$type) {
  //               $($followTarget).addClass('on');
  //               $($followTarget).html('已关注')
  //               ApiBridge.callNative('ClientViewManager', 'showToastView', {
  //                 type: 1,
  //                 msg: '关注成功'
  //               });
  //               //判断流
  //               if(/tag-name/.test(window.location.href)){
  //                 $($followTarget).remove();
  //               }
  //             } else {
  //               $($followTarget).removeClass('on');
  //               $($followTarget).html('+  关注')
  //               ApiBridge.callNative('ClientViewManager', 'showToastView', {
  //                 type: 1,
  //                 msg: '取消关注成功'
  //               })
  //             }
  //           }
  //         },
  //         fail: function(status) {}
  //       });
  //     } else {
  //       if (!$type) {
  //         var $url = 'addLocalDataForFollow';
  //       } else {
  //         var $url = 'deletLocalDataForFollow';
  //       }
  //       var post = !$type ? $info : { userid: $info.userid };
  //       ApiBridge.callNative('ClientDataManager', $url, post, function(result) {
  //         if (!!result.result) {
  //           if((!!$info.icon1) || (/author/.test(window.location.href))){
  //             var icon1 = {
  //               icon1: !$type ? 'articleplatform_icon_correct' : 'articleplatform_icon_add',
  //               icon1_p: !$type ? 'articleplatform_icon_correct_p' : 'articleplatform_icon_add_p',
  //             };

  //             vm.setRightIcon(icon1);

  //             //target = !!$('.c-att-href').length ? $('.c-att-href') : $('.c-auth-follow');
  //           }

  //           if (!$type) {
  //             $($followTarget).addClass('on');
  //             $($followTarget).html('已关注')
  //             ApiBridge.callNative('ClientViewManager', 'showToastView', {
  //               type: 1,
  //               msg: '关注成功'
  //             })
  //             //判断流
  //             if(/tag-name/.test(window.location.href)){
  //               $($followTarget).remove();
  //             }
  //           } else {
  //             $($followTarget).removeClass('on');
  //             $($followTarget).html('+  关注')
  //             ApiBridge.callNative('ClientViewManager', 'showToastView', {
  //               type: 1,
  //               msg: '取消关注成功'
  //             })
  //           }
  //         }
  //       })
  //     }
  //   })

  //   return;
  // }

  // ApiBridge.callNative("ClientDataManager", "getUserInfo", {}, function(user) {
  //   // if(!!vm.data.isClicked){
  //   //   return;
  //   // }
  //   // vm.data.isClicked = true;

  //   let pageType = (self.authInfo.userId === userId) ? 5 : 7
  //   vm.toAuthor(pagetype, $curTarget);
  // })
}

export function toArticleDetail (e, news) {
  let media = {
    mediaId: news.mediaId,
    mediaType: news.mediaType
  }
  deleteMedia(media)

  // 头像空白页跳转到最终页
  // if(e.target.className == 'c-media-info'){
  //   var typeid = $($curTarget).attr('mediatype');
  //   var odjectid = (typeid == '3' || typeid == '4') ? $($curTarget).attr('mediaid') : $($curTarget).attr('newsid');
  //   var pvMap = {
  //     "eventid":  'chejiahao_list_detail_click',
  //     "pagename": 'chejiahao_list_detail',
  //     "reportjson": {
  //       "userid#1": vm.data.userId,
  //       "typeid#2": $($curTarget).attr('mediatype'),
  //       "objectid#3": odjectid,
  //       "position#4": $($curTarget).attr('position')
  //     }
  //   };
  //   vm.chejiahaoClick(pvMap);
  //   ApiBridge.callNative('ClientViewManager', 'pushViewController', {
  //     pagetype: 2,
  //     animationtype: 2,
  //     param: {
  //       newsid: $($curTarget).attr('newsid'),
  //       type: $($curTarget).attr('mediatype'),
  //       autoscrolltocomment: 0
  //     }
  //   });
  //   return;
  // }
  // if (e.target.tagName != 'LI' && e.target.className == 'c-qing-img' &&  $(e.target).attr('imgnum') >= 3) {
  //   return;
  // }
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
  ApiBridge.callNative('ClientViewManager', 'pushViewController', {
    pagetype: 2,
    animationtype: 2,
    param: {
      newsid: news.newsId,
      type: news.mediaType,
      autoscrolltocomment: 0
    }
  })
}
