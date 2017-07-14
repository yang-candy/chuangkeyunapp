/* eslint-disable */

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import App from './App'

// fastclick setting  
const FastClick = require('fastclick')
FastClick.attach(document.body)

// image lazy load setting
import VueLazyload from 'vue-lazyload'
import imageList from './util/image.js'
Vue.use(VueLazyload, {
  preLoad: 16/9,
  error: imageList.defaultImg,
  loading: imageList.defaultImg,
  attempt: 3,
  filter: {
    progressive (listener) {
      if (listener.el.getAttribute('imgType')) {
        listener.el.setAttribute('lazy-progressive', 'true')
        listener.loading = listener.src + '?imageView2/1/w/10/h/10'
      }
      const imgType = listener.el.getAttribute('imgType')
      switch (imgType) {
        case 'head':
          listener.loading = listener.error = imageList.picHead
          break
        case 'headBg':
          listener.loading = listener.error = imageList.navbarBg
          break
        case 'audio':
          listener.loading = listener.error = imageList.audioDefault
          break
        default:
          listener.loading = listener.error = imageList.defaultImg
          break
      }
    }
  }
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
/* eslint-disable no-new */