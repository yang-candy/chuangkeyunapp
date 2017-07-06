import * as ApiBridge from '../mock/apibridge.mock.js'

export function ajax (options) {
  let _w = window

  options = options || {}
  options.type = (options.type || 'GET').toUpperCase()
  options.dataType = options.dataType || 'json'
  let params = !options.isJson ? formatParams(options.data) : options.data
  let xhr
  // 创建 - 非IE6 - 第一步
  if (_w.XMLHttpRequest) {
    xhr = new XMLHttpRequest()
  } else {
    // IE6及其以下版本浏览器
    // xhr = new ActiveXObject('Microsoft.XMLHTTP')
  }
  // 接收 - 第三步
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      let status = xhr.status

      if (status >= 200 && status < 300) {
        options.success && options.success(xhr.responseText, xhr.responseXML)
      } else {
        options.fail && options.fail(status)
      }
    }
  }
    // 连接 和 发送 - 第二步
  if (options.type === 'GET') {
    xhr.open('GET', options.url + '?' + params, true)
    xhr.send(null)
  } else if (options.type === 'POST') {
    xhr.open('POST', options.url, true)
    // 设置表单提交时的内容类型
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    xhr.send(params)
  }

  // 格式化参数
  function formatParams (data) {
    let arr = []
    for (let name in data) {
      arr.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]))
    }
    arr.push(('v=' + Math.random()).replace('.', ''))
    return arr.join('&')
  }
}

export const api = {
  newListforvuser: 'api/newListforvuser',
  deleteForUserSelf: 'api/DeleteForUserSelf',
  zanSet: 'api/zanSet',
  npnewlistfortagid: 'api/npnewlistfortagid',
  getCategoryList: 'api/getCategoryList',
  getUserPageByCategory: 'api/getUserPageByCategory',
  npgetvuserlist: 'api/npgetvuserlist'
}

// export const api = {
//   newListforvuser: 'http://chejiahao.app.autohome.com.cn/chejiahao_v1.0.0/newspf/npnewListforvuser.json',
//   deleteForUserSelf: 'https://chejiahaoopen.api.autohome.com.cn/OpenInfoService.svc/DeleteForUserSelf',
//   zanSet: 'https://reply.autohome.com.cn/api/like/set.json?encode=utf-8',
//   npnewlistfortagid: 'http://chejiahao.app.autohome.com.cn/chejiahao_v1.0.0/newspf/npnewlistfortagid.json',
//   getCategoryList: 'http://chejiahao.app.autohome.com.cn/chejiahao_v1.0.0/newspf/getCategoryList.json',
//   getUserPageByCategory: 'http://chejiahao.app.autohome.com.cn/chejiahao_v1.0.0/newspf/getUserPageByCategory.json',
//   npgetvuserlist: 'http://chejiahao.app.autohome.com.cn/chejiahao_v1.0.0/newspf/npgetvuserlist.json'
// }

export function getParam (name, url) {
  if (!url) url = location.href
  // eslint-disable-next-line
  name = name.replace(/[\[]/, '\\\[').replace(/[\]]/, '\\\]')
  let regexS = '[\\?&]' + name + '=([^&#]*)'
  let regex = new RegExp(regexS)
  let results = regex.exec(url)

  return results == null ? null : results[1]
}

// 判断机型
export function mobileType () {
  let userAgent = navigator.userAgent || navigator.vendor || window.opera
  if (/windows phone/i.test(userAgent)) {
    return 'Windows Phone'
  }
  if (/android/i.test(userAgent)) {
    return 'Android'
  }
  if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    return 'iOS'
  }
  return 'unknown'
}

// ios设置下拉时顶部空白设置
export function setViewBounces () {
  ApiBridge.callNative('ClientViewManager', 'setScrollViewBounces', {
    bounces: 0
  })

  window.addEventListener('scroll', function () {
    if (document.body.scrollTop <= 0) {
      ApiBridge.callNative('ClientViewManager', 'setScrollViewBounces', {
        bounces: 0
      })
    } else {
      ApiBridge.callNative('ClientViewManager', 'setScrollViewBounces', {
        bounces: 1
      })
    }
  })
}

export function chejiahaoPv (pvMap) {
  ApiBridge.callNative('ClientPvManager', 'pageClick', {
    'eventid': pvMap.eventid,
    'pagename': pvMap.pagename,
    'reportjson': pvMap.reportjson
  })
}
