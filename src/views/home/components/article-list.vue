<template>
  <!-- 这里注意 这个div设置了滚动条 目的是 给后面做 阅读记忆 留下伏笔 -->
  <!-- 阅读记忆 => 看文章看到一半 滑到中部 去了别的页面 当你回来时 文章还在你看的位置 -->
  <div ref="myScroll" class="scroll-wrapper" @scroll="remember">
    <van-pull-refresh v-model="downLoading" @refresh="onRefresh" :success-text="refreshSuccessText">
       <!-- 放置list组件list组件可以实现 上拉加载 -->
      <van-list v-model="upLoading" :finished="finished" @load="onLoad" finished-text="没有更多了">
        <!-- v-for 渲染数据 -->
        <!-- 点击van-cell 跳转到文章详情 -->
        <!-- query传值(?id=123)  params传值(/123) -->
        <van-cell :to="`/article?articleId=${article.art_id.toString()}`" v-for="article in articles" :key="article.art_id.toString()">
          <div class="article_item">
            <h3 class="van-ellipsis">{{ article.title }}</h3>
            <!-- 三图模式 -->
            <div class="img_box" v-if="article.cover.type === 3">
              <van-image lazy-load class="w33" fit="cover" :src="article.cover.images[0]" />
              <van-image lazy-load class="w33" fit="cover" :src="article.cover.images[1]" />
              <van-image lazy-load class="w33" fit="cover" :src="article.cover.images[2]" />
            </div>
            <!-- 单图模式 -->
            <div class="img_box" v-else-if="article.cover.type === 1">
              <van-image lazy-load class="w100" fit="cover" :src="article.cover.images[0]" />
            </div>
            <div class="info_box">
              <span>{{ article.aut_name }}</span>
              <span>{{ article.comm_count }} 评论</span>
              <!-- 使用过滤器  表达式 | 过滤器名称 -->
              <span>{{ article.pubdate | relTime }}</span>
              <!-- 判断是否显示 叉号图标 -->
              <!-- 点击叉号 要告诉父组件 我要反馈 -->
              <span class="close" v-if="user.token" @click.stop="$emit('showMoreAction',article.art_id.toString())">
                <van-icon name="cross"></van-icon>
              </span>
            </div>
          </div>
        </van-cell>
      </van-list>
    </van-pull-refresh>
  </div>
</template>

<script>
import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import eventBus from '@/utils/eventBus'
export default {
  name: 'article-list',
  data () {
    return {
      scrollTop: 0, // 记录滚动的位置 记录当前文章列表实例的滚动位置
      upLoading: false, // 上拉加载中
      finished: false, // 是否全部加载完成
      articles: [], // 文章列表
      downLoading: false, // 下拉刷新
      refreshSuccessText: null, // 刷新成功的文案
      timestamp: null // 定义一个时间戳 这个时间戳用来告诉服务器 现在我要求什么样的时间的数据
    }
  },
  computed: {
    // 映射vuex中的store对象到计算属性上
    ...mapState(['user'])
  },
  props: {
    channel_id: {
      type: Number, // 指定要传的props的类型
      required: true, // 要求props必须传
      default: null // 给props一个默认值
    }
  },
  methods: {
    // 记录位置的方法
    remember (event) {
      this.scrollTop = event.target.scrollTop
    },
    async onLoad () {
      await this.$sleep() // 等待 sleep  resovle
      // setTimeout(() => {
      //   if (this.articles.length < 50) {
      //     // 停止追加
      //     this.finished = true
      //     let arr = Array.from(
      //       Array(10),
      //       (value, index) => this.articles.length + index + 1
      //     )
      //     // 原数组尾部追加新数组
      //     this.articles.push(...arr)
      //     // 修改upLoading值
      //     this.upLoading = false
      //   } else {
      //     this.finished = true
      //   }
      // }, 1000)
      let data = await getArticles({
        channel_id: this.channel_id,
        timestamp: this.timestamp || Date.now()
      })
      // 追加数据到队尾
      this.articles.push(...data.results)
      // 关闭加载状态
      this.upLoading = false
      if (data.pre_timestamp) {
        // 如果有
        this.timestamp = data.pre_timestamp
      } else {
        this.finished = true // 没有数据了
      }
    },
    // 下拉刷新方法
    async onRefresh () {
      await this.$sleep() // 等待 sleep  resovle
      // 触发下拉刷新
      const data = await getArticles({
        channel_id: this.channel_id,
        timestamp: Date.now() })
      this.downLoading = false // 关掉下拉状态
      // 有可能 最新没有推荐数据
      if (data.results.length) {
        // 如果长度大于0 表示有数据
        this.articles = data.results // 将历史数据全都覆盖掉了
        // 假如你之前 已经将 上拉加载设置成finished设置成true了
        // 表示 我们还需要继续往下拉 就需要把原来的状态再次打开
        this.finished = false
        // 注意我们依然需要获取此次的历史事件戳
        this.timestamp = data.pre_timestamp // 赋值历史时间戳 因为当你下拉刷新之后 上拉加载的时候 要用到这个历史事件戳
        this.refreshSuccessText = `更新了${data.results.length}条数据`
      } else {
        //  如果没有数据更新  什么都不需要变化
        this.refreshSuccessText = '已是最新数据'
      }
    }
  },
  // 即使启用了组件缓存 created函数也依然会被执行 但只会执行一次
  created () {
    // 开启监听
    eventBus.$on('delArticle', (articleId, channelId) => {
      if (this.channel_id === channelId) {
        // 这个条件表示 该列表就是当前激活的列表
        let index = this.articles.findIndex(item => item.art_id.toString() === articleId) // 查找对应的文章
        // 如果index大于 -1 表示找到了 就要删除
        if (index > -1) {
          this.articles.splice(index, 1) // 删除不喜欢的文章
        }
      }
    })
    // 只要开启一次监听 以后触发了事件 就会进入到回调函数
    // 监听当前tab切换的事件
    eventBus.$on('changeTab', id => {
      if (id === this.channel_id) {
        // 为什么没有滚动啊
        // 因为切换事件后 会执行dom的更新 dom的更新是异步的
        // 如果相等 就是找对了article-list
        // $nextTick会保证changetab动作完成并且完成页面渲染之后执行
        this.$nextTick(() => {
          if (this.scrollTop && this.$refs.myScroll) {
          // 表示该文章列表 是存在滚动的
            this.$refs.myScroll.scrollTop = this.scrollTop
          }
        })
      }
    })
  },
  // 激活函数 第一次并不会被执行 而是再已经缓存后执行
  activated () {
    // 不为0 且dom元素存在的情况下 才去滚动
    if (this.scrollTop && this.$refs.myScroll) {
      // 需要在组件重新激活的时候 重新设置原来的滚动条
      this.$refs.myScroll.scrollTop = this.scrollTop // 将原来记录的位置给dom元素
    }
  }

}
</script>

<style lang="less" scoped>
.article_item {
  h3 {
    font-weight: normal;
    line-height: 2;
  }
  .img_box {
    display: flex;
    justify-content: space-between;
    .w33 {
      width: 33%;
      height: 90px;
    }
    .w100 {
      width: 100%;
      height: 180px;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    font-size: 12px;
    span {
      padding-right: 10px;
      &.close {
        border: 1px solid #ddd;
        border-radius: 2px;
        line-height: 15px;
        height: 12px;
        width: 16px;
        text-align: center;
        padding-right: 0;
        font-size: 8px;
        position: absolute;
        right: 0;
        top: 7px;
      }
    }
  }
}
</style>
