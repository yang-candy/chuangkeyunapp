<template>
  <div id="app">
    <div :is="currentView"></div>
  </div>
</template>

<script>
import Author from './views/Author'
import TagName from './views/TagName'
import followMore from './views/followMore'
import myFollow from './views/myFollow'
import secondChannel from './views/secondChannel'

export default {
  name: 'app',
  components: {
    Author,
    TagName,
    followMore,
    myFollow,
    secondChannel
  },
  mounted: function () {
    if (/author/.test(window.location.href)) {
      this.currentView = 'Author'
    } else if (/tag-name/.test(window.location.href)) {
      this.currentView = 'TagName'
    } else if (/follow-more-tab/.test(window.location.href)) {
      this.currentView = 'followMore'
    } else if (/my-follow/.test(window.location.href)) {
      this.currentView = 'myFollow'
    } else if (/second-channel/.test(window.location.href)) {
      this.currentView = 'secondChannel'
    }
  },
  data: function () {
    return {
      currentView: ''
    }
  }
}
</script>

<style lang="stylus">
#app{
  position absolute
  top 0
  bottom 0
  vertical-align middle
  width 100%
  height 100%
  background #fff
}
@import './style/index.styl'
</style>
