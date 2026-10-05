<script setup>
import ProductoCard from "./productoCard.vue"

defineProps(["productos"])
</script>

<template>
  <div class="container">
    <div class="columns is-multiline">
      <div
        v-for="producto in productos"
        :key="producto.id"
        class="column is-one-quarter-desktop is-one-third-tablet is-half-mobile"
      >
        <ProductoCard :producto="producto" />
      </div>
    </div>
  </div>
</template>