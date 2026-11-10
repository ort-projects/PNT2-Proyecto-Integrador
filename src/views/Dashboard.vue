<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useAuthStore } from '../store/auth.js'
import { ESTADOS_PEDIDO, normalizarEstadoPedido, obtenerEstadoPedido } from '../utils/pedidoEstado.js'
import { Bar, Line } from 'vue-chartjs'
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'

ChartJS.register(
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
)

const authStore = useAuthStore()
const anioSeleccionado = new Date().getFullYear()
const DASHBOARD_URL = 'http://localhost:3000/admin/dashboard'
const PEDIDOS_URL = 'http://localhost:3000/pedidos/all'
const USUARIOS_URL = 'http://localhost:3000/usuarios'

const ventas = ref([])
const productos = ref([])
const pedidos = ref([])
const pedidosTodos = ref([])
const usuarios = ref(null)
const cargandoDashboard = ref(true)
const cargandoPedidos = ref(true)
const cargandoUsuarios = ref(true)
const errorCarga = ref('')
const errorPedidos = ref('')
const errorUsuarios = ref('')
const estadoSeleccionado = ref('todos')
const usuarioSeleccionado = ref('todos')
const productoActualizandoId = ref(null)
const errorDestacado = ref('')

async function fetchJsonConAuth(url, mensajeError, opciones = {}) {
  const response = await authStore.fetchWithAuth(url, opciones)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(
      data?.error?.message || data?.message || mensajeError,
    )
  }

  return data
}

function crearCargaUnica({ cargando, error, mensajeError, ejecutar }) {
  let solicitud = null

  return function cargar() {
    if (solicitud) return solicitud

    cargando.value = true
    error.value = ''
    solicitud = Promise.resolve()
      .then(() => ejecutar(mensajeError))
      .catch((err) => {
        error.value = err instanceof Error ? err.message : mensajeError
      })
      .finally(() => {
        cargando.value = false
        solicitud = null
      })

    return solicitud
  }
}

const cargarDashboard = crearCargaUnica({
  cargando: cargandoDashboard,
  error: errorCarga,
  mensajeError: 'No se pudieron cargar los datos del panel.',
  ejecutar: async (mensajeError) => {
    const data = await fetchJsonConAuth(
      DASHBOARD_URL + '?selectedYear=' + anioSeleccionado,
      mensajeError,
    )

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('El servidor devolvió datos del panel inválidos.')
    }

    ventas.value = Array.isArray(data.ventas) ? data.ventas : []
    productos.value = Array.isArray(data.productos) ? data.productos : []
  },
})

const cargarPedidos = crearCargaUnica({
  cargando: cargandoPedidos,
  error: errorPedidos,
  mensajeError: 'No se pudieron cargar los pedidos.',
  ejecutar: async (mensajeError) => {
    const parametros = new URLSearchParams({
      username: usuarioSeleccionado.value,
    })
    const urlPedidos =
      usuarioSeleccionado.value === 'todos'
        ? PEDIDOS_URL
        : `${PEDIDOS_URL}?${parametros.toString()}`
    const data = await fetchJsonConAuth(
      urlPedidos,
      mensajeError,
    )

    if (!Array.isArray(data)) {
      throw new Error('El servidor devolvió un listado de pedidos inválido.')
    }

    pedidos.value = data
    if (usuarioSeleccionado.value === 'todos') {
      pedidosTodos.value = data
    }
  },
})

const cargarUsuarios = crearCargaUnica({
  cargando: cargandoUsuarios,
  error: errorUsuarios,
  mensajeError: 'No se pudo cargar la lista de usuarios.',
  ejecutar: async (mensajeError) => {
    const data = await fetchJsonConAuth(USUARIOS_URL, mensajeError)

    if (!Array.isArray(data)) {
      throw new Error('El servidor devolvió una lista de usuarios inválida.')
    }

    usuarios.value = data
  },
})

function actualizarPanel() {
  return Promise.all([cargarDashboard(), cargarPedidos(), cargarUsuarios()])
}

function alVolverAlPanel() {
  void actualizarPanel()
}

