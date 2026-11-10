<script setup>
import { onMounted, ref, watch } from 'vue'
import { useAuthStore } from '../store/auth.js'
import { obtenerEstadoPedido } from '../utils/pedidoEstado.js'

const authStore = useAuthStore()

// Viene en true cuando se llega desde el carrito después de un 201 en POST /pedidos (Tarea 2).
const pedidoRegistrado = ref(Boolean(window.history.state?.pedidoRegistrado))

// Se borra del state para que el mensaje no vuelva a aparecer al recargar la página.
if (pedidoRegistrado.value) {
  window.history.replaceState({ ...window.history.state, pedidoRegistrado: false }, '')
}

const pedidos = ref([])
const cargando = ref(false)
const error = ref('')
const sesionVencida = ref(false)



const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function formatearFecha(fecha) {
  const date = new Date(fecha)
  return Number.isNaN(date.getTime()) ? '-' : formatoFecha.format(date)
}

async function cargarPedidos() {
  cargando.value = true
  error.value = ''
  sesionVencida.value = false

  try {
    // GET /pedidos devuelve solo los pedidos del usuario del token.
    const response = await authStore.fetchWithAuth('http://localhost:3000/pedidos')

    // 401: fetchWithAuth ya borró el token y abrió el modal de login.
    if (response.status === 401) {
      pedidos.value = []
      sesionVencida.value = true
      return
    }

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      throw new Error(
        data?.message || data?.error?.message || 'No se pudieron cargar tus pedidos.',
      )
    }

    pedidos.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'No se pudieron cargar tus pedidos.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarPedidos)

// Al volver a iniciar sesión desde el modal (después de un 401) se recarga el listado.
watch(
  () => authStore.isAuthenticated,
  (autenticado) => {
    if (autenticado && sesionVencida.value) cargarPedidos()
  },
)

function iniciarSesion() {
  authStore.abrirLoginModal({ mensaje: 'Iniciá sesión para ver tus pedidos.' })
}
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-2">Mis pedidos</h1>

      <div
        v-if="pedidoRegistrado"
        class="notification is-success is-light"
        role="status"
      >
        <button
          class="delete"
          type="button"
          aria-label="Cerrar mensaje"
          @click="pedidoRegistrado = false"
        ></button>
        <strong>¡Pedido registrado!</strong> Tu compra se confirmó correctamente.
      </div>

      <p v-if="cargando" aria-live="polite">Cargando tus pedidos...</p>

      <div v-else-if="sesionVencida" class="notification is-warning is-light">
        <p>Tu sesión venció. Iniciá sesión para ver tus pedidos.</p>

        <button class="button mt-3" type="button" @click="iniciarSesion">
          Iniciar sesión
        </button>
      </div>

      <div v-else-if="error" class="notification is-danger is-light" role="alert">
        <p>{{ error }}</p>

        <button class="button mt-3" type="button" @click="cargarPedidos">
          Reintentar
        </button>
      </div>

      <div v-else-if="pedidos.length === 0" class="notification">
        <p>Todavía no hiciste ningún pedido.</p>

        <RouterLink to="/catalog" class="button is-primary mt-4">
          Ver productos
        </RouterLink>
      </div>

      <div v-else class="box pedidos-box">
        <div class="table-container">
          <table class="table is-fullwidth pedidos-table">
            <thead>
              <tr>
                <th scope="col">Pedido</th>
                <th scope="col">Fecha</th>
                <th scope="col">Productos</th>
                <th scope="col" class="has-text-right">Total</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>

            <tbody>
              <tr v-for="pedido in pedidos" :key="pedido.id">
                <th scope="row">#{{ pedido.id }}</th>
                <td class="pedido-fecha">{{ formatearFecha(pedido.date) }}</td>
                <td>
                  <ul class="pedido-items">
                    <li
                      v-for="item in pedido.items"
                      :key="item.productId"
                      class="pedido-item"
                    >
                      <img
                        class="pedido-item-image"
                        :src="item.thumbnail"
                        :alt="item.title"
                      />
                      <span>
                        {{ item.title }}
                        <span class="pedido-item-detalle">
                          {{ item.quantity }} × ${{ item.price }}
                        </span>
                      </span>
                    </li>
                  </ul>
                </td>
                <td class="has-text-right pedido-total">
                  ${{ pedido.total }}
                </td>
                <td>
                  <span class="tag is-light" :class="obtenerEstadoPedido(pedido.status).clase">
                    {{ obtenerEstadoPedido(pedido.status).texto }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pedidos-box {
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--color-borde);
}

.pedidos-table {
  width: 100%;
  background: var(--color-superficie);
  color: var(--color-texto);
}

.pedidos-table thead th {
  background: var(--color-fondo);
  color: var(--color-azul-noche);
  font-family: var(--font-titulos);
  font-weight: 600;
}

.pedidos-table tbody th,
.pedidos-table tbody td {
  background: var(--color-superficie);
  color: var(--color-texto);
  border-color: var(--color-borde);
}

.pedidos-table tbody tr:hover > th,
.pedidos-table tbody tr:hover > td {
  background: var(--color-fondo);
}

.pedidos-table th,
.pedidos-table td {
  padding: 1rem 1.25rem;
  vertical-align: middle;
  color: var(--color-texto);
  border-color: var(--color-borde);
}

.pedido-fecha {
  white-space: nowrap;
}

.pedido-items {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.pedido-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.pedido-item-image {
  flex: 0 0 auto;
  width: 3rem;
  height: 3rem;
  object-fit: contain;
  background: var(--color-superficie);
}

.pedido-item-detalle {
  display: block;
  color: var(--color-secundario);
  font-size: 0.9rem;
}

.pedido-total {
  color: var(--color-azul-noche);
  font-weight: 700;
  white-space: nowrap;
}
</style>
