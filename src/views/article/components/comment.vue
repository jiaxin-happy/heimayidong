<template>
<!-- 评论列表组件 -->
  <div class="comment">
    <!-- 列表  上拉加载  loading  是否开启加载状态 finished 是否已经全部加载完成 -->
    <van-list @load="onLoad" v-model="loading" :finished="finished" finished-text="没有更多了">
      <div class="item van-hairline--bottom van-hairline--top" v-for="comment in comments" :key="comment.com_id.toString()">
        <van-image
          round
          width="1rem"
          height="1rem"
          fit="fill"
          :src="comment.aut_photo"
        />
        <div class="info">
          <p>
            <span class="name">{{comment.aut_name}}</span>
            <span style="float:right">
              <span class="van-icon van-icon-good-job-o zan"></span>
              <span class="count">{{ comment.like_count }}</span>
            </span>
          </p>
          <p>{{comment.content}}</p>
          <p>
            <span class="time">{{comment.pubdate | relTime}}</span>&nbsp;
            <!-- 通过方法 传递 点击的评论id -->
            <van-tag plain @click="openReply(comment.com_id)">{{comment.reply_count}}回复</van-tag>
          </p>
        </div>
      </div>
    </van-list>
    <!-- 提交模块 -->
    <div class="reply-container van-hairline--top">
      <!-- v-model修饰符 -->
      <van-field v-model.trim="value" placeholder="写评论...">
        <!-- van-loading通过submiting来控制显示 -->
        <van-loading v-if="submiting" slot="button" type="spinner" size="16px"></van-loading>
        <span class="submit" @click="submit()" v-else slot="button">提交</span>
      </van-field>
    </div>
    <!-- 回复列表组件 -->
    <!-- 退出时 把评论id置为空 -->
    <van-action-sheet @closed="reply.commentId=null"  :round="false" class="reply_dailog" v-model="showReply" title="回复评论">
      <!-- 回复列表组件 -->
      <!-- :immediate-check="false" 控制当前van-list 是否主动检查滚动  -->
      <van-list @load="getReplys()" :immediate-check="false" v-model="reply.loading" :finished="reply.finished" finished-text="没有更多了">
        <!-- 要循环的数据 -->
         <div class="item van-hairline--bottom van-hairline--top" v-for="item in reply.list" :key="item.com_id.toString()">
          <van-image round width="1rem" height="1rem" fit="fill" :src="item.aut_photo" />
          <div class="info">
            <p><span class="name">{{item.aut_name}}</span></p>
            <p>{{item.content}}</p>
            <p><span class="time">{{item.pubdate|relTime}}</span></p>
          </div>
        </div>
      </van-list>
    </van-action-sheet>
  </div>

  <!-- 都不输入框 -->
</template>

