<script setup>
const props = defineProps(["producto"])
</script>

<template>
  <RouterLink
    :to="{name:'product', params: {id: producto.id} }">
    <div class="card is-hovered">
      <div class="card-image">
        <figure class="image is-4by3">
          <img
            :src="producto.imagen"
            :alt="producto.nombre"
          />
        </figure>
      </div>
      <div class="card-content">
        <div class="media">
          <div class="media-content">
             <p class="title is-4">{{ producto.nombre }}</p>
             <p class="subtitle is-6">{{ producto.categoria }}</p>
             <p>${{ producto.precio }}</p>
          </div>
        </div>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>

.card:hover{
  cursor: pointer;
}

</style>