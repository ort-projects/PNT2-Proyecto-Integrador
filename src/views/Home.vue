<script setup>

import { ref, computed, onMounted } from "vue"
import ProductoCard from "../components/productoCard.vue"

const cargando = ref(false)
const error = ref("")
const busqueda = ref("")
const productos = ref([])

const URL = "https://dummyjson.com/products"

async function cargarProductos() {
  cargando.value = true
  error.value = ""

  try {
    const response = await fetch(URL)
    if (!response.ok) {
      throw new Error("No se pudieron cargar los productos.")
    }
    const data = await response.json()
    productos.value = data.products.map(producto => ({
      id: producto.id,
      nombre: producto.title,
      precio: producto.price,
      categoria: producto.category,
      imagen: producto.thumbnail,
      descripcion: producto.description
    }))
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}
 
onMounted(() => {cargarProductos()})

const productosFiltrados = computed(() => {
  return productos.value.filter(producto => {
    return (
      producto.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) ||
      producto.categoria.toLowerCase().includes(busqueda.value.toLowerCase())
    )
  })
})


</script>
<template>

  <div>
    <h1 class="title">
      Indumentaria Urbana ModArg
    </h1>

    <p class="subtitle">
      Catálogo de productos
    </p>

    <button class="button is-primary">
      Ver productos
    </button>
    
    <p v-if="cargando">
      Cargando productos...
    </p>

    <div v-else-if="error">
      <p>{{ error }}</p>

      <button @click="cargarProductos">
        Reintentar
      </button>
    </div>
    
    <div v-else>

      <input
        v-model="busqueda"
        type="text"
        placeholder="Buscar producto..."
      />

      <p v-if="productosFiltrados.length === 0">
        No se encontraron productos.
      </p>

      <ProductoCard
        v-for="producto in productosFiltrados"
        :key="producto.id"
        :producto="producto"
      />

    </div>

  </div>
</template>


<style scoped></style>