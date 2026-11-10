import { createWebHistory , createRouter } from 'vue-router'
import Home from '../views/Home.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Catalog from '../views/Catalog.vue'
import Dashboard from '../views/Dashboard.vue'
import { useAuthStore } from '../store/auth.js'
import { pinia } from '../store/pinia.js'
import Cart from '../views/Cart.vue'
import MisPedidos from '../views/MisPedidos.vue'
import PedidosAdmin from '../views/PedidosAdmin.vue'

const routes = [
  { path: '/', component: Home, meta:{layout:"MainLayout"} },
  { path: '/product/:id', component: ProductDetail, name:"product" },
  { path: '/admin', component: Dashboard, meta: { layout: 'AuthLayout', requireAdminLogin: true } },
  { path: '/admin/pedidos', component: PedidosAdmin, meta: { layout: 'AuthLayout', requireAdminLogin: true } },
  { path: '/catalog', component: Catalog, name:"catalog" },
  { path: '/cart', component: Cart, name: 'cart' },
  { path: '/mis-pedidos', component: MisPedidos, name: 'mis-pedidos', meta: { requireLogin: true } },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from) => {
  const authStore = useAuthStore(pinia)
  const requiresAdminLogin = to.matched.some((record) => record.meta.requireAdminLogin)

  if (requiresAdminLogin && !authStore.isAdmin) {
    if (authStore.isAuthenticated) {
      return '/'
    }

    // Sin sesión: se abre el modal y, al autenticarse como admin, se navega a la ruta pedida.
    authStore.abrirLoginModal({
      mensaje: 'Iniciá sesión con una cuenta de administrador.',
      redirect: to.fullPath,
    })

    // Si es la primera navegación (URL escrita a mano), no hay página previa: se va al inicio.
    return from.matched.length ? false : '/'
  }

  const requiresLogin = to.matched.some((record) => record.meta.requireLogin)

  if (requiresLogin && !authStore.isAuthenticated) {
    // Sin sesión: se abre el modal y, al autenticarse, se navega a la ruta pedida.
    authStore.abrirLoginModal({
      mensaje: 'Iniciá sesión para ver tus pedidos.',
      redirect: to.fullPath,
    })

    return from.matched.length ? false : '/'
  }
})
