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
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
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

    fetchWithAuth(input, options = {}) {
      const headers = new Headers(options.headers)

      if (this.token) {
        headers.set('Authorization', `Bearer ${this.token}`)
      }

      return fetch(input, { ...options, headers }).then((response) => {
        if (response.status === 401) {
          this.logout()

          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
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
