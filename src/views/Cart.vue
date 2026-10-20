<script setup>
import { computed } from 'vue'
import { useCartStore } from '../store/cart.js'

const cartStore = useCartStore()

const cantidadTotal = computed(() =>
  cartStore.items.reduce((total, item) => total + item.cantidad, 0),
)
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-2">Mi carrito</h1>

      <div v-if="cartStore.items.length === 0" class="notification">
        <p>Tu carrito está vacío.</p>

        <RouterLink to="/catalog" class="button is-primary mt-4">
          Ver productos
        </RouterLink>
      </div>

      <p v-else>
        Tenés {{ cantidadTotal }}
        {{ cantidadTotal === 1 ? 'producto' : 'productos' }} en el carrito.
      </p>
    </div>
  </section>
</template>