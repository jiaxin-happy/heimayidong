import Vue from 'vue'
import VueRouter from 'vue-router'
const Layout = () => import('@/views/layout') // 布局组件 一级
const Home = () => import('@/views/home') // 首页 二级
const Question = () => import('@/views/question') // 问答 二级
const Video = () => import('@/views/video') // 视频 二级
const User = () => import('@/views/user') // 我的 二级
const Profile = () => import('@/views/user/profile') // 个人资料 一级
const Chat = () => import('@/views/user/chat') // 小智同学 一 h级
const Login = () => import('@/views/login') // 登入组件
const Search = () => import('@/views/search') // 搜索
const SearchResult = () => import('@/views/search/result') // 搜索结果
const Article = () => import('@/views/article') // 文章详情

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: Layout, // 一级路由
    children: [
      { path: '/', component: Home }, // 二级路由 首页
      { path: '/question', component: Question },
      { path: '/video', component: Video },
      { path: '/user', component: User }
    ]
  },
  { path: '/user/profile', component: Profile },
  { path: '/user/chat', component: Chat },
  { path: '/login', component: Login },
  { path: '/search', component: Search },
  { path: '/search/result', component: SearchResult },
  { path: '/article', component: Article }

]

const router = new VueRouter({
  routes
})

export default router
