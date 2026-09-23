<script setup>
const props = defineProps(["producto"])
</script>

<template>
  <div>
    <h2>{{ producto.nombre }}</h2>
    <p>${{ producto.precio }}</p>
    <p>{{ producto.categoria }}</p>
    <p>{{ producto.descripcion }}</p>
  </div>
</template>

<style scoped>
</style>