<script setup>
import ProductoCard from './productoCard.vue'

defineProps({
  productos: {
    type: Array,
    default: () => [],
  },
})

import { ref } from 'vue'

const carrusel = ref(null)

function desplazar(direccion) {
  carrusel.value?.scrollBy({
    left: direccion * 300,
    behavior: 'smooth',
  })
}
</script>

<template>
  <section class="featured-section" aria-labelledby="destacados-title">
    <h2 id="destacados-title" class="title is-3">Destacados</h2>

    <div class="featured-carousel-wrapper">
      <button
        class="carousel-arrow"
        type="button"
        aria-label="Ver productos anteriores"
        @click="desplazar(-1)"
      >
        ‹
      </button>

      <div ref="carrusel" class="featured-carousel">
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
  background: var(--color-pistacho);
  transform: scale(1.05);
}

.carousel-arrow:focus-visible {
  outline: 2px solid var(--color-texto);
  outline-offset: 3px;
}
</style>