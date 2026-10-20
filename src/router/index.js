import { createWebHistory , createRouter } from 'vue-router'
import Home from '../views/Home.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Catalog from '../views/Catalog.vue'
import Dashboard from '../views/Dashboard.vue'
import AdminLogin from '../views/AdminLogin.vue'
import { useAuthStore } from '../store/auth.js'
import { pinia } from '../store/pinia.js'


const routes = [
  { path: '/', component: Home, meta:{layout:"MainLayout"} },
  { path: '/product/:id', component: ProductDetail, name:"product" },
  { path: '/login', component: AdminLogin, meta: { layout: 'NoneLayout' } },
  { path: '/admin', component: Dashboard, meta: { layout: 'AuthLayout', requireAdminLogin: true } },
  { path: '/catalog', component: Catalog, name:"catalog" },

]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore(pinia)
  const requiresAdminLogin = to.matched.some((record) => record.meta.requireAdminLogin)

  if (requiresAdminLogin && !authStore.isAdmin) {
    if (authStore.isAuthenticated) {
      return '/'
    }

    return {
      path: '/login',
      query: { redirect: to.fullPath },
    }
  }
})
