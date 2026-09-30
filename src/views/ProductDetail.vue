<script setup>
import { ref, computed } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const URL = `https://dummyjson.com/product/${route.params.id}`
const product = ref({})
const cargando = ref(false)
const error = ref("")
const quantity = ref(1)

async function productDetail() {
  cargando.value = true
  error.value = ""

  try {
    const response = await fetch(URL)
    if (!response.ok) {
      throw new Error("No se pudieron cargar los productos.")
    }
    const data = await response.json()
    product.value = data
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}

productDetail();

</script>

<template>
  <section class="section">
    <div class="container">
      <!-- Estado de Carga -->
      <div v-if="cargando" class="has-text-centered my-6">
        <button class="button is-loading is-large is-ghost">Cargando...</button>
      </div>

      <!-- Estado de Error o No Encontrado -->
      <div v-else-if="!product" class="notification is-danger is-light has-text-centered">
        <p class="title is-5">¡Ups! El producto no se encuentra disponible.</p>
        <router-link to="/" class="button is-danger is-outlined mt-3">Volver a la tienda</router-link>
      </div>

      <!-- Contenido del Producto -->
      <div v-else class="columns is-vcentered">
        <!-- Columna de Imágenes -->
        <div class="column is-6">
          <div class="box p-0 overflow-hidden">
            <figure class="image is-4by3">
              <img :src="product.thumbnail" :alt="product.title" />
            </figure>
          </div>
        </div>

        <!-- Columna de Información -->
        <div class="column is-5 is-offset-1">
          <nav class="breadcrumb is-small" aria-label="breadcrumbs">
            <ul>
              <li><router-link to="/">Inicio</router-link></li>
              <li>Productos</li>
              <li class="is-active"><a href="#" aria-current="page">{{ product.category || 'Categoría' }}</a></li>
            </ul>
          </nav>

          <h1 class="title is-2 mb-2">{{ product.name }}</h1>
          <p class="subtitle is-4 has-text-primary has-text-weight-bold mb-4">
            ${{ product.price }}
          </p>

          <div class="content mb-5">
            <p>{{ product.description }}</p>
          </div>

          <hr />

          <!-- Opciones de Compra -->
          <div class="field is-horizontal align-items-center mb-5">
            <div class="field-label is-normal mr-3">
              <label class="label">Cantidad:</label>
            </div>
            <div class="field-body">
              <div class="field">
                <div class="control">
                  <div class="select">
                    <select v-model="quantity">
                      <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="buttons">
            <button @click="addToCart" class="button is-primary is-medium is-fullwidth">
              <strong>Añadir al carrito</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.overflow-hidden {
  overflow: hidden;
  border-radius: 6px;
}
.align-items-center {
  align-items: center;
}
</style>