<script setup>
import { ref, computed, onMounted } from "vue"
import { useAuthStore } from "../store/auth.js"
import { useCatalogStore } from "../store/catalog.js"

import productoList from "../components/productoList.vue"

const cargando = ref(false)
const error = ref("")
const productos = ref([])
const authStore = useAuthStore()
const catalogStore = useCatalogStore()
const URL = "http://localhost:3000/productos"

async function cargarProductos() {
  cargando.value = true
  error.value = ""

  try {
    const response = await authStore.fetchWithAuth(URL)
    if (!response.ok) {
      throw new Error("No se pudieron cargar los productos.")
    }
    const data = await response.json() 
    productos.value = data

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
      producto.title.toLowerCase().includes(catalogStore.busqueda.toLowerCase()) ||
      producto.category.toLowerCase().includes(catalogStore.busqueda.toLowerCase())
    )
  })
})

</script>


<template>  
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

</template>