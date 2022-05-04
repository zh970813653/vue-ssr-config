import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

export const createRouter = () => {
  const router = new VueRouter({
    mode: 'history', // 兼容前后端
    routes: [
      {
        path: '/',
        name: 'Home',
        component: ()=> import('@/pages/Home')
      },
      {
        path: '/about',
        name: 'About',
        component: ()=> import('@/pages/About')
      },
      {
        path: '*',
        name: 'error404',
        component: ()=> import('@/pages/404')
      }
    ]
  })
  return router
}