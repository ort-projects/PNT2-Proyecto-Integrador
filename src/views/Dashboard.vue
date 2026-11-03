<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '../store/auth.js'
import { Line } from 'vue-chartjs'
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

const authStore = useAuthStore()
const PEDIDOS_URL = 'http://localhost:3000/pedidos/all'
const anioSeleccionado = new Date().getFullYear()
const pedidos = ref([])
const cargando = ref(false)
const error = ref('')
const estadoSeleccionado = ref('todos')

async function cargarPedidos() {
  if (cargando.value) return

  cargando.value = true
  error.value = ''

  try {
    const response = await authStore.fetchWithAuth(PEDIDOS_URL)
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        data.error?.message ||
          data.message ||
          'No se pudieron cargar los pedidos.',
      )
    }

    if (!Array.isArray(data)) {
      throw new Error('El servidor devolvió un listado de pedidos inválido.')
    }

    pedidos.value = data
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : 'No se pudieron cargar los pedidos.'
  } finally {
    cargando.value = false
  }
}

function alVolverAlPanel() {
  cargarPedidos()
}

onMounted(() => {
  cargarPedidos()
  window.addEventListener('focus', alVolverAlPanel)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', alVolverAlPanel)
})

watch(
  () => authStore.token,
  (token) => {
    if (token && authStore.isAdmin) cargarPedidos()
  },
)

const pedidosDelAnio = computed(() =>
  pedidos.value.filter((pedido) => {
    const fecha = new Date(pedido.date)
    return !Number.isNaN(fecha.getTime()) && fecha.getFullYear() === anioSeleccionado
  }),
)

const estadosDisponibles = computed(() =>
  [...new Set(
    pedidos.value
      .map((pedido) => (typeof pedido.status === 'string' ? pedido.status.trim() : ''))
      .filter(Boolean),
  )].sort((a, b) => a.localeCompare(b, 'es-AR')),
)

const pedidosFiltrados = computed(() => {
  if (estadoSeleccionado.value === 'todos') return pedidos.value

  return pedidos.value.filter(
    (pedido) => pedido.status === estadoSeleccionado.value,
  )
})

const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const resumenMensual = computed(() => {
  const resumen = Array.from({ length: nombresMeses.length }, () => ({
    pedidos: 0,
    unidades: 0,
  }))

  pedidosDelAnio.value.forEach((pedido) => {
    const fecha = new Date(pedido.date)
    const mes = fecha.getMonth()
    resumen[mes].pedidos += 1

    if (Array.isArray(pedido.items)) {
      resumen[mes].unidades += pedido.items.reduce((total, item) => {
        const cantidad = Number(item.quantity)
        return total + (Number.isFinite(cantidad) ? cantidad : 0)
      }, 0)
    }
  })

  return resumen
})

const totalPedidos = computed(() => pedidosDelAnio.value.length)
const totalUnidades = computed(() =>
  resumenMensual.value.reduce((total, mes) => total + mes.unidades, 0),
)

const datosGrafico = computed(() => ({
  labels: nombresMeses,
  datasets: [
    {
      label: 'Pedidos',
      data: resumenMensual.value.map((mes) => mes.pedidos),
      borderColor: '#718453',
      backgroundColor: 'rgba(168, 185, 135, 0.22)',
      borderWidth: 2.5,
      pointRadius: 3,
      pointHoverRadius: 7,
      pointBackgroundColor: '#718453',
      pointBorderColor: '#faf7ef',
      pointBorderWidth: 2,
      tension: 0.4,
      fill: true,
    },
  ],
}))

const opcionesGrafico = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'nearest',
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      callbacks: {
        label: (context) => String(context.parsed.y) + ' pedidos',
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      beginAtZero: true,
      ticks: { precision: 0 },
    },
  },
}

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

function formatearFecha(fecha) {
  const fechaPedido = new Date(fecha)
  return Number.isNaN(fechaPedido.getTime()) ? '—' : formatoFecha.format(fechaPedido)
}

function formatearTotal(total) {
  const totalNumerico = Number(total)
  return Number.isFinite(totalNumerico) ? formatoMoneda.format(totalNumerico) : '—'
}

