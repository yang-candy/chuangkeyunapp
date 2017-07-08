export function callNative (manage, event, map, fn) {
  var data
  switch (event) {
    case 'getUserInfo':
      data = {
        userId: '39144542',
        userPic: '',
        userName: 'Abc_wj',
        isAllowPost: '1',
        userAgent: 'iPhone\t10.3.2\tautohome\t8.2.5\tiPhone',
        userAuth: '080cba10c8164b0ab813829c23b7bcd902554c5e',
        isVUser: '0'
      }
      break
    case 'login':
      data = {
        result: 1
      }
      break
    case 'getNetworkState':
      data = {
        result: 1
      }
      break
    case 'getWifiState':
      data = {
        result: '0'
      }
      break
    case 'getVideoShowAlertState':
      data = {
        result: '1'
      }
      break
    case 'showAlertForVideoPlayAlertForNoWifi':
      data = {
        result: '1'
      }
      break
    case 'showDrawerView':
      data = {
        result: 0
      }
      break
    case 'getLocalDataForFollow':
      data = {
        result: [{
          userId: '11111'
        }, {
          userId: '22222'
        }, {
          userId: '33333'
        }]
      }
      break
    case 'getImageWithBlur':
      data = {
        result: ''
      }
      break
    case 'setRightIcon':
      data = {
        result: 'icon2'
      }
      break
    case 'addLocalDataForFollow':
      data = {
        result: '1'
      }
      break
    case 'deletLocalDataForFollow':
      data = {
        result: '1'
      }
      break
    case 'getSystemConstant':
      data = {
        uniqueDeviceIMEI: '1111'
      }
      break
    case 'deleteById':
      data = {
        result: 0
      }
      break
    case 'setTitleLabelCallback':
      data = {
        index: 1
      }
      break
  }
  if (fn) {
    fn(data)
  }
}
