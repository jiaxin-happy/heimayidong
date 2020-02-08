import router from '@/router'
import store from '@/store'
router.beforeEach(function (to, from, next) {
  if (to.path.startsWith('/user') && !store.state.user.token) {
    let topath = {
      path: '/login',
      query: {
        redirectUrl: to.fullPath
      }
    }
    next(topath)
  } else {
    next() // 直接放行
  }
})
export default router
