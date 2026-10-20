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
  },
})
