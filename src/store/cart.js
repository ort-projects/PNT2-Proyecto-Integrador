import { defineStore } from 'pinia'

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
      return this.items.map(({ id, cantidad }) => ({ productId: id, quantity: cantidad }))
    },

    vaciarCarrito() {
      this.items = []
      persistirCarrito(this.items)
    },
  },
})
