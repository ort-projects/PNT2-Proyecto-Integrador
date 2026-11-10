<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '../store/auth.js'
import { ESTADOS_PEDIDO, normalizarEstadoPedido, obtenerEstadoPedido } from '../utils/pedidoEstado.js'

const authStore = useAuthStore()
const PEDIDOS_URL = 'http://localhost:3000/pedidos/all'
const USUARIOS_URL = 'http://localhost:3000/usuarios'

const pedidos = ref([])
const pedidosTodos = ref([])
const usuarios = ref(null)
const cargandoPedidos = ref(true)
const cargandoUsuarios = ref(true)
const errorPedidos = ref('')
const errorUsuarios = ref('')
const estadoSeleccionado = ref('todos')
const usuarioSeleccionado = ref('todos')

async function fetchJsonConAuth(url, mensajeError) {
  const response = await authStore.fetchWithAuth(url)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data?.error?.message || data?.message || mensajeError)
  return data
}

let solicitudPedidos = null
async function cargarPedidos() {
  if (solicitudPedidos) return solicitudPedidos
  cargandoPedidos.value = true
  errorPedidos.value = ''
  solicitudPedidos = (async () => {
    try {
      const url = usuarioSeleccionado.value === 'todos'
        ? PEDIDOS_URL
        : `${PEDIDOS_URL}?${new URLSearchParams({ username: usuarioSeleccionado.value }).toString()}`
      const data = await fetchJsonConAuth(url, 'No se pudieron cargar los pedidos.')
      if (!Array.isArray(data)) throw new Error('El servidor devolvió un listado de pedidos inválido.')
      pedidos.value = data
      if (usuarioSeleccionado.value === 'todos') pedidosTodos.value = data
    } catch (error) {
      errorPedidos.value = error instanceof Error ? error.message : 'No se pudieron cargar los pedidos.'
    } finally {
      cargandoPedidos.value = false
      solicitudPedidos = null
    }
  })()
  return solicitudPedidos
}

async function cargarUsuarios() {
  cargandoUsuarios.value = true
  errorUsuarios.value = ''
  try {
    const data = await fetchJsonConAuth(USUARIOS_URL, 'No se pudo cargar la lista de usuarios.')
    if (!Array.isArray(data)) throw new Error('El servidor devolvió una lista de usuarios inválida.')
    usuarios.value = data
  } catch (error) {
    errorUsuarios.value = error instanceof Error ? error.message : 'No se pudo cargar la lista de usuarios.'
  } finally {
    cargandoUsuarios.value = false
  }
}

function actualizarPedidos() {
  void cargarPedidos()
}

onMounted(() => {
  actualizarPedidos()
  void cargarUsuarios()
  window.addEventListener('focus', actualizarPedidos)
})
onBeforeUnmount(() => window.removeEventListener('focus', actualizarPedidos))
watch(() => authStore.token, (token) => {
  if (token && authStore.isAdmin) {
    actualizarPedidos()
    void cargarUsuarios()
  }
})

function nombreUsuario(usuario) {
  const nombre = [usuario?.name, usuario?.surname]
    .filter((parte) => typeof parte === 'string' && parte.trim())
    .map((parte) => parte.trim())
    .join(' ')
  return nombre || usuario?.username || 'Usuario'
}

const usuariosDisponibles = computed(() => {
  const porUsername = new Map()
  const fuente = usuarios.value ?? pedidosTodos.value.map((pedido) => pedido?.user)
  fuente.forEach((usuario) => {
    const username = typeof usuario?.username === 'string' ? usuario.username.trim() : ''
    if (!username || porUsername.has(username)) return
    const nombre = nombreUsuario(usuario)
    porUsername.set(username, { username, nombre, etiqueta: nombre === username ? username : `${nombre} (${username})` })
  })
  return [...porUsername.values()].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es-AR') || a.username.localeCompare(b.username, 'es-AR'))
})

