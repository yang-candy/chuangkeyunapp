/* eslint-disable */

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import Vue from 'vue'
import App from './App'
  
// require('./api/fastclick.js')

// if ('addEventListener' in document) {  
//   document.addEventListener('DOMContentLoaded', function () {  
//     window.FastClick.attach(document.body)  
//   }, false)  
// }  
const FastClick = require('fastclick')
FastClick.attach(document.body)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
})
/* eslint-disable no-new */