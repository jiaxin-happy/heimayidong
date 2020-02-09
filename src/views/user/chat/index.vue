<template>
   <div class="container">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="小智同学"></van-nav-bar>
    <div class="chat-list" ref="mylist">
      <div :class="{left:item.name==='xz',right:item.name!=='xz'}" class="chat-item" v-for="(item,index) in list" :key="index">
        <van-image v-if="item.name==='xz'" fit="cover" round :src="XZImg" />
        <div class="chat-pao">{{item.msg}}</div>
        <van-image v-if="item.name!=='xz'" fit="cover" round :src="photo" />
      </div>
      <!-- <div class="chat-item right">
        <div class="chat-pao">ewqewq</div>
        <van-image  fit="cover" round :src="photo" />
      </div> -->
    </div>
    <div class="reply-container van-hairline--top">
      <van-field v-model="value" placeholder="说点什么...">
        <!-- 控制用户输入内容的频率 -->
        <van-loading v-if="loading" slot="button" type="spinner" size="16px"></van-loading>
        <!-- 点击发送的时候给小智同学发消息 -->
        <span v-else @click="send()" slot="button" style="font-size:12px;color:#999">发送</span>
      </van-field>
    </div>
  </div>
</template>

<script>
import io from 'socket.io-client' // 引入socket.io客户端代码
import { mapState } from 'vuex' // 引入辅助函数
import XZImg from '@/assets/xz.png' // 头像
export default {
  name: 'user-chat',
  data () {
    return {
      value: '',
      loading: false,
      XZImg, // 定义小智同学头像变量
      list: [] // 聊天记录
    }
  },
  computed: {
    ...mapState(['photo', 'user']) // 映射vuex中的公共变量
  },
  methods: {
    // 滚动到底部
    scrollBottom () {
      // scrollTop 滚动条位置距离顶部的距离
      // 需要将位置混动到底部
      // 因为vue更新数据都是异步的
      // nextTick 可以保证方法执行的时候 数据视图已经更新完毕
      // $nextTick会在上一次数据更新 并且视图渲染完毕之后才执行
      this.$nextTick(() => {
        this.$refs.mylist.scrollTop = this.$refs.mylist.scrollHeight
      })
    },
    async send () {
      if (!this.value) return false
      this.loading = true // 先打开加载状态
      // 设置一下时间的间隔
      await this.$sleep() // 休眠函数 500毫秒
      let obj = { name: 'self', msg: this.value, timestamp: Date.now() }
      // emit发消息 on接受消息
      this.socket.emit('message', obj) // 发送消息
      // 把刚才发送的消息 加到消息列表里
      this.list.push(obj) // 在数据中加了一条数据 需要渲染视图
      this.loading = false // 关闭加载状态
      this.value = '' // 清空输入框内容
      this.scrollBottom() //
    }
  },
  // 实例创建完毕执行的钩子函数
  created () {
    // 建立和websocket和服务器的连接
    // io(连接地址，额外参数)
    this.socket = io('http://ttapi.research.itcast.cn', {
      // query参数
      query: { token: this.user.token }
    }) // 用this.socket 接受了一个socketIO的实例对象
    // 连接数据
    this.socket.on('connect', () => {
      //  建立连接后 小智默认加一条记录
      this.list.push({ msg: '你好呀,秃头小呆子，一起拉呱把！', name: 'xz' })
    })
    // 需要监听小智同学回复的消息 回调函数中是有参数的 data中有msg（小智回复的内容）timestmp（小智同学回复的时间戳）
    // 只有小志同学回复的时候才会调用 //接消息
    this.socket.on('message', (data) => {
      this.list.push({ ...data, name: 'xz' }) // name 相当于记录一下 谁发了消息
      // 接受消息的时候也要去设置滚动条距离
      this.scrollBottom() // 滚动条距离
    })
  },
  // 钩子函数 页面销毁之前的钩子函数
  beforeDestroy () {
    // 退出页面之前,我们要将连接关闭
    this.socket.close()
  }
}
</script>

<style lang="less" scoped>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background:#fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item{
      padding: 10px;
      .van-image{
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao{
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before{
          content: "";
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top:0.5px solid #c2d9ea;
          border-right:0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right{
  text-align: right;
  .chat-pao{
    margin-left: 0;
    margin-right: 15px;
    &::before{
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left{
  text-align: left;
  .chat-pao{
    margin-left: 15px;
    margin-right: 0;
    &::before{
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
