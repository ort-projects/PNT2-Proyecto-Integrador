<script setup>
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '../store/auth.js'
import { useCartStore } from '../store/cart.js'

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

function obtenerPrecio(producto) {
  const precio = Number(producto.price ?? producto.precio ?? 0)
  return Number.isFinite(precio) ? precio : 0
}

const totalCarrito = computed(() =>
  productosEnCarrito.value.reduce(
    (total, producto) => total + obtenerPrecio(producto) * producto.cantidad,
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

const enviandoPedido = ref(false)
const errorPedido = ref('')

async function confirmarPedido() {
  errorPedido.value = ''
  enviandoPedido.value = true

  try {
    await cartStore.enviarPedido()
  } catch (err) {
    errorPedido.value =
      err instanceof Error ? err.message : 'No se pudo enviar el pedido.'
  } finally {
    enviandoPedido.value = false
  }
}

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

        <div class="box cart-list">
          <article
            v-for="producto in productosEnCarrito"
            :key="producto.id"
            class="cart-item"
          >
            <img
              class="cart-item-image"
              :src="producto.thumbnail"
              :alt="producto.title"
            />

            <div class="cart-item-info">
              <h2 class="title is-5">{{ producto.title }}</h2>
              <p>{{ producto.category }}</p>
              <p>Precio por unidad: ${{ obtenerPrecio(producto).toFixed(2) }}</p>

              <div class="quantity-control" role="group" aria-label="Cambiar cantidad">
                <button
                  type="button"
                  :aria-label="`Disminuir cantidad de ${producto.title}`"
                  :disabled="producto.cantidad <= 1"
                  @click="cartStore.disminuirCantidad(producto.id)"
                >
                  −
                </button>

                <span aria-live="polite">{{ producto.cantidad }}</span>

                <button
                  type="button"
                  :aria-label="`Aumentar cantidad de ${producto.title}`"
                  @click="cartStore.aumentarCantidad(producto.id)"
                >
                  +
                </button>
              </div>
            </div>

            <div class="cart-item-actions">
              <p class="cart-item-subtotal">
                Subtotal:
                <strong>${{ (obtenerPrecio(producto) * producto.cantidad).toFixed(2) }}</strong>
              </p>

              <button
                type="button"
                class="button is-small is-light remove-cart-item"
                @click="cartStore.quitarProducto(producto.id)"
              >
                Eliminar
              </button>
            </div>
          </article>

          <div class="cart-total">
            <p>
              Total:
              <strong>${{ totalCarrito.toFixed(2) }}</strong>
            </p>

            <RouterLink to="/catalog" class="button is-outlined">
              Seguir comprando
            </RouterLink>

            <p v-if="errorPedido" class="notification is-danger is-light" role="alert">
            {{ errorPedido }}
            </p>

            <button
            type="button"
            class="button is-primary"
            :disabled="enviandoPedido || cartStore.items.length === 0"
              @click="confirmarPedido"
>
            {{ enviandoPedido ? 'Enviando pedido…' : 'Confirmar compra' }}
            </button>
          </div>
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

.cart-list {
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--color-borde);
}

.cart-item {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
}

.cart-item + .cart-item {
  border-top: 1px solid var(--color-borde);
}

.cart-item-image {
  width: 7rem;
  height: 7rem;
  object-fit: contain;
  background: var(--color-superficie);
}

.cart-item-info {
  min-width: 0;
}

.cart-item-info p {
  margin-top: 0.35rem;
  color: var(--color-secundario);
}

.quantity-control {
  display: inline-flex;
  align-items: center;
  margin-top: 0.75rem;
  border: 1px solid var(--color-borde);
  background: var(--color-superficie);
}

.quantity-control button {
  width: 2.5rem;
  height: 2.5rem;
  border: 0;
  background: transparent;
  color: var(--color-texto);
  cursor: pointer;
  font: inherit;
  font-size: 1.25rem;
}

.quantity-control button:hover:not(:disabled) {
  background: var(--color-pistacho);
}

.quantity-control button:disabled {
  color: var(--color-secundario);
  cursor: not-allowed;
  opacity: 0.5;
}

.quantity-control span {
  min-width: 2.5rem;
  text-align: center;
}

.cart-item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.75rem;
}

.cart-item-subtotal {
  margin: 0;
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
}

.cart-item-subtotal strong,
.cart-total strong {
  color: #566c50;
}

.cart-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--color-borde);
  font-size: 1.2rem;
}

.cart-total strong {
  font-size: 1.2em;
  font-weight: 800;
}

@media (max-width: 700px) {
  .cart-item {
    grid-template-columns: 5rem minmax(0, 1fr);
    gap: 0.75rem 1rem;
  }

  .cart-item-image {
    width: 5rem;
    height: 5rem;
  }

  .cart-item-actions {
    grid-column: 2;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  .cart-total {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 420px) {
  .cart-item {
    grid-template-columns: 4rem minmax(0, 1fr);
    padding: 1rem;
  }

  .cart-item-image {
    width: 4rem;
    height: 4rem;
  }

  .cart-item-actions {
    grid-column: 1 / -1;
  }

  .cart-total {
    padding: 1rem;
  }
}
</style>
