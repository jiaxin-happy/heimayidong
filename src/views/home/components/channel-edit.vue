<template>
   <div class="channel-edit">
     <div class="channel">
      <div class="tit">
        我的频道：
        <span class="tip">点击可进入频道</span>
        <van-button v-if="!editing" @click="editing=true" size="mini" type="info" plain>编辑</van-button>
        <van-button v-else @click="editing=false" size="mini" type="danger" plain>完成</van-button>
      </div>
      <van-grid class="van-hairline--left">
        <van-grid-item v-for="(item,i) in channels" :key="item.id">
          <span :class="{red: i=== activeIndex}" @click="$emit('selectChannel',item.id)" class="f12">{{ item.name }}</span>
          <!-- 通过编辑状态 来控制 叉号图标的显示和隐藏 -->
          <!-- 先控制第一个推荐频道不允许删除 -->
          <template v-if="i!==0">
            <van-icon @click="$emit('delChannel',item.id)" v-show="editing" class="btn" name="cross"></van-icon>
          </template>
        </van-grid-item>
      </van-grid>
    </div>
    <div class="channel">
      <div class="tit">可选频道：
          <span class="tip">点击可添加频道</span>
      </div>
      <van-grid class="van-hairline--left">
        <van-grid-item v-for="channel in optionalChannels" :key="channel.id">
          <span class="f12">{{channel.name}}</span>
             <van-icon @click="$emit('addChannel',channel)" class="btn" name="plus"></van-icon>
        </van-grid-item>
      </van-grid>
    </div>
  </div>
</template>

<script>
import { getAllChannels } from '@/api/channels'
export default {
  data () {
    return {
      editing: false, // 是否正在编辑
      allChannels: [] // 用来接收所有的频道
    }
  },
  props: {
    channels: {
      type: Array,
      required: true,
      default: () => [] // eslint 要求我们必须用一个函数来声明数组类型 所以用箭头函数
    },
    activeIndex: {
      type: Number // 接收频道激活索引
    }
  },
  methods: {
    async  getAllChannels () {
      let data = await getAllChannels()
      this.allChannels = data.channels// 给所有频道赋值
    }
  },
  created () {
    this.getAllChannels()
  },
  computed: {
    //   可选频道 =  全部频道  - 当前的频道
    optionalChannels () {
      return this.allChannels.filter(item => !this.channels.some(o => o.id === item.id))
    }
  }
}
</script>

<style lang='less' scoped>
.channel-edit {
  .channel {
    padding: 10px;
    .tit {
      line-height: 3;
      .tip {
        font-size: 10px;
        color: #999;
      }
    }
    .van-button {
      float: right;
      margin-top: 7px;
    }
    .btn {
      position: absolute;
      bottom: 0;
      right: 0;
      background: #ddd;
      font-size: 12px;
      color: #fff;
    }
    .f12 {
      font-size: 12px;
      color: #555;
    }
    .red {
      color: red;
    }
  }
}
</style>
