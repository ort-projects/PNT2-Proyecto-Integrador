<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const product = ref(null)
const cargando = ref(false)
const error = ref("")

async function cargarProducto() {
  cargando.value = true
  error.value = ""

  try {
    const URL = `https://dummyjson.com/products/${route.params.id}`
    const response = await fetch(URL)

    if (!response.ok) {
      throw new Error("No se pudo cargar el producto.")
    }

    const data = await response.json()

    product.value = {
      id: data.id,
      nombre: data.title,
      precio: data.price,
      categoria: data.category,
      imagen: data.thumbnail,
      descripcion: data.description,
    }
  } catch (err) {
    error.value = err.message
  } finally {
    cargando.value = false
  }
}

onMounted(cargarProducto)
</script>


<template>
  <section class="section">
    <div class="container">
      <div v-if="cargando" class="has-text-centered my-6">
        <button class="button is-loading is-large is-ghost">
          Cargando...
        </button>
      </div>

      <div
        v-else-if="error"
        class="notification is-danger is-light has-text-centered"
      >
        <p class="title is-5">{{ error }}</p>
        <RouterLink to="/" class="button is-danger is-outlined mt-3">
          Volver a la tienda
        </RouterLink>
      </div>

      <div v-else-if="!product" class="notification is-warning is-light">
        El producto no está disponible.
        <RouterLink to="/" class="button mt-3">
          Volver a la tienda
        </RouterLink>
      </div>

      <div v-else class="columns is-vcentered">
        <div class="column is-6">
          <div class="box p-0 overflow-hidden">
            <figure class="image is-4by3">
              <img :src="product.imagen" :alt="product.nombre" />
            </figure>
          </div>
        </div>

        <div class="column is-5 is-offset-1">
          <nav class="breadcrumb is-small" aria-label="breadcrumbs">
            <ul>
              <li><RouterLink to="/">Inicio</RouterLink></li>
              <li>Productos</li>
              <li class="is-active">
                <span aria-current="page">{{ product.categoria }}</span>
              </li>
            </ul>
          </nav>

          <h1 class="title is-2 mb-2">{{ product.nombre }}</h1>

          <p class="subtitle is-4 has-text-primary has-text-weight-bold mb-4">
            ${{ product.precio }}
          </p>

          <div class="content">
            <p>{{ product.descripcion }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.overflow-hidden {
  overflow: hidden;
  border-radius: 8px;
}

.image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media screen and (max-width: 768px) {
  .column.is-offset-1 {
    margin-left: 0;
  }
}
</style>