<script>
import { getComments, commentOrReply } from '@/api/article' // 获取评论 回复评论
export default {
  data () {
    return {
      // 上拉加载中
      loading: false,
      // 全部加载完毕
      finished: false,
      // 输入的内容
      value: '',
      // 控制提交中状态数据
      submiting: false,
      // 用来存放评论列表的数据
      comments: [],
      // 分页依据 如果为空 表示从第一页开始
      offset: null,
      // 控制回复列表组件的显示和隐藏
      showReply: false,
      // 存放回复相关的数据
      reply: {
        loading: false, // 上拉加载中
        finished: false, // 全部加载完毕
        offset: null, // 偏移量
        list: [], // 用于存放当前弹出的关于某个评论的数据
        commentId: null // 用来存放当前点击的评论的id
      }
    }
  },
  methods: {
    // 提交评论的方法
    async submit () {
      if (!this.value) return false // 表示如果当前评论内容为空就立刻返回
      this.submiting = true // 将提交状态设为ture 控制用户单位时间内评论的数据次数 进度条状态
      await this.$sleep() // 强制等待500 毫秒
      try {
        // 评论 两种情况 对文章进行评论 对评论进行评论
        // 不为空 继续
        // 两种方式 showReply回复列表组件的显示隐藏 或  reply.commentId评论的id有没有
        const data = await commentOrReply({
          content: this.value, // 评论的内容
          // 要么是文章id 要么是评论id
          target: this.reply.commentId ? this.reply.commentId.toString() : this.$route.query.articleId,
          art_id: this.reply.commentId ? this.$route.query.articleId : null
        })
        // 评论成功后 将评论的数据呈现到视图上
        // 加到哪个数组的最前面
        if (this.reply.commentId) {
        // 对评论进行评论
          this.reply.list.unshift(data.new_obj) // 将数据追加到队首
          // 该评论的回复次数 +1 找到对应的评论
          // 如果找到了 comment就是找到的对象 如果找不到 comment就是一个undefined
          const comment = this.comments.find(item => item.com_id.toString() === this.reply.commentId.toString())
          console.log(comment)
          comment && comment.reply_count++ // 如果找到  就对回复数据加1
        } else {
          // 对文章进行评论
          this.comments.unshift(data.new_obj)
        }
        this.value = '' // 清空输入框
      } catch (error) {
        this.$notify({ type: 'danger', message: '评论失败' })
      }
      this.submiting = false // 关闭进度条
      this.$notify({ type: 'success', message: '评论成功' })
    },
    // 打开回复
    openReply (commentId) {
      this.showReply = true // 弹出面板
      // 若干操作
      this.reply.commentId = commentId // 存放当前点击的commentid
      this.reply.list = [] // 清空原来的数据
      this.reply.offset = null // 重置回复的偏移量 因为每隔评论的评论都是从第一页开始
      this.reply.finished = false // 设置成原始状态
      this.reply.loading = true // 主动打开加载状态 因为这时没有了自动检查
      // 开始加载第一页的数据
      this.getReplys() // 开始调用第一页的数据
    },
    // 获取回复 评论的评论 二级评论
    async getReplys () {
      // 加载逻辑
      let data = await getComments({
        type: 'c', // 代表评论的评论
        offset: this.reply.offset, // 偏移量
        source: this.reply.commentId.toString() // 获取评论的id
      })
      this.reply.list.push(...data.results) // 将评论的评论追加到数据尾部
      // 拿到的data是请求来的第一页的数据
      this.reply.loading = false // 关闭评论的评论的加载状态
      this.reply.finished = data.last_id === data.end_id // 如果他俩相等表示加载完毕
      if (!this.reply.finished) {
        // 表示还有下一页数据
        this.reply.offset = data.last_id // 把当前页的最后一个id给偏移量 作为请求下一页的请求数据
      }
    },
    // 获取评论数据 一级评论
    async onLoad () {
      let data = await getComments({
        type: 'a', // 获取类型
        offset: this.offset, // 偏移量
        source: this.$route.query.articleId // 获取文章id
      })
      this.comments.push(...data.results) // 将数据添加到当前评论泪飙的尾部
      this.loading = false // 关闭正在上拉加载状态
      this.finished = data.last_id === data.end_id // 如果他俩相等表示 数据加载完毕 当前页最后评论的id = 最后一个评论的id
      if (!this.finished) {
        //  last-id != end-id 表示下一页还有数据
        this.offset = data.last_id // 将last_id设置成下一页的请求数据
      }
    }
  }
}
</script>

<style lang='less' scoped>
.comment {
  margin-top: 10px;
  /deep/ .item {
    display: flex;
    padding: 10px 0;
    .info {
      flex: 1;
      padding-left: 10px;
      .name{
        color:#069;
      }
      .zan{
        vertical-align:middle;
        padding-right:2px;
      }
      .count{
        vertical-align:middle;
        font-size:10px;
        color: #666;
      }
      .time{
        color: #666;
      }
      p {
        padding: 5px 0;
        margin: 0;
      }
    }
  }
  /deep/ .van-button:active::before {
    background: transparent;
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
  .submit {
    font-size: 12px;
    color: #3296fa;
  }
}
.reply_dailog {
  height: 100%;
  max-height: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
  .van-action-sheet__content{
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 44px;
  }
}
</style>
