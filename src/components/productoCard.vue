<script setup>
const props = defineProps(["producto"])
</script>

<template>
  <RouterLink
    class="product-link"
    :to="{ name: 'product', params: { id: producto.id } }"
  >
    <div class="card product-card">
      <div class="card-image">
        <figure class="image is-4by3">
          <img
            :src="producto.imagen"
            :alt="producto.nombre"
          />
        </figure>
      </div>

      <div class="card-content">
        <p class="title is-5">{{ producto.nombre }}</p>
        <p class="subtitle is-6">{{ producto.categoria }}</p>
        <p class="product-price">${{ producto.precio }}</p>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.product-link {
  display: block;
  color: inherit;
}

.product-card {
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-link:hover .product-card {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgb(0 0 0 / 12%);
}

.product-price {
  font-weight: 700;
}
</style>