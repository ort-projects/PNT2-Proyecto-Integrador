<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from './store/auth.js'
import AuthModal from './components/AuthModal.vue'

const layouts = {
  MainLayout: defineAsyncComponent(() => import('./layouts/MainLayout.vue')),
  AuthLayout: defineAsyncComponent(() => import('./layouts/AuthLayout.vue')),
}

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const layout = computed(() => {
  const layoutName = route.meta.layout
  if (layoutName && layoutName in layouts) {
    return layouts[layoutName]
  }
  return layouts.MainLayout
})

function esRutaAdmin(path) {
  return path === '/admin' || path.startsWith('/admin/')
}

async function alAutenticarse() {
  const destino = authStore.redirectDespuesLogin
  authStore.cerrarLoginModal()

  if (destino && (authStore.isAdmin || !esRutaAdmin(destino))) {
    await router.replace(destino)
  } else if (!authStore.isAdmin && esRutaAdmin(route.path)) {
    await router.replace('/')
  }
}

async function alCerrar() {
  authStore.cerrarLoginModal()

  // Si se canceló el login estando en el panel (por ejemplo, tras un 401), se sale del panel.
  if (!authStore.isAdmin && esRutaAdmin(route.path)) {
    await router.replace('/')
  }
}
</script>

<template>
  <component :is="layout" />

  <AuthModal
    :open="authStore.loginModalAbierto"
    :mensaje="authStore.loginModalMensaje"
    @close="alCerrar"
    @authenticated="alAutenticarse"
  />
</template>