onMounted(() => {
  void actualizarPanel()
  window.addEventListener('focus', alVolverAlPanel)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', alVolverAlPanel)
})

watch(
  () => authStore.token,
  (token) => {
    if (token && authStore.isAdmin) void actualizarPanel()
  },
)

async function alternarDestacado(producto) {
  productoActualizandoId.value = producto.id
  errorDestacado.value = ''

  try {
    await fetchJsonConAuth(
      'http://localhost:3000/admin/productos/' + producto.id,
      'No se pudo actualizar el destacado.',
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destacado: !producto.destacado }),
      },
    )

    producto.destacado = !producto.destacado
  } catch (error) {
    errorDestacado.value =
      error instanceof Error
        ? error.message
        : 'Ocurrió un error al actualizar el producto.'
  } finally {
    productoActualizandoId.value = null
  }
}

const nombresMeses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]
const nombresDias = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
]

function convertirFecha(fecha) {
  const texto = String(fecha ?? '')
  const fechaLocal =
    /^\d{4}-\d{2}-\d{2}$/.test(texto) ? texto + 'T12:00:00' : texto
  const fechaParseada = new Date(fechaLocal)

  return Number.isNaN(fechaParseada.getTime()) ? null : fechaParseada
}

function numeroFinito(valor) {
  const numero = Number(valor)
  return Number.isFinite(numero) ? numero : 0
}

function metricasDeItem(item) {
  const unidades = numeroFinito(item.cantidad)

  return {
    unidades,
    ingresos: numeroFinito(item.precio) * unidades,
  }
}

function resumirVentasPorPeriodo(cantidadPeriodos, indiceDeFecha) {
  const resumen = Array.from({ length: cantidadPeriodos }, () => ({
    pedidos: 0,
    unidades: 0,
    ingresos: 0,
  }))

  ventas.value.forEach((venta) => {
    const fecha = convertirFecha(venta.fecha)
    if (!fecha) return

    const periodo = resumen[indiceDeFecha(fecha)]
    if (!periodo) return

    periodo.pedidos += 1
    const productosDelPedido = Array.isArray(venta.productos)
      ? venta.productos
      : []

    productosDelPedido.forEach((item) => {
      const metricas = metricasDeItem(item)
      periodo.unidades += metricas.unidades
      periodo.ingresos += metricas.ingresos
    })
  })

  return resumen
}

const resumenMensual = computed(() =>
  resumirVentasPorPeriodo(
    nombresMeses.length,
    (fecha) => fecha.getMonth(),
  ),
)

const ventasPorDia = computed(() =>
  resumirVentasPorPeriodo(
    nombresDias.length,
    (fecha) => (fecha.getDay() + 6) % 7,
  ),
)

const unidadesPorProducto = computed(() => {
  const unidades = new Map(
    productos.value.map((producto) => [
      String(producto.id),
      { ...producto, unidades: 0, ingresos: 0 },
    ]),
  )

  ventas.value.forEach((venta) => {
    const productosDelPedido = Array.isArray(venta.productos)
      ? venta.productos
      : []

    productosDelPedido.forEach((item) => {
      const producto = unidades.get(String(item.productoId))
      if (!producto) return

      const metricas = metricasDeItem(item)
      producto.unidades += metricas.unidades
      producto.ingresos += metricas.ingresos
    })
  })

  return [...unidades.values()]
})

const totalVentas = computed(() => ventas.value.length)
const totalUnidades = computed(() =>
  resumenMensual.value.reduce((total, mes) => total + mes.unidades, 0),
)
const totalIngresos = computed(() =>
  resumenMensual.value.reduce((total, mes) => total + mes.ingresos, 0),
)
const ticketPromedio = computed(() =>
  totalVentas.value ? totalIngresos.value / totalVentas.value : 0,
)
const menorDia = computed(() => {
  const diasConDatos = ventasPorDia.value.filter((dia) => dia.pedidos > 0)
  if (!diasConDatos.length) return null

  const menor = Math.min(...diasConDatos.map((dia) => dia.pedidos))
  return ventasPorDia.value.findIndex((dia) => dia.pedidos === menor)
})
const candidatosPromocion = computed(() =>
  [...unidadesPorProducto.value]
    .sort(
      (a, b) =>
        a.unidades - b.unidades ||
        String(a.nombre ?? '').localeCompare(String(b.nombre ?? '')),
    )
    .slice(0, 3),
)
const productosMasVendidos = computed(() =>
  [...unidadesPorProducto.value]
    .sort(
      (a, b) =>
        b.unidades - a.unidades ||
        String(a.nombre ?? '').localeCompare(String(b.nombre ?? '')),
    )
    .slice(0, 8),
)

