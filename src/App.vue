<template>
  <div id="app">
    <!-- $route.meta.isAlive 如果为true 就需要keep-alive包裹 -->
    <!-- 一级路由容器 都进行了缓存 -->
    <keep-alive>
      <router-view v-if="$route.meta.isAlive"></router-view>
    </keep-alive>
    <router-view  v-if="!$route.meta.isAlive" />
  </div>
</template>

<style lang="less">

</style>
