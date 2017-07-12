/* eslint-disable */

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import App from './App'
  
const FastClick = require('fastclick')
FastClick.attach(document.body)

import VueLazyload from 'vue-lazyload'

// use custom directive
Vue.use(VueLazyload)

// use options
Vue.use(VueLazyload, {
  preLoad: 1.3,
  error: '',
  loading: 'dist/loading.gif',
  attempt: 1
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
/* eslint-disable no-new */