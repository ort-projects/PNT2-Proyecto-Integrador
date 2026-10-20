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
    </div>
  </RouterLink>
</template>

<style scoped>
.product-link {
  display: flex;
  height: 100%;
  color: inherit;
}

.product-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-link:hover .product-card {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgb(0 0 0 / 12%);
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
</style>