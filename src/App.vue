<template>
  <div id="app">
    <router-link to="/">go home</router-link>
    <br />
    <router-link to="about">go about2</router-link>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <Posts />
  </div>
</template>

<script>
import Posts from './pages/posts.vue'
export default {
  name: 'App',
  components: {
    Posts
  },
  data(){
    return {
      message: 11112
    }
  }
}
</script>

<style>

</style>