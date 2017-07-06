<template>
  <div ref="container" class="vue-pull-refresh">
    <div class="pull-down-content">
      <div id="arrowIcon" v-if="!loading">
        <svg class="start" xmlns="http://www.w3.org/2000/svg" version="1.1"> 
          <rect x="1" y="1" rx="5" ry="5" width="15" height="15" style="fill:none;stroke:#999;stroke-width:1;fill-opacity:0.1; stroke-opacity:0.9"/> 
        </svg>
      </div>
      <div id="pullIcon" class="spinner anima" v-if="loading">
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
    next: { // 刷新函数
      type: Function,
      required: true
    },
    before: { // 刷新函数
      type: Function,
      required: true
    }
  },
  data () {
    return {
      msg: '',
      flag: 0, // 表示是否达到刷新条件
      loading: 0,  // 表示是否正在刷新中
      touchStart: 0,  // 手指触摸屏幕的起点
      distance: 0     // 手指滑动的距离
    }
  },
  mounted () {
    const container = this.$refs.container
    container.addEventListener('touchstart', (e) => {
      // 如果loading为true就代表刷新函数正在进行，此时阻止下拉操作，返回
      if (this.loading) {
        e.preventDefault()
        return
      }
      // 取第一个手指的触摸点作为起始点
      this.touchStart = e.targetTouches[0].clientY
      this.before()
    })
    container.addEventListener('touchmove', (e) => {
      // 如果没有触摸起始点，返回
      if (!this.touchStart) {
        return
      }
      if (this.loading) {
        e.preventDefault()
        return
      }

      const touch = e.targetTouches[0]
      const scrollTop = container.scrollTop
      if (scrollTop === 0) {
        this.distance = touch.clientY - this.touchStart
        if (this.distance > 0) {
          e.preventDefault()
          if (this.distance < 80) {
            container.style.overflow = 'inherit'
            container.style.transform = 'translate3D(0px, ' + this.distance + 'px, 0px)'
            if (this.distance > 55) {
              this.msg = '释放刷新'
              this.flag = 1
            } else {
              this.msg = '下拉刷新'
            }
          }
        }
      }
    })
    container.addEventListener('touchend', (e) => {
      if (this.distance === 0) {
        return
      }
      if (this.loading) {
        e.preventDefault()
        return
      }
      if (this.flag && this.distance > 0) {
        container.style.transform = 'translate3D(0px, 50px, 0px)'
        this.msg = '正在刷新..'
        this.loading = 1
        this.next().then(() => {
          this.flag = 0
          this.loading = 0
          this.msg = '刷新成功'
          container.scrollTop = 0
          container.style.overflow = 'auto'
          container.style.transform = 'translate3D(0px, 0px, 0px)'
        })
        return
      }
      // 重置变量
      this.flag = 0
      container.style.overflow = 'auto'
      container.style.transform = 'translate3D(0px, 0px, 0px)'
    })
  }
}
</script>
<style lang="stylus" scoped>
.vue-pull-refresh 
  height 100%
  overflow-y auto
  transition 330ms
  -webkit-overflow-scrolling touch
  
.pull-down-content 
  display block!important
  margin-top -65px
  height 65px
  text-align center
  line-height 65px
  font-size 14px
  background-color #f8f8f8
  overflow hidden

#pullIcon
  position absolute
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
  top 20px
  
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
