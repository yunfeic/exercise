import './index.less'import 'mint-ui/lib/style.min.css'import Vue from 'vue'import VueRouter from 'vue-router'import Index from './routers/index/index.vue'import Switch from './routers/switch/index.vue'import Infinitescroll from './routers/infinitescroll/index.vue'Vue.use(VueRouter)const routes = [  {path: '/', component: Index},  {path: '/index', component: Index},  {path: '/switch', component: Switch},  {path: '/infinitescroll', component: Infinitescroll},]window.Gb = {}Gb.routes = routesconst router = new VueRouter({  routes})const app = new Vue({  // el: '#app',  router,  data: {  },  components: {  },}).$mount('#app')console.log(1)