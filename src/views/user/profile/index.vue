<template>
  <div class="container">
    <van-nav-bar @click-right="saveUserInfo()" left-arrow @click-left="$router.back()" title="编辑资料" right-text="保存"></van-nav-bar>
    <van-cell-group>
      <!-- 头像 -->
      <van-cell is-link title="头像" center>
        <!-- 照片 -->
        <van-image
          @click="showPhoto = true"
          slot="default"
          width="1.5rem"
          height="1.5rem"
          fit="cover"
          round
          :src="user.photo"
        />
      </van-cell>
      <!-- 用户昵称 -->
      <van-cell @click="showName = true" is-link title="名称" :value="user.name" />
      <!-- 性别 -->
      <van-cell @click="showGender =true" is-link title="性别" :value='user.gender === 0 ? "男" :"女"' />
      <!-- 生日 -->
      <van-cell @click="showDate()" is-link title="生日" :value="user.birthday" />
    </van-cell-group>
    <!-- 头像弹层组件 -->
    <van-popup v-model="showPhoto" style="width:80%">
      <!-- 内容 1.选择本地图片 2.拍照 -->
      <van-cell @click="openChangeFile()" is-link title="本地相册选择图片"></van-cell>
      <van-cell is-link title="拍照"></van-cell>
    </van-popup>
    <!-- 昵称弹层 -->
    <van-popup round :close-on-click-overlay='false' v-model="showName" style="width:80%">
      <!-- 编辑用户昵称 双向绑定用户昵称-->
      <van-field :error-message="nameMsg"  v-model="user.name" type="textarea" rows="4"></van-field>
      <!-- 关闭 确定按钮 -->
        <van-button type="info"  size="large" block  @click="btnName">确定</van-button>
    </van-popup>
    <!-- 性别选择弹层 actions菜单选项 数组来定义展示的选项 -->
    <van-action-sheet @select="selectItem" :actions="actions" cancel-text="取消" v-model="showGender"></van-action-sheet>
    <!-- 生日弹层 -->
    <van-popup v-model="showBirthday" position="bottom">
      <!-- 选择出生日期 小于现在的时间 type是日期类型-->
      <van-datetime-picker
        v-model="currentDate"
        type="date"
        :min-date="minDate"
        :max-date="maxDate"
        @cancel="showBirthday=false"
        @confirm="confirmDate"
      >
      <!-- cancel 取消按钮事件 关闭弹层 -->
      <!-- confirm 确定按钮事件  -->
      </van-datetime-picker>
    </van-popup>
    <!-- 文件选择控件 不能让人看到  文件选择后就会触发change-->
    <input ref="myFile" @change="upload()" type="file" style="display:none">
  </div>
</template>

<script>
import { mapMutations } from 'vuex' // 引入辅助函数
import dayjs from 'dayjs' // 引入dayjs插件
import { getUserProfile, updateImg, saveUserInfo } from '@/api/user'
export default {
  name: 'user-profile',
  data () {
    return {
      minDate: new Date(1900, 1, 1), // 生日最小时间
      maxDate: new Date(), // 生日最大时间 永远小于等于当前时间
      currentDate: new Date(), // 当前时间
      showBirthday: false, // 是否显示生日弹层
      showPhoto: false, // 是否显示选择头像弹层
      showName: false, // 是否显示编辑昵称的弹层
      showGender: false, // 是否显示性别选择的弹层
      // 用户信息
      user: {
        name: '', // 用户昵称
        gender: '', // 0男 1女
        birthday: '' // 生日
      },
      actions: [{ name: '男' }, { name: '女' }], // 性别数据
      nameMsg: ''// 专门控制显示错误信息
    }
  },
  methods: {
    ...mapMutations(['updatePhoto']),
    // 修改昵称后 点击确定时触发
    btnName () {
      if (this.user.name.length < 1 || this.user.name.length > 7) {
        // 如果长度小于1 或者大于7 不符合要求
        this.nameMsg = '您的名称不符合规范'
        return false
      }
      // 如果满足 继续执行
      this.nameMsg = '' // 先把提示消息清空
      this.showName = false // 关闭弹层
    },
    // 点击选择性别时 触发事件
    selectItem (item) {
      this.user.gender = item.name === '男' ? 0 : 1
      this.showGender = false // 关闭弹层
    },
    // 点击生日时触发
    showDate () {
      // 要将字符串 2019-08-08 转化为日期类型
      this.currentDate = new Date(this.user.birthday)// 将当前用户的生日赋值给 组件
      this.showBirthday = true // 显示生日弹层
    },
    // 选中生日数据 点击确定时 触发
    confirmDate (data) {
      // 转化data格式 Sat Jul 01 1995 00:00:00 GMT+0800 (中国标准时间)
      this.user.birthday = dayjs(data).format('YYYY-MM-DD') // // 将转化后的结果赋值给 user中的生日
      this.showBirthday = false // 关闭弹窗
    },
    // 获取用户资料
    async getUserProfile () {
      let data = await getUserProfile()
      this.updatePhoto({ photo: data.photo }) // 更新用户头像
      this.user = data // 将数据赋值给user
    },
    // 点击选择图片时触发
    openChangeFile () {
      // 上传本地文件 获取文件上传的dom对象 this.$refs
      this.$refs.myFile.click()// 触发文件上传
    },
    // 头像 文件选择后触发
    async upload () {
      const file = this.$refs.myFile.files[0]
      let data = new FormData()
      data.append('photo', file)
      // 发送请求
      const res = await updateImg(data) // 上传成功后返回结果
      this.user.photo = res.photo // 将上传成功的图片 设置给头像
      this.showPhoto = false // 关闭弹层
      this.updatePhoto({ photo: res.photo }) // 更新头像
      this.$toast.success('修改头像成功')
    },
    // 保存 发送请求 不需要传photo数据
    async saveUserInfo () {
      try {
        await saveUserInfo({ ...this.user, photo: null })
        this.$toast.success('保存信息成功')
        this.$router.push('/user') // 跳转到个人中心
      } catch (error) {
        this.$toast.fail('保存失败')
      }
    }
  },
  created () {
    this.getUserProfile() // 调用获取用户资料的方法
  }
}
</script>

<style lang="less" scoped>
</style>