function formatearEstado(estado) {
  const palabras = String(estado ?? '')
    .trim()
    .replaceAll('_', ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (palabras.length === 0) return 'Sin estado'

  return palabras
    .map((palabra) =>
      palabra.charAt(0).toLocaleUpperCase('es-AR') +
      palabra.slice(1).toLocaleLowerCase('es-AR'),
    )
    .join(' ')
}

function nombreUsuario(usuario) {
  const nombre = [usuario?.name, usuario?.surname]
    .filter((parte) => typeof parte === 'string' && parte.trim())
    .map((parte) => parte.trim())
    .join(' ')

  return nombre || usuario?.username || 'Usuario'
}

const pedidosParaMostrar = computed(() =>
  pedidosFiltrados.value.map((pedido) => ({
    ...pedido,
    nombreVisible: nombreUsuario(pedido.user),
    fechaVisible: formatearFecha(pedido.date),
    totalVisible: formatearTotal(pedido.total),
    estadoVisible: formatearEstado(pedido.status),
  })),
)

function valorResumen(valor) {
  if (cargando.value) return '…'
  if (error.value) return '—'
  return valor
}
</script>

<template>
  <section class="section dashboard-section">
    <div class="container is-max-widescreen">
      <div class="dashboard-heading">
        <div>
          <p class="eyebrow">Panel del sitio</p>
          <h1 class="title is-2">Resumen de ventas</h1>
          <p class="subtitle">Actividad mensual de {{ anioSeleccionado }}</p>
        </div>

        <button
          class="button is-outlined"
          type="button"
          :disabled="cargando"
          @click="cargarPedidos"
        >
          {{ cargando ? 'Actualizando…' : 'Actualizar' }}
        </button>
      </div>

      <div
        v-if="error"
        class="notification is-danger is-light"
        role="alert"
      >
        <p>{{ error }}</p>
        <button
          class="button is-small is-danger is-light dashboard-retry"
          type="button"
          @click="cargarPedidos"
        >
          Reintentar
        </button>
      </div>

      <div class="columns is-variable is-4 summary-cards">
        <div class="column is-half">
          <article class="box summary-card">
            <p class="summary-label">Pedidos registrados</p>
            <p class="summary-value">{{ valorResumen(totalPedidos) }}</p>
            <p class="summary-note">Pedidos durante {{ anioSeleccionado }}</p>
          </article>
        </div>
        <div class="column is-half">
          <article class="box summary-card pistachio-card">
            <p class="summary-label">Unidades vendidas</p>
            <p class="summary-value">{{ valorResumen(totalUnidades) }}</p>
            <p class="summary-note">Productos incluidos en los pedidos</p>
          </article>
        </div>
      </div>

      <article class="box chart-card">
        <div class="chart-heading">
          <div>
            <h2 class="title is-4">Pedidos por mes</h2>
            <p class="chart-description">Cantidad de pedidos del año seleccionado</p>
          </div>
        </div>

        <div v-if="cargando" class="dashboard-state" role="status" aria-live="polite">
          <progress class="progress is-small is-primary" max="100">
            Cargando pedidos
          </progress>
          <p>Cargando actividad real de pedidos…</p>
        </div>

        <div v-else-if="error" class="dashboard-state">
          <p>El gráfico estará disponible cuando se puedan cargar los pedidos.</p>
        </div>

        <div v-else-if="pedidosDelAnio.length === 0" class="dashboard-state">
          <p>No hay pedidos registrados durante {{ anioSeleccionado }}.</p>
        </div>

        <div v-else class="chart-container">
          <Line
            :data="datosGrafico"
            :options="opcionesGrafico"
            aria-label="Gráfico de pedidos por mes"
          />
        </div>
      </article>

      <article class="box orders-card">
        <div class="orders-heading">
          <div>
            <h2 class="title is-4">Pedidos de todos los usuarios</h2>
            <p class="orders-description">Filtrá por estado o consultá el listado completo.</p>
          </div>

          <div class="field orders-filter">
            <label class="label" for="filtro-estado-pedido">Estado</label>
            <div class="control">
              <div class="select">
                <select id="filtro-estado-pedido" v-model="estadoSeleccionado">
                  <option value="todos">Todos</option>
                  <option
                    v-for="estado in estadosDisponibles"
                    :key="estado"
                    :value="estado"
                  >
                    {{ formatearEstado(estado) }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <p v-if="!cargando && !error" class="orders-count">
          {{ pedidosFiltrados.length }}
          {{ pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos' }}
        </p>

        <div v-if="cargando" class="dashboard-state" role="status" aria-live="polite">
          <progress class="progress is-small is-primary" max="100">
            Cargando pedidos
          </progress>
          <p>Cargando listado de pedidos…</p>
        </div>

        <div v-else-if="error" class="dashboard-state">
          <p>El listado estará disponible cuando se puedan cargar los pedidos.</p>
        </div>

        <div v-else-if="pedidosFiltrados.length === 0" class="dashboard-state">
          <p v-if="pedidos.length === 0" class="title is-5">
            Todavía no hay pedidos
          </p>
          <p v-else class="title is-5">
            No hay pedidos con estado {{ formatearEstado(estadoSeleccionado) }}
          </p>
          <p v-if="pedidos.length === 0">
            Cuando se registre una compra, aparecerá en este listado.
          </p>
          <p v-else>
            Elegí otro estado o seleccioná “Todos” para volver al listado completo.
          </p>
        </div>

        <div v-else class="table-container">
          <table class="table is-fullwidth is-hoverable orders-table">
            <thead>
              <tr>
                <th scope="col">N.º de pedido</th>
                <th scope="col">Usuario</th>
                <th scope="col">Fecha</th>
                <th scope="col">Total</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="pedido in pedidosParaMostrar" :key="pedido.id">
                <th scope="row">#{{ pedido.id }}</th>
                <td>
                  <span class="order-user-name">{{ pedido.nombreVisible }}</span>
                  <span v-if="pedido.user?.username" class="order-username">
                    {{ pedido.user.username }}
                  </span>
                </td>
                <td>{{ pedido.fechaVisible }}</td>
                <td>{{ pedido.totalVisible }}</td>
                <td>
                  <span class="tag is-light">{{ pedido.estadoVisible }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.dashboard-section {
  min-height: calc(100vh - 4.5rem);
}

.dashboard-heading,
.chart-heading,
.orders-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.dashboard-heading {
  margin-bottom: 1.5rem;
}

.eyebrow,
.summary-label {
  color: var(--color-secundario);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.summary-cards {
  margin-bottom: 0.5rem;
}

.summary-card {
  min-height: 9rem;
  border: 1px solid var(--color-borde);
}

.pistachio-card {
  background: #e7edda;
}

.summary-value {
  margin: 0.35rem 0;
  color: var(--color-texto);
  font-size: 2rem;
  font-weight: 750;
  line-height: 1.1;
}

.summary-note,
.chart-description,
.orders-description,
.orders-count,
.dashboard-state > p {
  color: var(--color-secundario);
  font-size: 0.9rem;
}

.chart-card,
.orders-card {
  border: 1px solid var(--color-borde);
}

.orders-card {
  margin-top: 1.25rem;
}

.dashboard-retry {
  margin-top: 0.75rem;
}

.dashboard-state {
  padding: 2.5rem 1rem;
  text-align: center;
}

.dashboard-state .progress {
  max-width: 24rem;
  margin: 0 auto 1rem;
}

.orders-heading {
  align-items: flex-end;
  margin-bottom: 0.75rem;
}

.orders-filter {
  min-width: 12rem;
  margin-bottom: 0;
}

.orders-filter .select,
.orders-filter select {
  width: 100%;
}

.orders-count {
  margin-bottom: 0.5rem;
}

.orders-table th,
.orders-table td {
  vertical-align: middle;
}

.order-user-name,
.order-username {
  display: block;
}

.order-user-name {
  font-weight: 600;
}

.order-username {
  color: var(--color-secundario);
  font-size: 0.9rem;
}

.chart-container {
  position: relative;
  height: 360px;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .dashboard-heading,
  .orders-heading {
    flex-direction: column;
  }

  .orders-filter {
    width: 100%;
  }

  .chart-container {
    height: 300px;
  }
}
</style>