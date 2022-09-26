import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/login'
  },
  {
    path:'/login',
    component:() => import('../components/Login.vue')
  },
  {
    path:'/home',
    component:() => import('../components/Home.vue'),
    redirect:'/welcome',
    children:[
      {
        path:'/welcome',
        component:() => import('../components/Welcome.vue')
      },
      {
        path:'/users',
        component:() => import('../components/user/Users.vue')
      },
      {
        path:'/rights',
        component:() => import('../components/power/Rights.vue')
      },
      {
        path:'/roles',
        component:() => import('../components/power/Roles.vue')
      },
      {
        path:'/categories',
        component:() => import('../components/goods/Cate.vue')
      },
      {
        path:'/goods',
        component:() => import('../components/goods/List.vue')
      },
      {
        path:'/params',
        component:() => import('../components/goods/Params.vue')
      },
      {
        path:'/add',
        component:() => import('../components/goods/Add.vue')
      },
      {
        path:'/orders',
        component:() => import('../components/order/Order.vue')
      },
      {
        path:'/reports',
        component:() => import('../components/report/Report.vue')
      }
    ]
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
