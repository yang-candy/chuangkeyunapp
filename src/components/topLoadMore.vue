<template>
  <div ref="container" class="vue-pull-refresh" @touchstart.stop="touchStart" @touchmove="touchMove" @touchend="touchEnd">
    <div class="pull-down-content">
      <div id="arrowIcon" v-if="!loading">
        <svg class="start" xmlns="http://www.w3.org/2000/svg" version="1.1"> 
          <rect x="1" y="1" rx="5" ry="5" width="15" height="15" style="fill:none;stroke:#999;stroke-width:1;fill-opacity:0.1; stroke-opacity:0.9"/> 
        </svg>
      </div>
      <div id="pullIcon" class="spinner anima" v-else-if="loading">
        <svg class="active pull-ab rotate" fill-opacity='0' xmlns="http://www.w3.org/2000/svg" version="1.1"> 
          <rect x="1" y="1" rx="5" ry="5" width="15" height="15" style="fill:none;stroke:#000;stroke-width:1;fill-opacity:0.1; stroke-opacity:0.9"/> 
        </svg>
      </div>
    <p id="pullText">{{msg}}</p>
    </div>
    <slot name="list"></slot>
  </div>
  
</template>
<script>
export default {
  props: {
    beforePull: { // 刷新函数
      type: Function,
      required: true
    },
    afterPull: { // 刷新函数
      type: Function,
      required: true
    }
  },
  data () {
    return {
      msg: '',
      container: '',
      flag: 0, // 表示是否达到刷新条件
      loading: 0,  // 表示是否正在刷新中
      distance: 0,     // 手指滑动的距离
      dragThreshold: 0.3, // 临界值
      moveCount: 400, // 位移系数
      dragStart: null, // 开始抓取标志位
      percentage: 0, // 拖动量的百分比
      changeOneTimeFlag: 0, // 修改dom只执行1次标志位
      joinRefreshFlag: null // 进入下拉刷新状态标志位
    }
  },
  methods: {
    touchStart (e) {
      this.container = this.$refs.container
      // 如果loading为true就代表刷新函数正在进行，此时阻止下拉操作，返回
      this.msg = '下拉刷新'
      if (this.loading) {
        e.preventDefault()
        return
      }
      // 取第一个手指的触摸点作为起始点
      this.dragStart = e.touches[0].clientY
      this.container.style.transition = 'none'
      // func.deleteMedia(this.media)
    },
    touchMove (e) {
      // 如果没有触摸起始点，返回
      if (!this.dragStart) {
        return
      }
      if (this.loading) {
        e.preventDefault()
        return
      }

      const clientY = e.touches[0].clientY
      const scrollTop = document.body.scrollTop
      // 当且紧当scrolltop是0且往下滚动时才触发
      if (scrollTop === 0) {
        this.percentage = (this.dragStart - clientY) / window.screen.height
        if (this.percentage < 0) {
          e.preventDefault()
          if (!this.changeOneTimeFlag) {
            this.beforePull && this.beforePull()
            this.changeOneTimeFlag = 1
          }
          let translateX = -this.percentage * this.moveCount
          this.joinRefreshFlag = true

          if (Math.abs(this.percentage) > this.dragThreshold) {
            this.msg = '释放刷新'
          } else {
            this.msg = '下拉刷新'
          }
          this.container.style.transform = 'translate3D(0px, ' + translateX + 'px, 0px)'
        } else {
          if (!this.joinRefreshFlag) {
            this.joinRefreshFlag = false
          }
        }
      } else {
        if (!this.joinRefreshFlag) {
          this.joinRefreshFlag = false
        }
      }
    },
    touchEnd (e) {
      if (this.percentage === 0) {
        return
      }
      if (this.loading) {
        e.preventDefault()
        return
      }
      if (Math.abs(this.percentage) > this.dragThreshold && this.joinRefreshFlag) {
        this.container.style.transition = '330ms'
        this.msg = '正在刷新..'
        this.loading = 1
        this.container.style.transform = 'translate3D(0px, 50px, 0px)'
        setTimeout(() => {
          this.msg = '刷新成功'
          this.container.style.transform = 'translate3d(0, 0, 0)'
          setTimeout(() => {
            this.afterPull && this.afterPull()
            // 重置标志位
            this.loading = 0
          }, 300)
        }, 700)
      } else {
        if (this.joinRefreshFlag) {
          this.loading = 1
          this.container.style.transition = '330ms'
          this.container.style.transform = 'translate3D(0px, 0px, 0px)'
          setTimeout(() => {
            this.afterPull && this.afterPull()
            // 重置标志位
            this.loading = 0
          }, 300)
        }
      }
      // 重置变量
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
.vue-pull-refresh 
  transition 330ms
  -webkit-overflow-scrolling touch
  
.pull-down-content 
  position relative
  display block!important
  height 65px
  margin-top -65px
  text-align center
  line-height 65px
  font-size 14px
  background-color #f8f8f8
  overflow hidden

#pullIcon
  position absolute
  top -6px
  z-index 11
  width 20px
  height 20px
  display block
  margin auto
  vertical-align middle
  width 100%
  text-align center
  .rotate
    animation rotate .8s steps(12) 1.3s infinite
    
#pullIcon.anima
  stroke-dasharray 100
  stroke-dashoffset 100
  animation dash 2s linear 1 forwards
  svg
    width 17px
    height 17px
    transform rotate(45deg)
  
#arrowIcon 
  position absolute
  top -6px
  width 20px
  height 20px
  display block
  margin auto
  vertical-align middle
  text-align center
  margin auto
  width 100%
  svg
    width 17px
    height 17px
    transform rotate(45deg)

.spinner 
  display inline-block
  margin-right 8px
#pullText
  position relative
  top 12px
  
@keyframes dash 
  from 
    stroke-dashoffset 100
  to 
    stroke-dashoffset 0 
    
@-webkit-keyframes rotate 
  0%
    transform rotate(0deg)
  
  100%
    transform rotate(360deg)
</style>
