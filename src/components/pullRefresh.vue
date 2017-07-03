<template>
  <div class="pull-down-content" @touchstart="touchStart" @touchmove="touchMove" @touchend="touchEnd">
    <div id="arrowIcon" :class="{down:!isStart}" v-if="isStart">
      <svg class="start" xmlns="http://www.w3.org/2000/svg" version="1.1"> 
        <rect x="1" y="1" rx="5" ry="5" width="15" height="15" style="fill:none;stroke:#999;stroke-width:1;fill-opacity:0.1; stroke-opacity:0.9"/> 
      </svg>
    </div>
    <div id="pullIcon" class="spinner anima" v-if="isEnd">
      <!-- <svg class="pull-re" xmlns="http://www.w3.org/2000/svg" version="1.1"> 
        <rect x="1" y="1" rx="5" ry="5" width="15" height="15" style="fill:none;stroke:#999;stroke-width:1;fill-opacity:0.1; stroke-opacity:0.9"/> 
      </svg> -->
      <svg class="active pull-ab rotate" fill-opacity='0' xmlns="http://www.w3.org/2000/svg" version="1.1"> 
        <rect x="1" y="1" rx="5" ry="5" width="15" height="15" style="fill:none;stroke:#000;stroke-width:1;fill-opacity:0.1; stroke-opacity:0.9"/> 
      </svg>
    </div>
    <p id="pullText" v-show="isStart">{{pullMsg}}</p>
  </div>
</template>
<script>
// import * as func from '../api/index.js'
// import * as util from '../api/util.js'
// import * as ApiBridge from '../mock/apibridge.mock.js'
// import zanAndComment from '../components/zanAndComment'
// import pullRefresh from '../components/pullRefresh'

export default {
  props: [],
  data: function () {
    return {
      dragThreshold: 0.3, // 临界值
      moveCount: 400, // 位移系数
      dragStart: null, // 开始抓取标志位
      percentage: 0, // 拖动量的百分比
      changeOneTimeFlag: 0, // 修改dom只执行1次标志位
      joinRefreshFlag: null, // 进入下拉刷新状态标志位
      refreshFlag: 0,
      isStart: false,
      isEnd: false,
      pullMsg: '下拉刷新'
    }
  },
  computed: {
    news: function () {
      return this.newsData
    }
  },
  methods: {
    touchStart: function (e) {
      this.isStart = true
      if (this.refreshFlag) {
        e.preventDefault()
        return
      }
      let event = e.touches[0]
      this.dragStart = event.clientY
    },
    touchMove: function (e) {
      // if (this.dragStart === null) {
      //   return
      // }

      // if (this.refreshFlag) {
      //   e.preventDefault()
      //   return
      // }

      // let target = e.touches[0]
      // let percentage = (this.dragStart - target.clientY) / window.screen.height
      // this.percentage = percentage
      // debugger
      // // 当且紧当scrolltop是0且往下滚动时才触发
      // if (document.body.scrollTop === 0) {
      //   if (percentage < 0) {
      //     e.preventDefault()
      //     if (!this.changeOneTimeFlag) {
      //       // pullArrow.show()
      //       // opt.beforePull && opt.beforePull()
      //       this.changeOneTimeFlag = 1
      //     }

      //     // let translateX = -percentage * this.moveCount
      //     this.joinRefreshFlag = true

      //     if (Math.abs(percentage) > this.dragThreshold) {
      //       this.pullMsg = '释放刷新'
      //       // pullArrow.removeClass('down')
      //       // pullArrow.addClass('up')
      //     } else {
      //       this.pullMsg = '下拉刷新'
      //       // pullArrow.removeClass('up')
      //       // pullArrow.addClass('down')
      //     }

      //     // if (percentage > 0) {
      //     //   dom.css('-webkit-transform', 'translate3d(0,' + translateX + 'px,0)')
      //     // } else {
      //     //   dom.css('-webkit-transform', 'translate3d(0,' + translateX + 'px,0)')
      //     // }
      //   } else {
      //     if (this.joinRefreshFlag === null) {
      //       this.joinRefreshFlag = false
      //     }
      //   }
      // } else {
      //   if (this.joinRefreshFlag === null) {
      //     this.joinRefreshFlag = false
      //   }
      // }
    },
    touchEnd: function (e) {
      if (this.percentage === 0) {
        return
      }

      if (this.refreshFlag) {
        e.preventDefault()
        return
      }

      if (Math.abs(this.percentage) > this.dragThreshold && this.joinRefreshFlag) {
        // opt.onRefresh && opt.onRefresh()
        // dom.css('-webkit-transition', '330ms')
        this.pullMsg = '正在刷新..'
        // pullIcon.show()
        // pullArrow.hide()
        // dom.css('-webkit-transform', 'translate3d(0,' + 50 + 'px,0)')

        // 进入下拉刷新状态
        this.refreshFlag = 1

        setTimeout(function () {
          this.pullMsg = '刷新成功'
          // pullIcon.hide()

          // dom.css('-webkit-transform', 'translate3d(0,0,0)')

          setTimeout(function () {
            // opt.afterPull && opt.afterPull()
            // 重置标志位
            this.refreshFlag = 0
          }, 300)
        }, 700)
      } else {
        if (this.joinRefreshFlag) {
          this.refreshFlag = 1
          // dom.css('-webkit-transition', '330ms')
          // dom.css('-webkit-transform', 'translate3d(0,0,0)')
          setTimeout(function () {
            // opt.afterPull && opt.afterPull()
            // 重置标志位
            this.refreshFlag = 0
          }, 300)
        }
      }

      // 重置changeOneTimeFlag
      this.changeOneTimeFlag = 0

      // 重置joinRefreshFlag
      this.joinRefreshFlag = null

      // 重置percentage
      this.dragStart = null

      // 重置percentage
      this.percentage = 0
    }
  }
}
</script>
<style lang="stylus" scoped>
.pull-down-content 
  display: block!important;
  margin-top: -65px;
  height: 65px;
  text-align: center;
  line-height: 55px;
  font-size: 14px;
  background-color: #f8f8f8;
  overflow:hidden;

#pullIcon
  position:absolute;
  z-index:11;
  width: 20px;
  height: 20px;
  display: block;
  margin: auto;
  vertical-align: middle;
  width 100%
  text-align center
  .pull-re
    // position:absolute;
    // top:15px;
    // z-index:12;
  
  .pull-ab
    // position:absolute;
    // top:15px;
    // z-index:13;
    &.rotate
      animation: rotate .8s steps(12) 1.3s infinite;
    
#pullIcon.anima
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: dash 2s linear 1 forwards;
  svg
    width:17px;
    height:17px;
    transform:rotate(45deg);
  
.pull-down-content #arrowIcon 
  position: absolute;
  width: 20px;
  height: 20px;
  display: block;
  margin:auto;
  vertical-align: middle;
  text-align center
  margin auto
  width 100%
  svg
    width 17px
    height 17px
    transform:rotate(45deg);

@keyframes dash 
  from 
    stroke-dashoffset:100;
  
  to 
    stroke-dashoffset:0; 
.pull-down-content .spinner 
  display: inline-block;
  margin-right: 8px;
#pullText
  position: relative;
  top: 20px;
</style>
