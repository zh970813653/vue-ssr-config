import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export const createStore = () => {
  const store = new Vuex.Store({
    // module
    state(){
      return {
        posts: []
      }
    },
    mutations: {
      SET_POSTS(state,data){
        state.posts = data
      }
    },
    actions: {
      async getPosts({commit}){
          const data = await axios.get('https://cnodejs.org/api/v1/topics')
          return commit('SET_POSTS', data.data)
      }
    }
  })
  return store
}