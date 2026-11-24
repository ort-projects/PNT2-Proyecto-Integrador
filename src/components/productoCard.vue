<script setup>
import { ref } from "vue"
import { useCartStore } from "../store/cart.js"

const props = defineProps(["producto"])
const cartStore = useCartStore()
const agregadoAlCarrito = ref(false)

function agregarAlCarrito() {
  cartStore.agregarProducto(props.producto.id)
  agregadoAlCarrito.value = true
}
</script>

<template>
  <article class="card product-card">
    <RouterLink
      class="product-link"
      :to="{ name: 'product', params: { id: producto.id } }"
      :aria-label="`Ver ${producto.title}`"
    >
      <div class="card-image">
        <figure class="image is-4by3">
          <img
            :src="producto.thumbnail"
            :alt="producto.title"
          />
        </figure>
      </div>

      <div class="card-content">
        <p class="title is-5">{{ producto.title }}</p>
        <p class="subtitle is-6">{{ producto.category }}</p>
        <p class="product-price">${{ producto.price }}</p>
      </div>
    </RouterLink>

    <div class="product-card-actions">
      <button
        type="button"
        class="button is-primary is-small add-to-cart"
        :aria-label="`Agregar ${producto.title} al carrito`"
        @click="agregarAlCarrito"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" class="add-to-cart-icon">
          <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.5L22 8H6" />
          <circle cx="10" cy="20" r="1" />
          <circle cx="18" cy="20" r="1" />
        </svg>
        <span>Agregar al carrito</span>
      </button>
      <p class="add-to-cart-status" role="status" aria-live="polite">
        {{ agregadoAlCarrito ? "Agregado al carrito." : "" }}
      </p>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-link {
  display: flex;
  flex: 1;
  flex-direction: column;
  color: inherit;
  text-decoration: none;
}

.product-link:hover {
  color: inherit;
}

.product-card .card-image {
  flex-shrink: 0;
}

.product-card .card-content {
  display: flex;
  flex: 1;
  flex-direction: column;
}

.product-price {
  margin-top: auto;
  padding-top: 1rem;
  font-weight: 700;
}

.product-card-actions {
  padding: 0 1.5rem 1.5rem;
}

.add-to-cart {
  display: inline-flex;
  width: 100%;
  min-height: 2.5rem;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.add-to-cart-icon {
  width: 1.15rem;
  height: 1.15rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

.add-to-cart-status {
  min-height: 1.25rem;
  margin: 0.45rem 0 0;
  color: var(--color-estado-exito-texto);
  font-size: 0.8rem;
  text-align: center;
}

.product-link:focus-visible,
.add-to-cart:focus-visible {
  outline: 2px solid var(--color-azul-lavanda);
  outline-offset: 3px;
}
</style>