function obtenerColorDeTema(nombre) {
  return getComputedStyle(document.documentElement).getPropertyValue(nombre).trim()
}

const coloresGrafico = {
  serie: obtenerColorDeTema('--color-grafico-serie'),
  relleno: obtenerColorDeTema('--color-grafico-relleno'),
  destacado: obtenerColorDeTema('--color-grafico-destacado'),
  superficie: obtenerColorDeTema('--color-grafico-superficie'),
  rejilla: obtenerColorDeTema('--color-grafico-rejilla'),
  texto: obtenerColorDeTema('--color-secundario'),
}
const datosMensuales = computed(() => ({
  labels: nombresMeses,
  datasets: [
    {
      label: 'Pedidos',
      data: resumenMensual.value.map((mes) => mes.pedidos),
      borderColor: coloresGrafico.serie,
      backgroundColor: coloresGrafico.relleno,
      borderWidth: 2.5,
      pointRadius: 3,
      pointHoverRadius: 7,
      pointBackgroundColor: coloresGrafico.serie,
      pointBorderColor: coloresGrafico.superficie,
      pointBorderWidth: 2,
      tension: 0.35,
      fill: true,
    },
  ],
}))

const datosDias = computed(() => ({
  labels: nombresDias,
  datasets: [
    {
      label: 'Unidades vendidas',
      data: ventasPorDia.value.map((dia) => dia.unidades),
      backgroundColor: nombresDias.map((_, index) =>
        index === menorDia.value ? coloresGrafico.destacado : coloresGrafico.serie,
      ),
      borderRadius: 5,
      maxBarThickness: 48,
    },
  ],
}))

const datosProductos = computed(() => ({
  labels: productosMasVendidos.value.map((producto) => producto.nombre),
  datasets: [
    {
      label: 'Unidades',
      data: productosMasVendidos.value.map((producto) => producto.unidades),
      backgroundColor: coloresGrafico.serie,
      borderRadius: 5,
      maxBarThickness: 28,
    },
  ],
}))

const opcionesLinea = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: { mode: 'index', intersect: false },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => String(context.parsed.y) + ' pedidos',
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { color: coloresGrafico.texto } },
    y: {
      beginAtZero: true,
      ticks: { precision: 0, color: coloresGrafico.texto },
      grid: { color: coloresGrafico.rejilla },
    },
  },
}

const opcionesBarras = {
  ...opcionesLinea,
  plugins: {
    ...opcionesLinea.plugins,
    tooltip: {
      callbacks: {
        label: (context) => String(context.parsed.y) + ' unidades',
      },
    },
  },
}

const opcionesBarrasHorizontales = {
  ...opcionesBarras,
  indexAxis: 'y',
  scales: {
    x: {
      beginAtZero: true,
      ticks: { precision: 0, color: coloresGrafico.texto },
      grid: { color: coloresGrafico.rejilla },
    },
    y: { grid: { display: false }, ticks: { color: coloresGrafico.texto } },
  },
}

const formatoMoneda = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})
const formatoMonedaPedido = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
})

const nombresEstado = (estado) => {
  const palabras = String(estado ?? '')
    .trim()
    .replaceAll('_', ' ')
    .split(/\s+/)
    .filter(Boolean)

  if (palabras.length === 0) return 'Sin estado'

  return palabras
    .map(
      (palabra) =>
        palabra.charAt(0).toLocaleUpperCase('es-AR') +
        palabra.slice(1).toLocaleLowerCase('es-AR'),
    )
    .join(' ')
}

