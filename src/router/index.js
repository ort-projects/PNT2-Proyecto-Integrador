import { createWebHistory , createRouter } from 'vue-router'
import Home from '../views/Home.vue'
import ProductDetail from '../views/ProductDetail.vue'


const routes = [
  { path: '/', component: Home, meta:{layout:"MainLayout"} },
  { path: '/product/:id', component: ProductDetail, name:"product" }
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})