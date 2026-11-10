<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '../store/auth.js'

const authStore = useAuthStore()
const PRODUCTOS_URL = 'http://localhost:3000/productos'
const ADMIN_PRODUCTOS_URL = 'http://localhost:3000/admin/productos'
const TAMANIO_PAGINA = 12

const productos = ref([])
const cargando = ref(true)
const errorCarga = ref('')
const errorDestacado = ref('')
const busqueda = ref('')
const paginaActual = ref(1)
const productoActualizandoId = ref(null)

async function fetchJsonConAuth(url, mensajeError, opciones = {}) {
  const response = await authStore.fetchWithAuth(url, opciones)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.message || mensajeError)
  }

  return data
}

let solicitudProductos = null
async function cargarProductos() {
  if (solicitudProductos) return solicitudProductos

  cargando.value = true
  errorCarga.value = ''
  solicitudProductos = (async () => {
    try {
      const data = await fetchJsonConAuth(PRODUCTOS_URL, 'No se pudieron cargar los productos.')
      if (!Array.isArray(data)) throw new Error('El servidor devolvió un listado de productos inválido.')
      productos.value = data
    } catch (error) {
      errorCarga.value = error instanceof Error ? error.message : 'No se pudieron cargar los productos.'
    } finally {
      cargando.value = false
      solicitudProductos = null
    }
  })()

  return solicitudProductos
}

function actualizarProductos() {
  return cargarProductos()
}

function alVolverAProductos() {
  void actualizarProductos()
}

onMounted(() => {
  void actualizarProductos()
  window.addEventListener('focus', alVolverAProductos)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', alVolverAProductos)
})

watch(() => authStore.token, (token) => {
  if (token && authStore.isAdmin) void actualizarProductos()
})

const productosFiltrados = computed(() => {
  const termino = busqueda.value.trim().toLocaleLowerCase('es-AR')
  if (!termino) return productos.value

  return productos.value.filter((producto) =>
    [producto.title, producto.category, producto.description]
      .some((valor) => String(valor ?? '').toLocaleLowerCase('es-AR').includes(termino)),
  )
})

const totalPaginas = computed(() => Math.max(1, Math.ceil(productosFiltrados.value.length / TAMANIO_PAGINA)))
const productosPagina = computed(() => {
  const inicio = (paginaActual.value - 1) * TAMANIO_PAGINA
  return productosFiltrados.value.slice(inicio, inicio + TAMANIO_PAGINA)
})
const rangoProductos = computed(() => {
  const total = productosFiltrados.value.length
  if (!total) return '0 productos'
  const inicio = (paginaActual.value - 1) * TAMANIO_PAGINA + 1
  const fin = Math.min(paginaActual.value * TAMANIO_PAGINA, total)
  return `Mostrando ${inicio}–${fin} de ${total} ${total === 1 ? 'producto' : 'productos'}`
})
const paginasVisibles = computed(() => {
  const inicio = Math.max(1, Math.min(paginaActual.value - 2, totalPaginas.value - 4))
  const fin = Math.min(totalPaginas.value, inicio + 4)
  return Array.from({ length: fin - inicio + 1 }, (_, indice) => inicio + indice)
})

watch(busqueda, () => {
  paginaActual.value = 1
})

watch(totalPaginas, (total) => {
  if (paginaActual.value > total) paginaActual.value = total
})

async function alternarDestacado(producto) {
  if (productoActualizandoId.value !== null) return

  productoActualizandoId.value = producto.id
  errorDestacado.value = ''

  try {
    const actualizado = await fetchJsonConAuth(
      `${ADMIN_PRODUCTOS_URL}/${producto.id}`,
      'No se pudo actualizar el producto destacado.',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destacado: !producto.destacado }),
      },
    )

    producto.destacado = typeof actualizado?.destacado === 'boolean'
      ? actualizado.destacado
      : !producto.destacado
  } catch (error) {
    errorDestacado.value = error instanceof Error
      ? error.message
      : 'Ocurrió un error al actualizar el producto.'
  } finally {
    productoActualizandoId.value = null
  }
}

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})
</script>