const estadosDisponibles = ESTADOS_PEDIDO

const usuariosDisponibles = computed(() => {
  const usuariosPorUsername = new Map()
  const usuariosFuente =
    usuarios.value ?? pedidosTodos.value.map((pedido) => pedido?.user)

  usuariosFuente.forEach((usuario) => {
    const username = typeof usuario?.username === 'string'
      ? usuario.username.trim()
      : ''

    if (!username || usuariosPorUsername.has(username)) return

    const nombre = nombreUsuario(usuario)
    usuariosPorUsername.set(username, {
      username,
      nombre,
      etiqueta: nombre === username ? username : `${nombre} (${username})`,
    })
  })

  return [...usuariosPorUsername.values()].sort((a, b) =>
    a.nombre.localeCompare(b.nombre, 'es-AR') ||
    a.username.localeCompare(b.username, 'es-AR'),
  )
})

const pedidosFiltrados = computed(() => {
  return pedidos.value.filter((pedido) => {
    const coincideEstado =
      estadoSeleccionado.value === 'todos' ||
      normalizarEstadoPedido(pedido.status) === estadoSeleccionado.value
    const coincideUsuario =
      usuarioSeleccionado.value === 'todos' ||
      String(pedido.user?.username ?? '').trim() === usuarioSeleccionado.value

    return coincideEstado && coincideUsuario
  })
})

function cambiarUsuario() {
  void cargarPedidos()
}

function mensajeSinPedidos() {
  if (
    usuarioSeleccionado.value === 'todos' &&
    estadoSeleccionado.value === 'todos'
  ) {
    return 'Todavía no hay pedidos'
  }

  const filtros = []
  if (usuarioSeleccionado.value !== 'todos') {
    const usuario = usuariosDisponibles.value.find(
      (opcion) => opcion.username === usuarioSeleccionado.value,
    )
    filtros.push(`de ${usuario?.nombre ?? usuarioSeleccionado.value}`)
  }
  if (estadoSeleccionado.value !== 'todos') {
    filtros.push(`con estado ${nombresEstado(estadoSeleccionado.value)}`)
  }

  return `No hay pedidos ${filtros.join(' ')}`
}

function formatearFechaPedido(fecha) {
  const fechaPedido = convertirFecha(fecha)
  if (!fechaPedido) return '—'

  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(fechaPedido)
}

function formatearTotal(total) {
  const totalNumerico = Number(total)
  return Number.isFinite(totalNumerico)
    ? formatoMonedaPedido.format(totalNumerico)
    : '—'
}

function nombreUsuario(usuario) {
  const nombre = [usuario?.name, usuario?.surname]
    .filter((parte) => typeof parte === 'string' && parte.trim())
    .map((parte) => parte.trim())
    .join(' ')

  return nombre || usuario?.username || 'Usuario'
}

const clasesEstadoAdicionales = {
  pendiente_pago: 'is-warning estado-pedido--pendiente-pago',
  pagado: 'is-success estado-pedido--pagado',
  en_preparacion: 'is-info estado-pedido--en-preparacion',
  reembolsado: 'is-light estado-pedido--reembolsado',
}

function claseEstadoPedido(estado) {
  const normalizado = normalizarEstadoPedido(estado)

  return (
    obtenerEstadoPedido(estado).clase ||
    clasesEstadoAdicionales[normalizado] ||
    ''
  )
}
const pedidosParaMostrar = computed(() =>
  pedidosFiltrados.value.map((pedido) => ({
    ...pedido,
    nombreVisible: nombreUsuario(pedido.user),
    fechaVisible: formatearFechaPedido(pedido.date),
    totalVisible: formatearTotal(pedido.total),
    estadoVisible: nombresEstado(pedido.status),
    claseEstado: claseEstadoPedido(pedido.status),
  })),
)
</script>

