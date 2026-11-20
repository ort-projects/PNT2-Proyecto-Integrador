import { defineStore } from 'pinia'
import { useAuthStore } from './auth.js'

const API_URL = 'http://localhost:3000'
const STORAGE_KEY = 'carrito'
const IMPORT_STORAGE_KEY = 'carrito-import-pendiente'
const saveTasks = new WeakMap()

function leerStorage(key) {
  if (typeof localStorage === 'undefined') return null

  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function guardarStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Pinia conserva el estado durante la sesión si el almacenamiento no está disponible.
  }
}

function borrarStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // El estado en memoria sigue siendo válido.
  }
}

function normalizarItems(items) {
  return Array.isArray(items)
    ? items
      .filter((item) => item && item.id != null && Number.isInteger(item.cantidad) && item.cantidad > 0)
      .map(({ id, cantidad }) => ({ id, cantidad }))
    : []
}

function cargarCarrito() {
  try {
    return normalizarItems(JSON.parse(leerStorage(STORAGE_KEY) || '[]'))
  } catch {
    return []
  }
}

function guardarCarrito(items) {
  guardarStorage(STORAGE_KEY, items)
}

function leerImportPendiente() {
  try {
    const pending = JSON.parse(leerStorage(IMPORT_STORAGE_KEY) || 'null')
    return pending && typeof pending.userKey === 'string' && typeof pending.importId === 'string'
      ? { ...pending, items: normalizarItems(pending.items) }
      : null
  } catch {
    return null
  }
}

