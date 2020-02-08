import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn' // 引入中文的语言包
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
export default {
  install (Vue) {
    Vue.prototype.$sleep = sleep // 封装一个休眠函数
    Vue.filter('relTime', relTime) // 注册一个全局相对时间的过滤器
  }
}
// function(time = 500) 如果传time用传的 如果不传 用500
function sleep (time = 500) {
  return new Promise(function (resolve) {
    setTimeout(() => resolve(), time) // 表示 等待time时间之后 才能resolve
  })
}
// 转化时间到相对时间
function relTime (date) {
  return dayjs().locale('zh-cn').from(date)
}
