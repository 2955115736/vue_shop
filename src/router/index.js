import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:'/login',
    component:Login
  },
  {
    path:'/home',
    component:Home
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to,from,next) => {
  //to将要访问的路径
  //from代表从哪个路径跳转过来
  //next表示放行
  if(to.path === '/login') return next()
  //获取保存token
  const tokenStr = window.sessionStorage.getItem('token')
  //没有token强制跳转到登录页
  if(!tokenStr) return next('/login')
  next()
})

export default router
