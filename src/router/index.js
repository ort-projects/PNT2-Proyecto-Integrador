import { createWebHistory , createRouter } from 'vue-router'
import Home from '../views/Home.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Dashboard from '../views/Dashboard.vue'


const routes = [
  { path: '/', component: Home, meta:{layout:"MainLayout"} },
  { path: '/product/:id', component: ProductDetail, name:"product" },
  { path: '/admin', component: Dashboard, meta: { layout: 'AuthLayout' } },


]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