const nombresEstado = (estado) => {
  const palabras = String(estado ?? '').trim().replaceAll('_', ' ').split(/\s+/).filter(Boolean)
  if (!palabras.length) return 'Sin estado'
  return palabras.map((palabra) => palabra.charAt(0).toLocaleUpperCase('es-AR') + palabra.slice(1).toLocaleLowerCase('es-AR')).join(' ')
}
const estadosDisponibles = ESTADOS_PEDIDO
const pedidosFiltrados = computed(() => pedidos.value.filter((pedido) => {
  const coincideEstado = estadoSeleccionado.value === 'todos' || normalizarEstadoPedido(pedido.status) === estadoSeleccionado.value
  const coincideUsuario = usuarioSeleccionado.value === 'todos' || String(pedido.user?.username ?? '').trim() === usuarioSeleccionado.value
  return coincideEstado && coincideUsuario
}))

function mensajeSinPedidos() {
  if (usuarioSeleccionado.value === 'todos' && estadoSeleccionado.value === 'todos') return 'Todavía no hay pedidos'
  const filtros = []
  if (usuarioSeleccionado.value !== 'todos') {
    const usuario = usuariosDisponibles.value.find((opcion) => opcion.username === usuarioSeleccionado.value)
    filtros.push(`de ${usuario?.nombre ?? usuarioSeleccionado.value}`)
  }
  if (estadoSeleccionado.value !== 'todos') filtros.push(`con estado ${nombresEstado(estadoSeleccionado.value)}`)
  return `No hay pedidos ${filtros.join(' ')}`
}

function convertirFecha(fecha) {
  const texto = String(fecha ?? '')
  const fechaLocal = /^\d{4}-\d{2}-\d{2}$/.test(texto) ? `${texto}T12:00:00` : texto
  const parseada = new Date(fechaLocal)
  return Number.isNaN(parseada.getTime()) ? null : parseada
}
function formatearFechaPedido(fecha) {
  const parseada = convertirFecha(fecha)
  return parseada ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'medium', timeStyle: 'short' }).format(parseada) : '—'
}
const formatoMoneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
function formatearTotal(total) {
  const numero = Number(total)
  return Number.isFinite(numero) ? formatoMoneda.format(numero) : '—'
}
const clasesEstadoAdicionales = {
  pendiente_pago: 'is-warning estado-pedido--pendiente-pago',
  pagado: 'is-success estado-pedido--pagado',
  en_preparacion: 'is-info estado-pedido--en-preparacion',
  reembolsado: 'is-light estado-pedido--reembolsado',
}
function claseEstadoPedido(estado) {
  const normalizado = normalizarEstadoPedido(estado)
  return obtenerEstadoPedido(estado).clase || clasesEstadoAdicionales[normalizado] || ''
}
const pedidosParaMostrar = computed(() => pedidosFiltrados.value.map((pedido) => ({
  ...pedido,
  nombreVisible: nombreUsuario(pedido.user),
  fechaVisible: formatearFechaPedido(pedido.date),
  totalVisible: formatearTotal(pedido.total),
  estadoVisible: nombresEstado(pedido.status),
  claseEstado: claseEstadoPedido(pedido.status),
})))
</script>

