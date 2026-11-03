import { defineStore } from 'pinia'

const TOKEN_STORAGE_KEY = 'modarg_admin_jwt'

function readStoredToken() {
  if (typeof localStorage === 'undefined') return ''

  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY) || ''
  } catch {
    return ''
  }
}

function readTokenClaims(token) {
  if (typeof token !== 'string') return null

  try {
    const payloadSegment = token.split('.')[1]
    if (!payloadSegment) return null

    const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    const decodedPayload = atob(paddedBase64)
    const bytes = Uint8Array.from(decodedPayload, (character) => character.charCodeAt(0))
    const payload = JSON.parse(new TextDecoder().decode(bytes))

    return payload && typeof payload === 'object' ? payload : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: readStoredToken(),
    // El carrito lo abre cuando isAuthenticated es false; el modal de login lo escucha.
    loginModalAbierto: false,
  }),

  getters: {
    isAuthenticated: (state) => {
      if (!state.token) return false
      const exp = readTokenClaims(state.token)?.exp
      return typeof exp !== 'number' || exp * 1000 > Date.now()
    },
    isAdmin: (state) => {
      return readTokenClaims(state.token)?.role === 'admin'
    },
    userDisplayName: (state) => {
      const claims = readTokenClaims(state.token)
      const name = typeof claims?.name === 'string' ? claims.name.trim() : ''
      const surname = typeof claims?.surname === 'string' ? claims.surname.trim() : ''
      const fullName = [name, surname].filter(Boolean).join(' ')

      return fullName || claims?.sub || 'Usuario'
    },
  },

  actions: {
    setToken(token) {
      const normalizedToken = typeof token === 'string' ? token.trim() : ''
      this.token = normalizedToken

      if (typeof localStorage === 'undefined') return

      try {
        if (normalizedToken) {
          localStorage.setItem(TOKEN_STORAGE_KEY, normalizedToken)
        } else {
          localStorage.removeItem(TOKEN_STORAGE_KEY)
        }
      } catch {
        // Keep the in-memory session available if browser storage is disabled.
      }
    },

    logout() {
      this.setToken('')
    },

    async login(username, password) {
      const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(
          data.message || data.error?.message || 'No se pudo iniciar sesión.',
        )
      }

      if (typeof data.token !== 'string' || !data.token) {
        throw new Error('El servidor no devolvió un token de acceso válido.')
      }

      this.setToken(data.token)
      return data
    },

    async registerUser({ username, name, surname, password }) {
      const response = await fetch('http://localhost:3000/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, surname, password }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        if (
          response.status === 409 ||
          data.error?.code === 'USERNAME_EN_USO'
        ) {
          throw new Error('Ya existe una cuenta registrada con ese email.')
        }

        throw new Error(
          data.error?.message || data.message || 'No se pudo crear la cuenta.',
        )
      }

      // El contrato documentado devuelve 201 sin token; iniciamos sesión con esas credenciales.
      await this.login(username, password)
      return data
    },

    abrirLoginModal() {
      this.loginModalAbierto = true
    },

    cerrarLoginModal() {
      this.loginModalAbierto = false
    },

    // redirectOn401: false deja que la vista maneje el 401 (por ejemplo, abriendo el modal de login).
    fetchWithAuth(input, { redirectOn401 = true, ...fetchOptions } = {}) {
      const headers = new Headers(fetchOptions.headers)

      if (this.token) {
        headers.set('Authorization', `Bearer ${this.token}`)
      }

      return fetch(input, { ...fetchOptions, headers }).then((response) => {
        if (response.status === 401) {
          this.logout()

          if (
            redirectOn401 &&
            typeof window !== 'undefined' &&
            window.location.pathname !== '/login'
          ) {
            const returnUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`
            const loginUrl = new URL('/login', window.location.origin)
            loginUrl.searchParams.set('redirect', returnUrl)
            window.location.assign(loginUrl)
          }
        }

        return response
      })
    },
  },


})
