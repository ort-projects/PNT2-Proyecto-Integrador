<script setup>

import ProductoCard from "./productoCard.vue"
const props = defineProps(["productos"])

</script>

<template>
    <div class="container grid">
        <ProductoCard
                class="cell"
                v-for="producto in productos"
                :key="producto.id"
                :producto="producto"
              />
    </div>
</template>

<style scoped>

.d-flex{
    display:flex;
}

.w-80{
    width: "80vw";
}

</style>