import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import './assets/css/global.css'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
//引入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
import Nprogress from 'nprogress'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme
import 'nprogress/nprogress.css'

//配置请求根路径
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/"
//请求拦截器
axios.interceptors.request.use(config => {
  //console.log(config);
  //展示进度条
  Nprogress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})
axios.interceptors.response.use(config => {
  //结束进度条
  Nprogress.done()
  return config
})
Vue.prototype.$http = axios

Vue.use(Element)
Vue.config.productionTip = false
Vue.component('tree-table',TreeTable)
Vue.use(VueQuillEditor)

Vue.filter( 'dateFormat' , function(originval){
  const dt = new Date(originval * 1000)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2,'0')
  const d = (dt.getDate() + '').padStart(2,'0')

  const hh = (dt.getHours() + '').padStart(2,'0')
  const mm = (dt.getMinutes() + '').padStart(2,'0')
  const ss = (dt.getSeconds() + '').padStart(2,'0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
  })
  

new Vue({
  router,
  axios,
  render: h => h(App)
}).$mount('#app')