<template>
  <section class="section pedidos-section">
    <div class="container is-max-widescreen">
      <div class="page-heading">
        <div>
          <p class="eyebrow">Administración</p>
          <h1 class="title is-3">Pedidos</h1>
          <p class="subtitle is-6">Consultá y filtrá los pedidos de todos los usuarios.</p>
        </div>
      </div>

      <article class="box orders-card">
        <div class="orders-heading">
          <div>
            <h2 class="title is-4">Listado de pedidos</h2>
            <p class="orders-description">Filtrá por usuario y estado o consultá el listado completo.</p>
          </div>
          <div class="orders-filters">
            <div class="field orders-filter">
              <label class="label" for="filtro-usuario-pedido">Usuario</label>
              <div class="control"><div class="select">
                <select id="filtro-usuario-pedido" v-model="usuarioSeleccionado" :disabled="cargandoPedidos || cargandoUsuarios" @change="actualizarPedidos">
                  <option value="todos">Todos los usuarios</option>
                  <option v-for="usuario in usuariosDisponibles" :key="usuario.username" :value="usuario.username">{{ usuario.etiqueta }}</option>
                </select>
              </div></div>
            </div>
            <div class="field orders-filter">
              <label class="label" for="filtro-estado-pedido">Estado</label>
              <div class="control"><div class="select">
                <select id="filtro-estado-pedido" v-model="estadoSeleccionado">
                  <option value="todos">Todos</option>
                  <option v-for="estado in estadosDisponibles" :key="estado" :value="estado">{{ nombresEstado(estado) }}</option>
                </select>
              </div></div>
            </div>
          </div>
        </div>

        <p v-if="errorUsuarios" class="orders-description" role="status">No se pudo cargar la lista de usuarios; verificá que el usuario sea correcto y tenga pedidos.</p>
        <p v-if="!cargandoPedidos && !errorPedidos" class="orders-count">{{ pedidosFiltrados.length }} {{ pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos' }}</p>
        <div v-if="cargandoPedidos" class="dashboard-state" role="status" aria-live="polite">
          <progress class="progress is-small is-primary" max="100">Cargando pedidos</progress>
          <p>Cargando listado de pedidos…</p>
        </div>
        <div v-else-if="errorPedidos" class="dashboard-state"><p>{{ errorPedidos }}</p></div>
        <div v-else-if="pedidosFiltrados.length === 0" class="dashboard-state">
          <p class="title is-5">{{ mensajeSinPedidos() }}</p>
          <p v-if="pedidos.length === 0 && usuarioSeleccionado === 'todos' && estadoSeleccionado === 'todos'">Cuando se registre una compra, aparecerá en este listado.</p>
          <p v-else>Elegí otro usuario o estado, o seleccioná “Todos” para volver al listado completo.</p>
        </div>
        <div v-else class="table-container">
          <table class="table is-fullwidth is-hoverable orders-table">
            <thead><tr><th scope="col">N.º de pedido</th><th scope="col">Usuario</th><th scope="col">Fecha</th><th scope="col">Total</th><th scope="col">Estado</th></tr></thead>
            <tbody>
              <tr v-for="pedido in pedidosParaMostrar" :key="pedido.id">
                <th scope="row">#{{ pedido.id }}</th>
                <td><span class="order-user-name">{{ pedido.nombreVisible }}</span><span v-if="pedido.user?.username" class="order-username">{{ pedido.user.username }}</span></td>
                <td>{{ pedido.fechaVisible }}</td><td>{{ pedido.totalVisible }}</td>
                <td><span class="tag is-light" :class="pedido.claseEstado">{{ pedido.estadoVisible }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.pedidos-section { min-height: calc(100vh - 4.5rem); }
.page-heading { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
.eyebrow { color: var(--color-secundario); font-size: .75rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.orders-card { border: 1px solid var(--color-borde); }
.orders-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 1rem; margin-bottom: .75rem; }
.orders-filters { display: flex; flex-wrap: wrap; gap: .75rem; }
.orders-filter { flex: 1 1 12rem; min-width: 12rem; margin-bottom: 0; }
.orders-filter .select, .orders-filter select { width: 100%; }
.orders-description, .orders-count, .dashboard-state > p { color: var(--color-secundario); font-size: .9rem; }
.orders-count { margin-bottom: .5rem; }
.orders-table th, .orders-table td { vertical-align: middle; }
.order-user-name, .order-username { display: block; }
.order-user-name { font-weight: 600; }
.order-username { color: var(--color-secundario); font-size: .9rem; }
.dashboard-state { padding: 2.5rem 1rem; text-align: center; }
.dashboard-state .progress { max-width: 24rem; margin: 0 auto 1rem; }
@media (max-width: 768px) { .orders-heading { flex-direction: column; align-items: stretch; } .orders-filter { width: 100%; } }
</style>
