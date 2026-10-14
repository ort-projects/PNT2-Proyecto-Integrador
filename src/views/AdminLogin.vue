<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth.js'

const username = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

async function submitLogin() {
  error.value = ''
  cargando.value = true

  try {
    const response = await authStore.fetchWithAuth('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.value, password: password.value }),
    })

    let data = {}
    try {
      data = await response.json()
    } catch {
      // The response body is optional when the server returns an error.
    }

    if (!response.ok) {
      throw new Error(data.error?.message || 'No se pudo iniciar sesión.')
    }

    if (typeof data.token !== 'string' || !data.token) {
      throw new Error('El servidor no devolvió un token de acceso válido.')
    }

    authStore.setToken(data.token)

    const destination = route.query.redirect
    const safeDestination =
      typeof destination === 'string' && destination.startsWith('/') && !destination.startsWith('//')
        ? destination
        : '/admin'

    await router.replace(safeDestination)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'No se pudo iniciar sesión.'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <section class="section admin-login-section">
    <div class="container">
      <div class="box admin-login-card">
        <h1 class="title is-3">Ingresar</h1>

        <form @submit.prevent="submitLogin">
          <div class="field">
            <label class="label" for="admin-email">Correo electrónico</label>
            <div class="control">
              <input
                id="admin-email"
                v-model="username"
                class="input"
                type="email"
                autocomplete="username"
                placeholder="admin@modarg.com"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label" for="admin-password">Contraseña</label>
            <div class="control">
              <input
                id="admin-password"
                v-model="password"
                class="input"
                type="password"
                autocomplete="current-password"
                placeholder="Tu contraseña"
                required
              />
            </div>
          </div>

          <p v-if="error" class="notification is-danger is-light" role="alert">
            {{ error }}
          </p>

          <button class="button is-primary is-fullwidth" type="submit" :disabled="cargando">
            {{ cargando ? 'Ingresando…' : 'Ingresar' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.admin-login-section {
  display: grid;
  min-height: calc(100vh - 4.5rem);
  align-items: center;
}

.admin-login-card {
  width: min(100%, 30rem);
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid var(--color-borde);
}

.eyebrow {
  margin-bottom: 0.5rem;
  color: var(--color-secundario);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.admin-login-intro {
  margin-bottom: 1.5rem;
  color: var(--color-secundario);
}

@media (max-width: 480px) {
  .admin-login-card {
    padding: 1.5rem;
  }
}
</style>
