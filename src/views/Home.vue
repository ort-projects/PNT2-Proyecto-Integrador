<script setup>

import { ref, computed, onMounted } from "vue"
import { useAuthStore } from "../store/auth.js"

import ProductoCarrusel from "../components/productoCarrusel.vue"

const cargando = ref(false)
const error = ref("")
const productos = ref([])
const authStore = useAuthStore()
const productosDestacados = computed(() => productos.value.slice(0, 5))
const productosOferta = computed(() => productos.value.slice(5, 10))
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

</script>
<template>

 <div class="container">
    <h2 class="title is-3">Productos destacados</h2>

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

  <ProductoCarrusel
    v-else
  :productos="productosDestacados"
  />
  </div>
  <div class="container">
    <h2 class="title is-3">Ofertas del dia </h2>

    <p v-if="cargando">Cargando productos...</p>

    <div v-else-if="error" class="notification is-danger is-light">
      <p>{{ error }}</p>
      <button class="button mt-3" @click="cargarProductos">
        Reintentar
      </button>
    </div>
    
     <p v-else-if="productosOferta.length === 0">
      Todavía no hay productos para mostrar.
    </p>

 <ProductoCarrusel
    v-else
  :productos="productosOferta"
 />
 </div>


</template>

<style scoped></style>
