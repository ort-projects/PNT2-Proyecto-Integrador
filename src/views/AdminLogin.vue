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
    const response = await authStore.fetchWithAuth(
      'http://localhost:3000/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.value,
          password: password.value,
        }),
      },
    )

    let data = {}

    try {
      data = await response.json()
    } catch {
      // La respuesta puede no incluir un cuerpo en caso de error.
    }

    if (!response.ok) {
      throw new Error(data.error?.message || 'No se pudo iniciar sesión.')
    }

    if (typeof data.token !== 'string' || !data.token) {
      throw new Error('El servidor no devolvió un token de acceso válido.')
    }

    authStore.setToken(data.token)

    const destination = route.query.redirect
    const isSafeDestination =
      typeof destination === 'string' &&
      destination.startsWith('/') &&
      !destination.startsWith('//')

    const isAdminDestination =
      typeof destination === 'string' &&
      (destination === '/admin' || destination.startsWith('/admin/'))

    const defaultDestination = authStore.isAdmin ? '/admin' : '/'

    const safeDestination =
      isSafeDestination && (authStore.isAdmin || !isAdminDestination)
        ? destination
        : defaultDestination

    await router.replace(safeDestination)
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : 'No se pudo iniciar sesión.'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <section class="section login-section">
    <div class="container">
      <div class="box login-card">
        <h1 class="title is-3">Ingresar</h1>

        <form @submit.prevent="submitLogin">
          <div class="field">
            <label class="label" for="login-email">
              Correo electrónico
            </label>

            <div class="control">
              <input
                id="login-email"
                v-model="username"
                class="input"
                type="email"
                autocomplete="username"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label" for="login-password">
              Contraseña
            </label>

            <div class="control">
              <input
                id="login-password"
                v-model="password"
                class="input"
                type="password"
                autocomplete="current-password"
                placeholder="Tu contraseña"
                required
              />
            </div>
          </div>

          <p
            v-if="error"
            class="notification is-danger is-light"
            role="alert"
          >
            {{ error }}
          </p>

          <button
            class="button is-primary is-fullwidth"
            type="submit"
            :disabled="cargando"
          >
            {{ cargando ? 'Ingresando…' : 'Ingresar' }}
          </button>
        </form>
      </div>
    </div>
  </section>
</template>

<style scoped>
.login-section {
  display: grid;
  min-height: calc(100vh - 4.5rem);
  align-items: center;
}

.login-card {
  width: min(100%, 30rem);
  margin: 0 auto;
  padding: 2rem;
  border: 1px solid var(--color-borde);
}

@media (max-width: 480px) {
  .login-card {
    padding: 1.5rem;
  }
}
</style>