<template>
  <section class="section products-admin-section">
    <div class="container is-max-widescreen">
      <div class="page-heading products-heading">
        <div>
          <p class="eyebrow">Administración</p>
          <h1 class="title is-3">Productos destacados</h1>
          <p class="subtitle is-6">Buscá cualquier producto y destacalo para mostrarlo en la tienda.</p>
        </div>
      </div>

      <article class="box products-admin-card">
        <div class="products-toolbar">
          <div>
            <h2 class="title is-4">Todos los productos</h2>
            <p class="products-count" aria-live="polite">{{ rangoProductos }}</p>
          </div>
          <div class="field products-search">
            <label class="label" for="buscar-producto-admin">Buscar</label>
            <div class="control">
              <input
                id="buscar-producto-admin"
                v-model="busqueda"
                class="input"
                type="search"
                placeholder="Nombre, categoría o descripción"
              >
            </div>
          </div>
        </div>

        <p v-if="errorDestacado" class="notification is-danger is-light" role="alert">
          {{ errorDestacado }}
        </p>

        <div v-if="cargando" class="products-state" role="status" aria-live="polite">
          <progress class="progress is-small is-primary" max="100">Cargando productos</progress>
          <p>Cargando catálogo…</p>
        </div>
        <div v-else-if="errorCarga" class="products-state" role="alert">
          <p>{{ errorCarga }}</p>
          <button class="button is-small is-secondary" type="button" @click="actualizarProductos">Reintentar</button>
        </div>
        <div v-else-if="productos.length === 0" class="products-state">
          <h2 class="title is-5">Todavía no hay productos</h2>
          <p>Cuando haya productos en el catálogo, vas a poder destacarlos desde acá.</p>
        </div>
        <div v-else-if="productosFiltrados.length === 0" class="products-state">
          <h2 class="title is-5">No encontramos productos</h2>
          <p>Probá con otro nombre, categoría o término de búsqueda.</p>
        </div>
        <template v-else>
          <div class="products-grid">
            <article v-for="producto in productosPagina" :key="producto.id" class="product-tile">
              <RouterLink :to="{ name: 'product', params: { id: producto.id } }" class="product-image-link">
                <img class="product-image" :src="producto.thumbnail" :alt="producto.title" loading="lazy">
              </RouterLink>
              <div class="product-tile-content">
                <div class="product-title-row">
                  <h3 class="product-title">{{ producto.title }}</h3>
                  <span v-if="producto.destacado" class="tag is-warning is-light">★ Destacado</span>
                </div>
                <p class="product-category">{{ producto.category }}</p>
                <p class="product-price">{{ formatoMoneda.format(Number(producto.price) || 0) }}</p>
                <button
                  class="button is-small highlight-button"
                  :class="producto.destacado ? 'is-highlighted' : 'is-outlined'"
                  type="button"
                  :disabled="productoActualizandoId !== null"
                  :aria-pressed="producto.destacado"
                  @click="alternarDestacado(producto)"
                >
                  {{ productoActualizandoId === producto.id ? 'Guardando…' : producto.destacado ? 'Quitar destacado' : 'Destacar producto' }}
                </button>
              </div>
            </article>
          </div>

          <nav v-if="totalPaginas > 1" class="pagination products-pagination" role="navigation" aria-label="Paginación de productos">
            <button class="pagination-previous" type="button" :disabled="paginaActual === 1" @click="paginaActual--">Anterior</button>
            <button class="pagination-next" type="button" :disabled="paginaActual === totalPaginas" @click="paginaActual++">Siguiente</button>
            <ul class="pagination-list">
              <li v-for="pagina in paginasVisibles" :key="pagina">
                <button
                  class="pagination-link"
                  :class="{ 'is-current': pagina === paginaActual }"
                  type="button"
                  :aria-label="`Ir a la página ${pagina}`"
                  :aria-current="pagina === paginaActual ? 'page' : undefined"
                  @click="paginaActual = pagina"
                >{{ pagina }}</button>
              </li>
            </ul>
          </nav>
        </template>
      </article>
    </div>
  </section>
</template>

<style scoped>
.products-admin-section { min-height: calc(100vh - 4.5rem); }
.products-heading { align-items: center; }
.products-admin-card { padding: clamp(1rem, 3vw, 2rem); }
.products-toolbar { display: flex; align-items: end; justify-content: space-between; gap: 1.5rem; margin-bottom: 1.5rem; }
.products-toolbar .title { margin-bottom: 0.35rem; }
.products-count, .product-category { color: var(--color-secundario); font-size: 0.9rem; }
.products-search { width: min(100%, 24rem); margin-bottom: 0; }
.products-state { display: grid; justify-items: center; gap: 0.65rem; padding: 3rem 1rem; color: var(--color-secundario); text-align: center; }
.products-state .title { margin-bottom: 0; }
.products-state .progress { max-width: 22rem; }
.products-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 1rem; }
.product-tile { display: flex; min-width: 0; flex-direction: column; overflow: hidden; border: 1px solid var(--color-borde); border-radius: var(--radio-tarjeta); background: var(--color-superficie); }
.product-image-link { display: grid; aspect-ratio: 4 / 3; place-items: center; overflow: hidden; background: var(--color-fondo); }
.product-image { width: 100%; height: 100%; object-fit: cover; }
.product-tile-content { display: flex; flex: 1; flex-direction: column; align-items: flex-start; gap: 0.45rem; padding: 1rem; }
.product-title-row { display: flex; width: 100%; align-items: flex-start; justify-content: space-between; gap: 0.5rem; }
.product-title { margin: 0; color: var(--color-texto); font-size: 1rem; font-weight: 700; line-height: 1.35; }
.product-title-row .tag { flex: 0 0 auto; font-size: 0.7rem; }
.product-category, .product-price { margin: 0; }
.product-price { color: var(--color-azul-noche); font-weight: 700; }
.highlight-button { width: 100%; margin-top: auto; }
.highlight-button.is-highlighted { border-color: var(--color-acento); background: var(--color-acento); color: var(--color-azul-noche); }
.products-pagination { justify-content: center; margin-top: 1.75rem; }
.pagination-link.is-current { border-color: var(--color-azul-noche); background: var(--color-azul-noche); }
.products-admin-card :deep(.notification) { margin-bottom: 1rem; }

@media (max-width: 960px) {
  .products-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .products-toolbar { align-items: stretch; flex-direction: column; gap: 1rem; }
  .products-search { width: 100%; }
  .products-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.7rem; }
  .product-tile-content { padding: 0.75rem; }
  .product-title { font-size: 0.9rem; }
  .product-title-row .tag { display: none; }
  .product-category { font-size: 0.8rem; }
  .product-tile-content .button { padding-inline: 0.45rem; font-size: 0.75rem; }
}
</style>
