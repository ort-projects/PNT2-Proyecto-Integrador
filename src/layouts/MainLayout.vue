<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.js'
import { useCatalogStore } from '../store/catalog.js'
import { useCartStore } from '../store/cart.js'

const authStore = useAuthStore()
const catalogStore = useCatalogStore()
const cartStore = useCartStore()
const route = useRoute()
const router = useRouter()
const cantidadEnCarrito = computed(() =>
  cartStore.items.reduce((total, item) => total + item.cantidad, 0),
)

function cerrarSesion() {
  authStore.logout()
  router.push('/')
}

function buscarProductos() {
  const busqueda = catalogStore.busqueda.trim()
  router.push({
    name: 'catalog',
    query: busqueda ? { busqueda } : {},
  })
}
</script>

<template>
  <div class="store-layout">
    <header class="store-header">
      <div class="container is-max-widescreen store-header-content">
        <RouterLink to="/" class="store-brand" aria-label="ModArg, inicio">
          ModArg
        </RouterLink>

        <form class="store-search" @submit.prevent="buscarProductos">
          <label class="sr-only" for="busqueda-productos">Buscar productos</label>
          <input
            id="busqueda-productos"
            v-model="catalogStore.busqueda"
            class="input"
            type="search"
            placeholder="Buscar productos..."
          />
          <svg aria-hidden="true" viewBox="0 0 24 24" class="search-icon">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.5 4.5" />
          </svg>
        </form>
        <div class="header-actions">
          
  <RouterLink
    to="/cart"
    class="cart-indicator"
    :aria-label="
      cantidadEnCarrito
        ? `Carrito, ${cantidadEnCarrito} artículos`
        : 'Carrito vacío'
    "
  >
    <svg aria-hidden="true" viewBox="0 0 24 24" class="cart-icon">
      <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.5L22 8H6" />
      <circle cx="10" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>

    <span v-if="cantidadEnCarrito" class="cart-count" aria-hidden="true">
      {{ cantidadEnCarrito }}
    </span>
  </RouterLink>

  <details class="account-menu">
    <summary class="account-trigger" aria-label="Opciones de cuenta">
      <svg aria-hidden="true" viewBox="0 0 24 24" class="avatar-icon">
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="9" r="3.2" />
        <path d="M5.8 19a6.5 6.5 0 0 1 12.4 0" />
      </svg>

      <span>
        {{ authStore.isAuthenticated ? authStore.userDisplayName : 'Iniciar sesión' }}
      </span>
    </summary>

    <div class="account-dropdown">
      <template v-if="authStore.isAuthenticated">
        <RouterLink
          v-if="authStore.isAdmin"
          to="/admin"
          class="account-link"
        >
          Panel de administración
        </RouterLink>

        <button
          type="button"
          class="account-link"
          @click="cerrarSesion"
        >
          Cerrar sesión
        </button>
      </template>

      <RouterLink
        v-else
        :to="{ path: '/login', query: { redirect: route.fullPath } }"
        class="account-link"
      >
        Iniciar sesión
      </RouterLink>
    </div>
  </details>
</div>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.store-layout {
  min-height: 100vh;
}

.store-header {
  position: sticky;
  z-index: 10;
  top: 0;
  border-bottom: 1px solid var(--color-borde);
  background: var(--color-superficie);
}

.store-header-content {
  min-height: 5rem;
  display: grid;
  grid-template-columns: 1fr minmax(16rem, 34rem) 1fr;
  align-items: center;
  gap: 2rem;
  padding: 0.75rem 1.5rem;
}

.store-brand {
  width: fit-content;
  color: var(--color-texto);
  font-size: 1.65rem;
  font-weight: 800;
  letter-spacing: -0.06em;
}

.store-search {
  position: relative;
}

.store-search .input {
  height: 2.75rem;
  padding-right: 2.75rem;
}

.search-icon {
  position: absolute;
  top: 50%;
  right: 0.85rem;
  width: 1.1rem;
  height: 1.1rem;
  fill: none;
  stroke: var(--color-secundario);
  stroke-linecap: round;
  stroke-width: 1.7;
  transform: translateY(-50%);
  pointer-events: none;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-self: end;
  gap: 1rem;
}

.cart-indicator {
  position: relative;
  display: inline-flex;
  width: 2rem;
  height: 2rem;
  align-items: center;
  justify-content: center;
  color: var(--color-texto);
}

.cart-icon {
  width: 1.65rem;
  height: 1.65rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.cart-count {
  position: absolute;
  top: -0.2rem;
  right: -0.35rem;
  display: flex;
  min-width: 1.1rem;
  height: 1.1rem;
  align-items: center;
  justify-content: center;
  padding: 0 0.2rem;
  border-radius: 999px;
  background: var(--color-pistacho);
  color: var(--color-texto);
  font-size: 0.7rem;
  font-weight: 700;
  line-height: 1;
}

.account-menu {
  position: relative;
}

.account-trigger {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  cursor: pointer;
  list-style: none;
  color: var(--color-texto);
  font-size: 0.9rem;
  font-weight: 600;
}

.account-trigger::-webkit-details-marker {
  display: none;
}

.avatar-icon {
  width: 2rem;
  height: 2rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.account-dropdown {
  position: absolute;
  top: calc(100% + 0.8rem);
  right: 0;
  min-width: 13rem;
  padding: 0.4rem;
  border: 1px solid var(--color-borde);
  background: var(--color-superficie);
  box-shadow: 0 8px 22px rgb(23 23 21 / 10%);
}

.account-link {
  display: block;
  width: 100%;
  padding: 0.7rem 0.8rem;
  border: 0;
  background: transparent;
  color: var(--color-texto);
  cursor: pointer;
  font: inherit;
  text-align: left;
  text-decoration: none;
}

.account-link:hover {
  background: var(--color-pistacho);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (max-width: 640px) {
  .store-header-content {
    grid-template-columns: 1fr auto;
    gap: 0.7rem 1rem;
    padding: 0.75rem 1rem;
  }

  .store-search {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .store-brand {
    font-size: 1.45rem;
  }
}
</style>
