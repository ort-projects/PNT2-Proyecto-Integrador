<script setup>

import { ref, computed, onMounted } from "vue"

import productoList from "../components/productoList.vue"

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
    <section class="hero is-light">
  <div class="hero-body">
    <div class="container">
      <h1 class="title">Indumentaria Urbana ModArg</h1>
      <p class="subtitle">Encontrá tu look</p>

      <div class="field">
        <label class="label" for="busqueda">Buscar productos</label>
        <div class="control">
          <input
            id="busqueda"
            v-model="busqueda"
            class="input"
            type="search"
            placeholder="Buscar por nombre o categoría..."
          />
        </div>
      </div>

    <a class="button is-primary is-outlined" href="#catalogo">
      Ver productos
    </a>
    </div>
  </div>
</section>
<section id="catalogo" class="section">
  <div class="container">
    <h2 class="title is-3">Catálogo de productos</h2>

    <p v-if="cargando">Cargando productos...</p>

    <div v-else-if="error" class="notification is-danger is-light">
      <p>{{ error }}</p>
      <button class="button mt-3" @click="cargarProductos">
        Reintentar
      </button>
    </div>
    
    <p v-else-if="productos.length === 0">
      Todavía no hay productos para mostrar.
    </p>

    <p v-else-if="productosFiltrados.length === 0">
      No se encontraron productos con esa búsqueda.
      </p>

    <productoList
      v-else
      :productos="productosFiltrados"
    />
  </div>
</section>
</template>

<style scoped></style>