function crearImportId() {
  return typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function desdeApi(items) {
  return normalizarItems(items?.map(({ productId, quantity }) => ({ id: productId, cantidad: quantity })))
}

function haciaApi(items) {
  return items.map(({ id, cantidad }) => ({ productId: Number(id), quantity: cantidad }))
}

function copiarItems(items) {
  return items.map(({ id, cantidad }) => ({ id, cantidad }))
}

function itemsIguales(first, second) {
  const ordenar = (items) => copiarItems(items).sort((a, b) => String(a.id).localeCompare(String(b.id)))
  return JSON.stringify(ordenar(first)) === JSON.stringify(ordenar(second))
}

function aplicarDiferencias(baseItems, previousGuestItems, currentGuestItems) {
  const quantities = new Map(baseItems.map(({ id, cantidad }) => [String(id), { id, cantidad }]))
  const previous = new Map(previousGuestItems.map(({ id, cantidad }) => [String(id), cantidad]))
  const current = new Map(currentGuestItems.map(({ id, cantidad }) => [String(id), cantidad]))
  const ids = new Set([...previous.keys(), ...current.keys()])

  for (const id of ids) {
    const delta = (current.get(id) || 0) - (previous.get(id) || 0)
    if (delta === 0) continue

    const entry = quantities.get(id)
    const quantity = Math.max(0, (entry?.cantidad || 0) + delta)
    if (quantity === 0) {
      quantities.delete(id)
    } else {
      quantities.set(id, { id: entry?.id ?? currentGuestItems.find((item) => String(item.id) === id).id, cantidad: quantity })
    }
  }

  return [...quantities.values()]
}

function aplicarOperacion(items, operation) {
  const result = copiarItems(items)
  if (operation.type === 'clear') return []
  const index = result.findIndex((item) => String(item.id) === String(operation.id))

  if (operation.type === 'add') {
    if (index === -1) result.push({ id: operation.id, cantidad: operation.quantity })
    else result[index].cantidad += operation.quantity
  }

  if (operation.type === 'remove-one' && index !== -1) {
    if (result[index].cantidad <= 1) result.splice(index, 1)
    else result[index].cantidad -= 1
  }

  if (operation.type === 'remove' && index !== -1) result.splice(index, 1)
  return result
}

async function solicitarCarrito(authStore) {
  const response = await authStore.fetchWithAuth(`${API_URL}/carrito`)
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw Object.assign(new Error(data.error?.message || 'No se pudo cargar el carrito.'), { status: response.status })
  return { version: data.version, items: desdeApi(data.items) }
}

async function guardarCarritoCuenta(authStore, version, items) {
  const response = await authStore.fetchWithAuth(`${API_URL}/carrito`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ version, items: haciaApi(items) }),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw Object.assign(new Error(data.error?.message || 'No se pudo guardar el carrito.'), {
      status: response.status,
      details: data.error?.details,
    })
  }
  return { version: data.version, items: desdeApi(data.items) }
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: cargarCarrito(),
    version: null,
    accountKey: '',
    ready: true,
    syncError: '',
    serverItems: [],
    pendingOperations: [],
    saving: false,
    sessionGeneration: 0,
  }),

  actions: {
    async sincronizarSesion(userKey, authStore = useAuthStore()) {
      const generation = this.sessionGeneration + 1
      this.sessionGeneration = generation
      this.syncError = ''
      this.pendingOperations = []

      if (!userKey) {
        this.accountKey = ''
        this.version = null
        this.serverItems = []
        this.ready = true
        this.items = cargarCarrito()
        return
      }

      this.accountKey = userKey
      this.ready = false
      this.items = cargarCarrito()
      const guestAtStart = copiarItems(this.items)
      let pending = leerImportPendiente()

      if (!pending || pending.userKey !== userKey) {
        pending = guestAtStart.length
          ? { userKey, importId: crearImportId(), items: guestAtStart }
          : null
        if (pending) guardarStorage(IMPORT_STORAGE_KEY, pending)
      }

      try {
        let accountCart = await solicitarCarrito(authStore)
        if (generation !== this.sessionGeneration || this.accountKey !== userKey) return

        let appliedGuestItems = []
        if (pending?.items.length) {
          const response = await authStore.fetchWithAuth(`${API_URL}/carrito/importar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ importId: pending.importId, items: haciaApi(pending.items) }),
          })
          const data = await response.json().catch(() => ({}))

          if (!response.ok && response.status === 404 && Array.isArray(data.error?.details)) {
            const missingIds = new Set(data.error.details.map(String))
            pending.items = pending.items.filter((item) => !missingIds.has(String(item.id)))
            this.items = this.items.filter((item) => !missingIds.has(String(item.id)))
            guardarCarrito(this.items)
            if (pending.items.length) guardarStorage(IMPORT_STORAGE_KEY, pending)
            else {
              borrarStorage(IMPORT_STORAGE_KEY)
              pending = null
            }
          } else if (!response.ok) {
            throw Object.assign(new Error(data.error?.message || 'No se pudo importar el carrito.'), { status: response.status })
          } else {
            accountCart = { version: data.version, items: desdeApi(data.items) }
            appliedGuestItems = copiarItems(pending.items)
          }
        }

        if (generation !== this.sessionGeneration || this.accountKey !== userKey) return

        let appliedCart = accountCart
        let appliedGuestState = appliedGuestItems
        while (true) {
          const guestNow = copiarItems(this.items)
          const desired = aplicarDiferencias(appliedCart.items, appliedGuestState, guestNow)

          if (!itemsIguales(desired, appliedCart.items)) {
            let version = appliedCart.version
            let result
            for (let attempt = 0; attempt < 4; attempt += 1) {
              try {
                result = await guardarCarritoCuenta(authStore, version, desired)
                break
              } catch (error) {
                if (error.status !== 409 || attempt === 3) throw error
                const latest = await solicitarCarrito(authStore)
                if (itemsIguales(latest.items, desired)) {
                  result = latest
                  break
                }
                appliedCart = latest
                version = latest.version
                const currentGuest = copiarItems(this.items)
                desired.splice(0, desired.length, ...aplicarDiferencias(latest.items, appliedGuestState, currentGuest))
              }
            }
            appliedCart = result
          }

          if (itemsIguales(guestNow, this.items)) {
            appliedGuestState = guestNow
            break
          }
          appliedGuestState = guestNow
        }

        if (generation !== this.sessionGeneration || this.accountKey !== userKey) return
        this.serverItems = copiarItems(appliedCart.items)
        this.items = copiarItems(appliedCart.items)
        this.version = appliedCart.version
        this.ready = true
        this.syncError = ''
        guardarCarrito([])
        borrarStorage(IMPORT_STORAGE_KEY)
        void this.guardarPendientes(authStore)
      } catch (error) {
        if (generation !== this.sessionGeneration || this.accountKey !== userKey) return
        this.syncError = error instanceof Error ? error.message : 'No se pudo sincronizar el carrito.'
        this.ready = false
      }
    },

    reintentarSincronizacion() {
      const authStore = useAuthStore()
      if (!authStore.isAuthenticated) return
      if (this.ready) return this.guardarPendientes(authStore)
      return this.sincronizarSesion(authStore.userKey, authStore)
    },

    cambiarCarrito(operation) {
      this.items = aplicarOperacion(this.items, operation)

      if (!this.accountKey || !this.ready) {
        guardarCarrito(this.items)
        return
      }

      this.pendingOperations.push(operation)
      void this.guardarPendientes(useAuthStore())
    },

    guardarPendientes(authStore = useAuthStore()) {
      const currentTask = saveTasks.get(this)
      if (currentTask) return currentTask
      if (!this.ready || !this.accountKey) return Promise.resolve()

      const generation = this.sessionGeneration
      this.saving = true
      const task = (async () => {
        try {
          while (this.pendingOperations.length && generation === this.sessionGeneration) {
            const operation = this.pendingOperations[0]
            let desired = aplicarOperacion(this.serverItems, operation)
            let saved

            for (let attempt = 0; attempt < 4; attempt += 1) {
              try {
                saved = await guardarCarritoCuenta(authStore, this.version, desired)
                break
              } catch (error) {
                if (error.status !== 409 || attempt === 3) throw error
                const latest = await solicitarCarrito(authStore)
                if (itemsIguales(latest.items, desired)) {
                  saved = latest
                  break
                }
                desired = aplicarOperacion(latest.items, operation)
                this.version = latest.version
                this.serverItems = latest.items
              }
            }

            if (generation !== this.sessionGeneration) return
            this.version = saved.version
            this.serverItems = copiarItems(saved.items)
            this.pendingOperations.shift()
            this.items = this.pendingOperations.reduce(aplicarOperacion, copiarItems(this.serverItems))
            this.syncError = ''
          }
        } catch (error) {
          if (generation === this.sessionGeneration) {
            this.syncError = error instanceof Error ? error.message : 'No se pudo guardar el carrito.'
          }
        } finally {
          this.saving = false
          saveTasks.delete(this)
          if (generation !== this.sessionGeneration && this.ready && this.pendingOperations.length) {
            void this.guardarPendientes(useAuthStore())
          }
        }
      })()
      saveTasks.set(this, task)
      return task
    },

    agregarProducto(id, cantidad = 1) {
      if (id == null || !Number.isInteger(cantidad) || cantidad < 1) return
      this.cambiarCarrito({ type: 'add', id, quantity: cantidad })
    },

    aumentarCantidad(id) {
      if (!this.items.some((item) => String(item.id) === String(id))) return
      this.cambiarCarrito({ type: 'add', id, quantity: 1 })
    },

    disminuirCantidad(id) {
      const item = this.items.find((entry) => String(entry.id) === String(id))
      if (!item || item.cantidad <= 1) return
      this.cambiarCarrito({ type: 'remove-one', id })
    },

    quitarProducto(id) {
      this.cambiarCarrito({ type: 'remove', id })
    },

    obtenerItems() {
      return haciaApi(this.items)
    },

    vaciarCarrito({ servidorYaVacio = false } = {}) {
      this.items = []
      guardarCarrito([])
      if (servidorYaVacio) {
        this.serverItems = []
        this.pendingOperations = []
        this.version = Number.isInteger(this.version) ? this.version + 1 : null
        return
      }

      if (this.accountKey && this.ready) {
        this.pendingOperations.push({ type: 'clear' })
        void this.guardarPendientes(useAuthStore())
      }
    },
  },
})
