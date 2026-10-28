import { defineStore } from 'pinia'
import { useAuthStore } from './auth.js'

const STORAGE_KEY = 'carrito'

function cargarCarrito() {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY)
    const carrito = guardado ? JSON.parse(guardado) : []

    return Array.isArray(carrito)
      ? carrito.filter((item) => item && item.id != null && Number.isInteger(item.cantidad) && item.cantidad > 0)
      : []
  } catch {
    return []
  }
}

function persistirCarrito(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // El estado del carrito sigue disponible en Pinia durante esta sesión.
  }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: cargarCarrito(),
  }),
  actions: {
    agregarProducto(id, cantidad = 1) {
      if (id == null || !Number.isInteger(cantidad) || cantidad < 1) return

      const existente = this.items.find((item) => String(item.id) === String(id))

      if (existente) {
        existente.cantidad += cantidad
      } else {
        this.items.push({ id, cantidad })
      }

      persistirCarrito(this.items)
    },
    aumentarCantidad(id) {
      const producto = this.items.find((item) => String(item.id) === String(id))
      if (!producto) return

      producto.cantidad += 1
      persistirCarrito(this.items)
    },
    disminuirCantidad(id) {
      const producto = this.items.find((item) => String(item.id) === String(id))
      if (!producto || producto.cantidad <= 1) return

      producto.cantidad -= 1
      persistirCarrito(this.items)
    },
    quitarProducto(id) {
      this.items = this.items.filter((item) => String(item.id) !== String(id))
      persistirCarrito(this.items)
    },

    obtenerItems() {
    return this.items.map(({ id, cantidad }) => ({ id, cantidad }))
    },

    async enviarPedido() {
    const items = this.obtenerItems().map(({ id, cantidad }) => ({
    productoId: id,
    cantidad,
    }))

    if (items.length === 0) {
    throw new Error('El carrito está vacío.')
    }

    const authStore = useAuthStore()

    const response = await authStore.fetchWithAuth(
      'http://localhost:3000/pedidos',
      {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
      },
    )

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(
        data.message || data.error?.message || 'No se pudo registrar el pedido.',
     )
  }

  // Se vacía solamente después de que el backend confirmó el pedido.
    this.vaciarCarrito()

    return data
  },

  vaciarCarrito() {
    this.items = []
    persistirCarrito(this.items)
  },
  },
})
