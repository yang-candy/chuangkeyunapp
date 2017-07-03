<template>
  <div id="app">
    <!-- <author></author> -->
    <div :is="component"></div>
  </div>
</template>

<script>
import Author from './views/Author'
import TagName from './views/TagName'

export default {
  name: 'app',
  components: {
    Author,
    TagName
  },
  mounted: function () {
    if (/author/.test(window.location.href)) {
      this.component = 'Author'
    } else if (/tag-name/.test(window.location.href)) {
      this.component = 'TagName'
    }
  },
  data: function () {
    return {
      component: ''
    }
  }
}
</script>

<style lang="stylus">
#app{
  position: absolute;
  top: 0;
  bottom: 0;
  vertical-align: middle;
  width: 100%;
  height: 100%;
}
@import './style/index.styl';
</style>
