import { createRouter, createWebHashHistory } from 'vue-router'
import { gallery_demos } from '../components/gallery-index'
import HomeView from '../views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    // component: () => import(/* webpackChunkName: "about" */ '../views/HomeView.vue'),
    component: HomeView,
    meta: {
      title: '主页'
    }
  }
].concat(gallery_demos)

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title){
    document.title = to.meta.title
  }
  next()
})

export default router
