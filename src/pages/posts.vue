<template>
  <ul class="posts-container">
    <li v-for="(post, index) in posts" :key="index">1234</li>
  </ul>
</template>

<script>
import { mapState, mapActions } from "vuex";
export default {
  // 这是vue为ssr专门提供的生命周期函数
  serverPrefetch() {
    return this.getPosts();
  },

  computed: {
    ...mapState(["posts"]),
  },

  methods: {
    ...mapActions(["getPosts"]),
  }
};
</script>

<style>
</style>