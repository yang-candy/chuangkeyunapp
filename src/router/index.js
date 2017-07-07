import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import TagName from '../views/TagName'
import Author from '../views/Author'

Vue.use(Router)
export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/tag-name',
      name: 'TagName',
      component: TagName
    },
    {
      path: '/author',
      name: 'Author',
      component: Author
    }
  ]
})
