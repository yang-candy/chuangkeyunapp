<template>
  <div id="app">
    <div :is="currentView"></div>
  </div>
</template>

<script>
import * as util from './util/util.js'
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
    if (util.getParam('page') === 'author') {
      this.currentView = 'Author'
    } else if (util.getParam('page') === 'tag-name') {
      this.currentView = 'TagName'
    } else if (util.getParam('page') === 'follow-more-tab') {
      this.currentView = 'followMore'
    } else if (util.getParam('page') === 'my-follow') {
      this.currentView = 'myFollow'
    } else if (util.getParam('page') === 'second-channel') {
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
