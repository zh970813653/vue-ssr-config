import Vue from 'vue'
import App from './App.vue'
import { createRouter } from './router'
import {createStore} from './store'
import VueMeta from 'vue-meta' 

Vue.use(VueMeta)

// Vue.mixin({
//   metaInfo: {
//     titleTemplate: '%s'
//   }
// })

export function createApp () {
  // 创建 router 实例
  const router = createRouter()
  const store = createStore()
  const app = new Vue({
    router, // 把路由挂载到 Vue 根实例中
    store, 
    render: h => h(App)
  })
  return {
    app,
    router,
    store
  }
}