<template>
  <div class="container">
    <van-nav-bar title="黑马头条"
    right-text="搜索"
    fixed
    v-if='path'
    @click-right="$router.push('/search')"
    >
    </van-nav-bar>
    <!-- 二级路由 缓存二级路由容器 表示 这个容器下的所有组件都会被缓存-->
    <div class="my-wrapper" :class="{noTop:!path}" >
     <keep-alive>
      <router-view></router-view>
     </keep-alive>
    </div>
    <!-- 标签栏 -->
     <van-tabbar route>
      <van-tabbar-item to="/" icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item to="/question"  icon="chat-o">问答</van-tabbar-item>
      <van-tabbar-item to="/video"  icon="video-o">视频</van-tabbar-item>
      <van-tabbar-item to="/user"  icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  name: 'layout',
  computed: {
    // 是否显示navbarture
    path () {
      // 双方不等于的时候为ture 相等为false
      return this.$route.path !== '/user'
    }
  }
}
</script>

<style lang="less" scoped>
.container{
  width: 100%;
  height: 100%;
  position: relative;
  .my-wrapper{
    width: 100%;
    height: 100%;
    overflow: hidden;
    padding-top: 46px;
    padding-bottom: 50px;
    box-sizing: border-box;
    &.noTop{
      padding-top: 0;
    }
  }
}
</style>
