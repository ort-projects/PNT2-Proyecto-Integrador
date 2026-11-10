<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const menuAbierto = ref(false)
const menuWrap = ref(null)
const route = useRoute()

function cerrarMenu() {
  menuAbierto.value = false
}

function alHacerClickAfuera(event) {
  if (menuWrap.value && !menuWrap.value.contains(event.target)) cerrarMenu()
}

function alPresionarTecla(event) {
  if (event.key === 'Escape') cerrarMenu()
}

watch(() => route.fullPath, cerrarMenu)

onMounted(() => {
  document.addEventListener('click', alHacerClickAfuera)
  document.addEventListener('keydown', alPresionarTecla)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', alHacerClickAfuera)
  document.removeEventListener('keydown', alPresionarTecla)
})
</script>

<template>
  <div class="admin-shell">
    <header class="admin-header">
      <div class="container is-max-widescreen admin-header-content">
        <RouterLink to="/admin" class="admin-brand">
          ModArg <span>Administración</span>
        </RouterLink>

        <div ref="menuWrap" class="admin-nav-wrap">
          <button
            type="button"
            class="menu-toggle"
            :aria-expanded="menuAbierto"
            aria-controls="admin-navigation"
            :aria-label="menuAbierto ? 'Cerrar menú de administración' : 'Abrir menú de administración'"
            @click="menuAbierto = !menuAbierto"
          >
            <span></span><span></span><span></span>
          </button>
          <nav
            id="admin-navigation"
            class="admin-navigation"
            :class="{ 'is-open': menuAbierto }"
            aria-label="Administración"
          >
            <RouterLink to="/admin" exact-active-class="is-active" @click="cerrarMenu">Dashboards</RouterLink>
            <RouterLink to="/admin/pedidos" active-class="is-active" @click="cerrarMenu">Pedidos</RouterLink>
            <RouterLink to="/admin/productos" active-class="is-active" @click="cerrarMenu">Productos</RouterLink>
          </nav>
        </div>

        <RouterLink to="/" class="button is-secondary">
          Ver tienda
        </RouterLink>
      </div>
    </header>

    <main>
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.admin-shell {
  min-height: 100vh;
}

.admin-header {
  border-bottom: 1px solid var(--color-borde);
  background: var(--color-superficie);
}

.admin-header-content {
  min-height: 4.5rem;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 2rem;
  padding: 0.75rem 1.5rem;
}

.admin-nav-wrap {
  position: relative;
  justify-self: center;
}

.menu-toggle {
  display: none;
  width: 2.65rem;
  height: 2.65rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.28rem;
  border: 1px solid var(--color-borde);
  border-radius: var(--radio-control);
  background: var(--color-superficie);
  color: var(--color-azul-noche);
  cursor: pointer;
}

.menu-toggle span { width: 1.1rem; height: 2px; border-radius: 2px; background: currentColor; }
.menu-toggle:hover { background: var(--color-fondo); }
.menu-toggle:focus-visible,
.admin-navigation a:focus-visible {
  outline: none;
  box-shadow: var(--sombra-foco);
}
.admin-navigation {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}
.admin-navigation a {
  padding: 0.7rem 1rem;
  border-radius: var(--radio-control);
  color: var(--color-secundario);
  font-weight: 600;
  text-decoration: none;
  transition: background-color var(--transicion-suave), color var(--transicion-suave);
}
.admin-navigation a:hover,
.admin-navigation a.is-active {
  background: var(--color-fondo);
  color: var(--color-azul-noche);
}
.admin-navigation a.is-active { box-shadow: inset 0 -2px 0 var(--color-acento); }

.admin-brand {
  display: inline-flex;
  align-items: baseline;
  gap: 0.75rem;
  color: var(--color-texto);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.03em;
}

.admin-brand span {
  color: var(--color-secundario);
  font-size: 0.875rem;
  font-weight: 500;
  letter-spacing: 0;
}

@media (max-width: 720px) {
  .admin-header-content {
    grid-template-columns: minmax(0, 1fr) auto auto;
    gap: 0.6rem;
    padding-inline: 1rem;
  }

  .admin-brand {
    flex-direction: column;
    gap: 0;
    font-size: 1.1rem;
  }

  .admin-brand span { font-size: 0.75rem; }

  .admin-nav-wrap { justify-self: auto; }

  .menu-toggle { display: flex; }

  .admin-navigation {
    position: absolute;
    z-index: 20;
    top: calc(100% + 0.65rem);
    right: 0;
    display: none;
    min-width: 12rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.2rem;
    padding: 0.45rem;
    border: 1px solid var(--color-borde);
    border-radius: var(--radio-tarjeta);
    background: var(--color-superficie);
    box-shadow: var(--sombra-overlay);
  }

  .admin-navigation.is-open { display: flex; }

  .admin-navigation a.is-active { box-shadow: none; }

  .admin-header-content > .button {
    padding-inline: 0.65rem;
    font-size: 0.8rem;
  }
}
</style>
