import Vue from 'vue'
import Vuex from 'vuex'
import * as auth from '@/utils/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用户信息
    user: auth.getUser(), // 从缓存中拿
    photo: null // 用户头像 作为公共数据 进行状态共享
  },
  mutations: {
    updateUser (state, payload) {
      // 更新state的状态
      state.user = payload.user
      // 更新本地存储
      auth.setUser(payload.user)
    },
    // 清空user
    clearUser (state) {
      state.user = {}
      auth.delUser()
    },
    // 更新用户头像  载荷是携带参数用的
    updatePhoto (state, payload) {
      state.photo = payload.photo // 载荷里的数据设置给state
    }

  },
  actions: {
  },
  modules: {
  }
})
