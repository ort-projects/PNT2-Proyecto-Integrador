<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import ProductoCard from './productoCard.vue'

const props = defineProps({
  productos: {
    type: Array,
    default: () => [],
  },
})

const carrusel = ref(null)
const hayAnterior = ref(false)
const haySiguiente = ref(false)

function actualizarFlechas() {
  const elemento = carrusel.value
  if (!elemento) {
    hayAnterior.value = false
    haySiguiente.value = false
    return
  }

  hayAnterior.value = elemento.scrollLeft > 1
  haySiguiente.value = elemento.scrollLeft + elemento.clientWidth < elemento.scrollWidth - 1
}

function desplazar(direccion) {
  const elemento = carrusel.value
  const primeraTarjeta = elemento?.querySelector('.featured-slide')
  if (!elemento || !primeraTarjeta) return

  const estilos = getComputedStyle(elemento)
  const espacio = Number.parseFloat(estilos.columnGap || estilos.gap) || 0
  const anchoTarjeta = primeraTarjeta.getBoundingClientRect().width

  elemento.scrollBy({
    left: direccion * (anchoTarjeta + espacio),
    behavior: 'smooth',
  })
}

watch(() => props.productos.length, async () => {
  await nextTick()
  actualizarFlechas()
})

onMounted(() => {
  actualizarFlechas()
  window.addEventListener('resize', actualizarFlechas)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', actualizarFlechas)
})
</script>

<template>
  <section class="featured-section" aria-label="Carrusel de productos">
    
    <div class="featured-carousel-wrapper">
      <button
        class="carousel-arrow"
        type="button"
        aria-label="Ver productos anteriores"
        :disabled="!hayAnterior"
        @click="desplazar(-1)"
      >
        ‹
      </button>

      <div ref="carrusel" class="featured-carousel" @scroll="actualizarFlechas">
        <div
          v-for="producto in productos"
          :key="producto.id"
          class="featured-slide"
        >
          <ProductoCard :producto="producto" />
        </div>
      </div>

      <button
        class="carousel-arrow"
        type="button"
        aria-label="Ver más productos"
        :disabled="!haySiguiente"
        @click="desplazar(1)"
      >
        ›
      </button>
    </div>
  </section>
</template>

<style scoped>
.featured-section {
  margin-bottom: 3rem;
}

.featured-carousel-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.featured-carousel {
  flex: 1;
  min-width: 0;
  display: grid;
  grid-auto-columns: minmax(14rem, 20rem);
  grid-auto-flow: column;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.5rem 0 1rem;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
}

.featured-carousel::-webkit-scrollbar {
  display: none;
}

.featured-slide {
  min-width: 0;
  scroll-snap-align: start;
}

.carousel-arrow {
  flex: 0 0 auto;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--color-borde);
  border-radius: 50%;
  background: var(--color-superficie);
  color: var(--color-texto);
  cursor: pointer;
  font-family: inherit;
  font-size: 1.6rem;
  line-height: 1;
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.carousel-arrow:hover {
  background: var(--color-acento);
  transform: scale(1.05);
}

.carousel-arrow:disabled {
  opacity: 0.4;
  cursor: default;
}

.carousel-arrow:disabled:hover {
  background: var(--color-superficie);
  transform: none;
}

.carousel-arrow:focus-visible {
  outline: 2px solid var(--color-texto);
  outline-offset: 3px;
}
</style>