<template>
  <section class="section dashboard-section">
    <div class="container is-max-widescreen">
      <div class="dashboard-heading">
        <div>
          <p class="eyebrow">Panel del sitio</p>
          <h1 class="title is-2">Resumen de ventas</h1>
          <p class="subtitle">
            Actividad y oportunidades comerciales de {{ anioSeleccionado }}
          </p>
        </div>

        <button
          class="button is-secondary"
          type="button"
          :disabled="cargandoDashboard || cargandoPedidos"
          @click="actualizarPanel"
        >
          {{
            cargandoDashboard || cargandoPedidos
              ? 'Actualizando…'
              : 'Actualizar'
          }}
        </button>
      </div>

      <div
        v-if="errorCarga"
        class="notification is-warning is-light"
        role="alert"
      >
        <p>{{ errorCarga }}</p>
        <button
          class="button is-small is-warning is-light dashboard-retry"
          type="button"
          @click="cargarDashboard"
        >
          Reintentar datos de ventas
        </button>
      </div>

      <div
        v-if="errorPedidos"
        class="notification is-danger is-light"
        role="alert"
      >
        <p>{{ errorPedidos }}</p>
        <button
          class="button is-small is-danger is-light dashboard-retry"
          type="button"
          @click="cargarPedidos"
        >
          Reintentar listado
        </button>
      </div>

      <div
        v-if="cargandoDashboard"
        class="box dashboard-state"
        role="status"
        aria-live="polite"
      >
        <progress class="progress is-small is-primary" max="100">
          Cargando ventas
        </progress>
        <p>Cargando métricas de ventas…</p>
      </div>

      <template v-else-if="!errorCarga">
        <div class="columns is-variable is-4 summary-cards">
          <div class="column is-half-tablet is-one-quarter-desktop">
            <article class="box summary-card">
              <p class="summary-label">Pedidos</p>
              <p class="summary-value">{{ totalVentas }}</p>
              <p class="summary-note">
                Pedidos registrados en {{ anioSeleccionado }}
              </p>
            </article>
          </div>
          <div class="column is-half-tablet is-one-quarter-desktop">
            <article class="box summary-card">
              <p class="summary-label">Unidades</p>
              <p class="summary-value">{{ totalUnidades }}</p>
              <p class="summary-note">Prendas incluidas en los pedidos</p>
            </article>
          </div>
          <div class="column is-half-tablet is-one-quarter-desktop">
            <article class="box summary-card">
              <p class="summary-label">Ingresos registrados</p>
              <p class="summary-value summary-value-money">
                {{ formatoMoneda.format(totalIngresos) }}
              </p>
              <p class="summary-note">
                Calculados con el precio de cada pedido
              </p>
            </article>
          </div>
          <div class="column is-half-tablet is-one-quarter-desktop">
            <article class="box summary-card">
              <p class="summary-label">Pedido promedio</p>
              <p class="summary-value summary-value-money">
                {{ formatoMoneda.format(ticketPromedio) }}
              </p>
              <p class="summary-note">Ingreso promedio por pedido</p>
            </article>
          </div>
        </div>

        <div class="columns is-variable is-4 chart-row">
          <div class="column is-7">
            <article class="box chart-card">
              <div class="chart-heading">
                <div>
                  <h2 class="title is-4">Pedidos por mes</h2>
                  <p class="chart-description">
                    Evolución de los pedidos durante el año
                  </p>
                </div>
              </div>
              <div class="chart-container">
                <Line
                  :data="datosMensuales"
                  :options="opcionesLinea"
                  aria-label="Gráfico de pedidos por mes"
                />
              </div>
            </article>
          </div>
          <div class="column is-5">
            <article class="box chart-card">
              <div class="chart-heading">
                <div>
                  <h2 class="title is-4">Unidades por día</h2>
                  <p class="chart-description">
                    Unidades vendidas según el día de la semana
                  </p>
                </div>
              </div>
              <div class="chart-container">
                <Bar
                  :data="datosDias"
                  :options="opcionesBarras"
                  aria-label="Gráfico de unidades vendidas por día de la semana"
                />
              </div>
            </article>
          </div>
        </div>

        <div class="columns is-variable is-4 chart-row">
          <div class="column is-7">
            <article class="box chart-card">
              <div class="chart-heading">
                <div>
                  <h2 class="title is-4">Productos más vendidos</h2>
                  <p class="chart-description">
                    Ranking por unidades vendidas en {{ anioSeleccionado }}
                  </p>
                </div>
              </div>
              <div
                v-if="productosMasVendidos.length"
                class="chart-container product-chart-container"
              >
                <Bar
                  :data="datosProductos"
                  :options="opcionesBarrasHorizontales"
                  aria-label="Ranking de productos más vendidos"
                />
              </div>
              <p v-else class="empty-state">
                Todavía no hay ventas para mostrar.
              </p>
            </article>
          </div>
          <div class="column is-5">
            <article class="box recommendation-card">
              <p class="eyebrow">Para evaluar</p>
              <h2 class="title is-4">Ideas para promociones</h2>
              <p
                v-if="menorDia !== null"
                class="recommendation-copy"
              >
                El día con menos pedidos registrados es
                <strong>{{ nombresDias[menorDia] }}</strong>. Podés probar una
                promoción ese día y medir si cambia el movimiento.
              </p>
              <p v-else class="recommendation-copy">
                Cuando haya ventas registradas, vas a ver qué día tuvo menos
                pedidos.
              </p>
              <p class="candidate-label">Productos con menor movimiento</p>
              <p v-if="errorDestacado" class="action-error" role="alert">
                {{ errorDestacado }}
              </p>
              <ul v-if="candidatosPromocion.length" class="candidate-list">
                <li
                  v-for="producto in candidatosPromocion"
                  :key="producto.id"
                >
                  <span class="candidate-name">
                    {{ producto.nombre }}
                    <strong>{{ producto.unidades }} u.</strong>
                  </span>
                  <button
                    type="button"
                    class="button is-small featured-button"
                    :disabled="productoActualizandoId === producto.id"
                    :aria-pressed="producto.destacado"
                    @click="alternarDestacado(producto)"
                  >
                    {{
                      productoActualizandoId === producto.id
                        ? 'Guardando…'
                        : producto.destacado
                          ? '★ Destacado'
                          : '☆ Destacar'
                    }}
                  </button>
                </li>
              </ul>
              <p v-else class="empty-state">
                No hay productos cargados en el catálogo.
              </p>
              <p class="recommendation-footnote">
                La sugerencia usa ventas del año; revisá stock y margen antes
                de definir el descuento.
              </p>
            </article>
          </div>
        </div>
      </template>

      <article class="box orders-card">
        <div class="orders-heading">
          <div>
            <h2 class="title is-4">Pedidos de todos los usuarios</h2>
            <p class="orders-description">
              Filtrá por usuario y estado o consultá el listado completo.
            </p>
          </div>

          <div class="orders-filters">
            <div class="field orders-filter">
              <label class="label" for="filtro-usuario-pedido">Usuario</label>
              <div class="control">
                <div class="select">
                  <select
                    id="filtro-usuario-pedido"
                    v-model="usuarioSeleccionado"
                    :disabled="cargandoPedidos || cargandoUsuarios"
                    @change="cambiarUsuario"
                  >
                    <option value="todos">Todos los usuarios</option>
                    <option
                      v-for="usuario in usuariosDisponibles"
                      :key="usuario.username"
                      :value="usuario.username"
                    >
                      {{ usuario.etiqueta }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="field orders-filter">
              <label class="label" for="filtro-estado-pedido">Estado</label>
              <div class="control">
                <div class="select">
                  <select
                    id="filtro-estado-pedido"
                    v-model="estadoSeleccionado"
                  >
                    <option value="todos">Todos</option>
                    <option
                      v-for="estado in estadosDisponibles"
                      :key="estado"
                      :value="estado"
                    >
                      {{ nombresEstado(estado) }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p v-if="errorUsuarios" class="orders-description" role="status">
          No se pudo cargar la lista de usuarios, verifique que el usuario sea
          correcto y tenga pedidos.
        </p>

        <p
          v-if="!cargandoPedidos && !errorPedidos"
          class="orders-count"
        >
          {{ pedidosFiltrados.length }}
          {{ pedidosFiltrados.length === 1 ? 'pedido' : 'pedidos' }}
        </p>

        <div
          v-if="cargandoPedidos"
          class="dashboard-state"
          role="status"
          aria-live="polite"
        >
          <progress class="progress is-small is-primary" max="100">
            Cargando pedidos
          </progress>
          <p>Cargando listado de pedidos…</p>
        </div>

        <div v-else-if="errorPedidos" class="dashboard-state">
          <p>El listado estará disponible cuando se puedan cargar los pedidos.</p>
        </div>

        <div v-else-if="pedidosFiltrados.length === 0" class="dashboard-state">
          <p class="title is-5">
            {{ mensajeSinPedidos() }}
          </p>
          <p
            v-if="
              pedidos.length === 0 &&
              usuarioSeleccionado === 'todos' &&
              estadoSeleccionado === 'todos'
            "
          >
            Cuando se registre una compra, aparecerá en este listado.
          </p>
          <p v-else>
            Elegí otro usuario o estado, o seleccioná “Todos” para volver al
            listado completo.
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
              <tr
                v-for="pedido in pedidosParaMostrar"
                :key="pedido.id"
              >
                <th scope="row">#{{ pedido.id }}</th>
                <td>
                  <span class="order-user-name">
                    {{ pedido.nombreVisible }}
                  </span>
                  <span
                    v-if="pedido.user?.username"
                    class="order-username"
                  >
                    {{ pedido.user.username }}
                  </span>
                </td>
                <td>{{ pedido.fechaVisible }}</td>
                <td>{{ pedido.totalVisible }}</td>
                <td>
                  <span class="tag is-light" :class="pedido.claseEstado">
                    {{ pedido.estadoVisible }}
                  </span>
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
  height: 100%;
  border: 1px solid var(--color-borde);
}


.summary-value {
  margin: 0.35rem 0;
  color: var(--color-texto);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
}

.summary-value-money {
  font-size: clamp(1.35rem, 2vw, 2rem);
}

.summary-note,
.chart-description,
.orders-description,
.orders-count,
.dashboard-state > p {
  color: var(--color-secundario);
  font-size: 0.9rem;
}

.chart-row {
  margin-top: 0.25rem;
}

.chart-card,
.orders-card,
.recommendation-card {
  height: 100%;
  border: 1px solid var(--color-borde);
}

.orders-card {
  margin-top: 1.25rem;
}


.chart-card .title,
.recommendation-card .title {
  margin-bottom: 0.35rem;
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

.orders-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.orders-filter {
  flex: 1 1 12rem;
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
  height: 300px;
  margin-top: 1rem;
}

.product-chart-container {
  height: 330px;
}

.recommendation-copy {
  margin: 1rem 0 1.4rem;
  color: var(--color-secundario);
  line-height: 1.5;
}

.recommendation-copy strong {
  color: var(--color-texto);
}

.candidate-label {
  margin-bottom: 0.5rem;
  font-size: 0.88rem;
  font-weight: 700;
}

.candidate-list {
  margin: 0;
  list-style: none;
}

.candidate-list li {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--color-borde);
  font-size: 0.9rem;
}

.candidate-name {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.candidate-name strong {
  color: var(--color-secundario);
  font-size: 0.78rem;
  white-space: nowrap;
}

.featured-button {
  min-width: 7rem;
  align-self: center;
  border-color: var(--color-borde);
  background: var(--color-superficie);
  color: var(--color-texto);
  letter-spacing: 0;
  text-transform: none;
}

.featured-button[aria-pressed='true'] {
  background: var(--color-acento);
  border-color: var(--color-acento-hover);
}

.action-error {
  margin: -0.25rem 0 0.5rem;
  color: var(--color-estado-error-texto);
  font-size: 0.85rem;
}

.recommendation-footnote {
  margin-top: 1rem;
  color: var(--color-secundario);
  font-size: 0.8rem;
  line-height: 1.45;
}

.empty-state,
.loading-card {
  color: var(--color-secundario);
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
    height: 280px;
  }

  .product-chart-container {
    height: 300px;
  }
}
</style>
