<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../store/auth.js'
import { useCartStore } from '../store/cart.js'
import ContadorCantidad from '../components/ContadorCantidad.vue'

const authStore = useAuthStore()
const cartStore = useCartStore()

const productos = ref([])
const cargando = ref(false)
const error = ref('')

const productosEnCarrito = computed(() =>
  productos.value.flatMap((producto) => {
    const item = cartStore.items.find(
      (item) => String(item.id) === String(producto.id),
    )

    return item ? [{ ...producto, cantidad: item.cantidad }] : []
  }),
)

const cantidadTotal = computed(() =>
  productosEnCarrito.value.reduce((total, producto) => total + producto.cantidad, 0),
)

const totalCarrito = computed(() =>
  productosEnCarrito.value.reduce(
    (total, producto) => total + Number(producto.price) * producto.cantidad,
    0,
  ),
)

async function cargarProductosDelCarrito() {
  if (cartStore.items.length === 0) {
    productos.value = []
    return
  }

  cargando.value = true
  error.value = ''

  try {
    productos.value = await Promise.all(
      cartStore.items.map(async (item) => {
        const response = await authStore.fetchWithAuth(
          `http://localhost:3000/productos/${item.id}`,
        )

        if (!response.ok) {
          throw new Error(`No se pudo cargar el producto ${item.id}.`)
        }

        const producto = await response.json()

        return {
          ...producto,
          cantidad: item.cantidad,
        }
      }),
    )
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'No se pudieron cargar los productos del carrito.'
  } finally {
    cargando.value = false
  }
}

onMounted(cargarProductosDelCarrito)
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-2">Mi carrito</h1>

      <div v-if="cartStore.items.length === 0" class="notification">
        <p>Tu carrito está vacío.</p>

        <RouterLink to="/catalog" class="button is-primary mt-4">
          Ver productos
        </RouterLink>
      </div>

      <p v-else-if="cargando">Cargando los productos del carrito...</p>

      <div v-else-if="error" class="notification is-danger is-light">
        <p>{{ error }}</p>

        <button
          class="button mt-3"
          type="button"
          @click="cargarProductosDelCarrito"
        >
          Reintentar
        </button>
      </div>

      <div v-else>
        <p class="cart-count-text">
          {{ cantidadTotal }}
          {{ cantidadTotal === 1 ? 'producto' : 'productos' }}
        </p>

        <article
          v-for="producto in productosEnCarrito"
          :key="producto.id"
          class="box cart-item"
        >

          <img
            class="cart-item-image"
            :src="producto.thumbnail"
            :alt="producto.title"
          />

          <div class="cart-item-info">
            <h2 class="title is-5">{{ producto.title }}</h2>
            <p>{{ producto.category }}</p>
            <ContadorCantidad
              :producto-id="producto.id"
              :id-cantidad="`cantidad-${producto.id}`"
            />
            <p>Precio por unidad: ${{ Number(producto.price).toFixed(2) }}</p>
          </div>

          <p class="cart-item-subtotal">
            Subtotal:
            ${{ (Number(producto.price) * producto.cantidad).toFixed(2) }}
          </p>
        </article>

        <div class="cart-total">
          <p>
            Total:
            <strong>${{ totalCarrito.toFixed(2) }}</strong>
          </p>

          <RouterLink to="/catalog" class="button is-outlined">
            Seguir comprando
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cart-count-text {
  margin-bottom: 1rem;
  color: var(--color-secundario);
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  border: 1px solid var(--color-borde);
}

.cart-item-image {
  width: 7rem;
  height: 7rem;
  object-fit: contain;
  background: var(--color-superficie);
}

.cart-item-info {
  flex: 1;
}

.cart-item-info p {
  margin-top: 0.35rem;
  color: var(--color-secundario);
}

.cart-item-subtotal {
  font-weight: 700;
}

.cart-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
  font-size: 1.2rem;
}

@media (max-width: 600px) {
  .cart-item {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .cart-item-image {
    width: 5rem;
    height: 5rem;
  }

  .cart-item-subtotal {
    width: 100%;
  }

  .cart-total {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
