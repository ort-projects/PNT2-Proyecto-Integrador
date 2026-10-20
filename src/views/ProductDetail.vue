<script setup>
import { ref, onMounted } from "vue"
import { useRoute } from "vue-router"
import { useAuthStore } from "../store/auth.js"
import { useCartStore } from "../store/cart.js"

const route = useRoute()
const authStore = useAuthStore()
const cartStore = useCartStore()
const product = ref(null)
const cargando = ref(false)
const error = ref("")
const cantidadSeleccionada = ref(1)
const agregadoAlCarrito = ref(false)

function agregarAlCarrito() {
  cartStore.agregarProducto(product.value.id, cantidadSeleccionada.value)
  agregadoAlCarrito.value = true
}

function cambiarCantidad(incremento) {
  cantidadSeleccionada.value = Math.max(1, cantidadSeleccionada.value + incremento)
  agregadoAlCarrito.value = false
}

async function cargarProducto() {
  cargando.value = true
  error.value = ""

  try {
    const URL = `http://localhost:3000/productos/${route.params.id}`
    const response = await authStore.fetchWithAuth(URL)

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

          <div class="purchase-controls">
            <label class="quantity-label" for="product-quantity">Cantidad</label>
            <div class="quantity-counter" aria-label="Seleccionar cantidad">
              <button
                type="button"
                class="quantity-button"
                aria-label="Quitar una unidad"
                :disabled="cantidadSeleccionada <= 1"
                @click="cambiarCantidad(-1)"
              >
                −
              </button>
              <output id="product-quantity" class="quantity-value" aria-live="polite">
                {{ cantidadSeleccionada }}
              </output>
              <button
                type="button"
                class="quantity-button"
                aria-label="Agregar una unidad a la cantidad"
                @click="cambiarCantidad(1)"
              >
                +
              </button>
            </div>

            <button
              type="button"
              class="button is-primary is-medium add-to-cart"
              aria-label="Agregar al carrito"
              title="Agregar al carrito"
              @click="agregarAlCarrito"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" class="add-to-cart-icon">
                <path d="M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 1.9-1.5L22 8H6" />
                <circle cx="10" cy="20" r="1" />
                <circle cx="18" cy="20" r="1" />
              </svg>
            </button>
          </div>
          <p v-if="agregadoAlCarrito" class="help is-success" role="status">
            {{ cantidadSeleccionada }}
            {{ cantidadSeleccionada === 1 ? "unidad agregada" : "unidades agregadas" }}
            al carrito.
          </p>
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

.purchase-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
}

.quantity-label {
  font-weight: 600;
}

.quantity-counter {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  border: 1px solid var(--color-borde);
  background: var(--color-superficie);
}

.quantity-button {
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  background: transparent;
  color: var(--color-texto);
  cursor: pointer;
  font: inherit;
  font-size: 1.25rem;
}

.quantity-button:hover:not(:disabled) {
  background: var(--color-pistacho);
}

.quantity-button:disabled {
  color: var(--color-secundario);
  cursor: not-allowed;
  opacity: 0.5;
}

.quantity-value {
  min-width: 2.5rem;
  text-align: center;
}

.add-to-cart {
  flex: 0 0 3.5rem;
  min-height: 3.5rem;
  padding: 0;
}

.add-to-cart-icon {
  width: 1.5rem;
  height: 1.5rem;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.7;
}

@media screen and (max-width: 768px) {
  .column.is-offset-1 {
    margin-left: 0;
  }
}
</style>
