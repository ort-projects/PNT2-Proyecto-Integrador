<script setup>
import { computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import {CategoryScale,Chart as ChartJS,Filler,Legend,LineElement,
  LinearScale,PointElement,Tooltip,} from 'chart.js'

ChartJS.register(LineElement,PointElement,CategoryScale,LinearScale,
  Tooltip,Legend,Filler,)

const anioSeleccionado = new Date().getFullYear()

// Datos demostrativos. Luego se reemplazan por las ventas que devuelva la API.
const ventas = ref([
  { id: 1, fecha: `${anioSeleccionado}-01-12`, productos: [{ productoId: 1, cantidad: 2 }, { productoId: 2, cantidad: 1 }] },
  { id: 2, fecha: `${anioSeleccionado}-01-26`, productos: [{ productoId: 3, cantidad: 1 }] },
  { id: 3, fecha: `${anioSeleccionado}-02-08`, productos: [{ productoId: 1, cantidad: 1 }] },
  { id: 4, fecha: `${anioSeleccionado}-02-19`, productos: [{ productoId: 2, cantidad: 3 }] },
  { id: 5, fecha: `${anioSeleccionado}-03-05`, productos: [{ productoId: 3, cantidad: 2 }] },
  { id: 6, fecha: `${anioSeleccionado}-03-21`, productos: [{ productoId: 1, cantidad: 1 }, { productoId: 2, cantidad: 1 }] },
  { id: 7, fecha: `${anioSeleccionado}-04-10`, productos: [{ productoId: 2, cantidad: 2 }] },
  { id: 8, fecha: `${anioSeleccionado}-05-03`, productos: [{ productoId: 1, cantidad: 1 }] },
  { id: 9, fecha: `${anioSeleccionado}-05-18`, productos: [{ productoId: 3, cantidad: 2 }] },
  { id: 10, fecha: `${anioSeleccionado}-06-14`, productos: [{ productoId: 1, cantidad: 2 }] },
  { id: 11, fecha: `${anioSeleccionado}-07-09`, productos: [{ productoId: 2, cantidad: 1 }] },
  { id: 12, fecha: `${anioSeleccionado}-08-22`, productos: [{ productoId: 3, cantidad: 3 }] },
])

const nombresMeses = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const resumenMensual = computed(() => {
  const resumen = Array.from({ length: 12 }, () => ({ ventas: 0, unidades: 0 }))

  ventas.value.forEach((venta) => {
    const fecha = new Date(`${venta.fecha}T00:00:00`)

    if (fecha.getFullYear() === anioSeleccionado) {
      const mes = fecha.getMonth()
      resumen[mes].ventas += 1
      resumen[mes].unidades += venta.productos.reduce(
        (total, producto) => total + producto.cantidad,
        0,
      )
    }
  })

  return resumen
})

const totalVentas = computed(() => resumenMensual.value.reduce((total, mes) => total + mes.ventas, 0))
const totalUnidades = computed(() => resumenMensual.value.reduce((total, mes) => total + mes.unidades, 0))

const datosGrafico = computed(() => ({
  labels: nombresMeses,
  datasets: [
    {
      label: 'Ventas',
      data: resumenMensual.value.map((mes) => mes.ventas),
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
        label: (context) => `${context.parsed.y} ventas`,
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
      </div>

      <div class="columns is-variable is-4 summary-cards">
        <div class="column is-half">
          <article class="box summary-card">
            <p class="summary-label">Ventas registradas</p>
            <p class="summary-value">{{ totalVentas }}</p>
            <p class="summary-note">Pedidos durante {{ anioSeleccionado }}</p>
          </article>
        </div>
        <div class="column is-half">
          <article class="box summary-card pistachio-card">
            <p class="summary-label">Unidades vendidas</p>
            <p class="summary-value">{{ totalUnidades }}</p>
            <p class="summary-note">Productos incluidos en los pedidos</p>
          </article>
        </div>
      </div>

      <article class="box chart-card">
        <div class="chart-heading">
          <div>
            <h2 class="title is-4">Ventas por mes</h2>
          </div>
        </div>

        <div class="chart-container">
          <Line
            :data="datosGrafico"
            :options="opcionesGrafico"
            aria-label="Gráfico de ventas y unidades vendidas por mes"
          />
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
.chart-heading {
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
.chart-description {
  color: var(--color-secundario);
  font-size: 0.9rem;
}

.chart-card {
  border: 1px solid var(--color-borde);
}

.chart-container {
  position: relative;
  height: 360px;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .dashboard-heading {
    flex-direction: column;
  }

  .chart-container {
    height: 300px;
  }
}
</style>
