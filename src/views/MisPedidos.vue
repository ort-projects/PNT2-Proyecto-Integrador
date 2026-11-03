<script setup>
import { ref } from 'vue'

// Viene en true cuando se llega desde el carrito después de un 201 en POST /pedidos (Tarea 2).
const pedidoRegistrado = ref(Boolean(window.history.state?.pedidoRegistrado))

// Se borra del state para que el mensaje no vuelva a aparecer al recargar la página.
if (pedidoRegistrado.value) {
  window.history.replaceState({ ...window.history.state, pedidoRegistrado: false }, '')
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

      <!-- Tarea 3: listado de pedidos del usuario logueado. -->
    </div>
  </section>
</template>
