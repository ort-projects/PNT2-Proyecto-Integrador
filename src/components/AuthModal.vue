<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../store/auth.js'

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
  // Texto opcional según desde dónde se abrió (carrito, panel, sesión vencida).
  mensaje: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'authenticated'])

const authStore = useAuthStore()
const modo = ref('login')
const email = ref('')
const nombre = ref('')
const apellido = ref('')
const password = ref('')
const error = ref('')
const cargando = ref(false)

watch(
  () => props.open,
  (open) => {
    if (open) {
      modo.value = 'login'
      error.value = ''
    }
  },
)

function cambiarModo(nuevoModo) {
  modo.value = nuevoModo
  error.value = ''
}

async function enviarFormulario() {
  error.value = ''

  if (modo.value === 'registro' && (!nombre.value.trim() || !apellido.value.trim())) {
    error.value = 'Completá tu nombre y apellido.'
    return
  }

  cargando.value = true

  try {
    const username = email.value.trim()

    if (modo.value === 'registro') {
      await authStore.registerUser({
        username,
        name: nombre.value.trim(),
        surname: apellido.value.trim(),
        password: password.value,
      })
    } else {
      await authStore.login(username, password.value)
    }

    emit('authenticated')
  } catch (err) {
    error.value =
      err instanceof Error
        ? err.message
        : modo.value === 'registro'
          ? 'No se pudo crear la cuenta.'
          : 'No se pudo iniciar sesión.'
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div
    v-if="open"
    class="modal is-active auth-modal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="auth-modal-title"
  >
    <button
      class="modal-background"
      type="button"
      aria-label="Cerrar inicio de sesión"
      @click="emit('close')"
    ></button>

    <div class="modal-card">
      <header class="modal-card-head">
        <h2 id="auth-modal-title" class="modal-card-title">
          {{ modo === 'login' ? 'Iniciar sesión' : 'Crear usuario' }}
        </h2>
        <button
          class="delete"
          type="button"
          aria-label="Cerrar"
          @click="emit('close')"
        ></button>
      </header>

      <section class="modal-card-body">
        <p class="auth-modal-intro">
          {{ mensaje || (modo === 'login'
            ? 'Ingresá con tu correo y contraseña.'
            : 'Completá tus datos para crear tu cuenta.') }}
        </p>

        <div class="tabs is-toggle is-fullwidth auth-tabs">
          <ul>
            <li :class="{ 'is-active': modo === 'login' }">
              <button type="button" @click="cambiarModo('login')">
                Iniciar sesión
              </button>
            </li>
            <li :class="{ 'is-active': modo === 'registro' }">
              <button type="button" @click="cambiarModo('registro')">
                Crear usuario
              </button>
            </li>
          </ul>
        </div>

        <form @submit.prevent="enviarFormulario">
          <div v-if="modo === 'registro'" class="columns is-variable is-2">
            <div class="column">
              <div class="field">
                <label class="label" for="auth-register-name">Nombre</label>
                <div class="control">
                  <input
                    id="auth-register-name"
                    v-model="nombre"
                    class="input"
                    type="text"
                    autocomplete="given-name"
                    required
                  />
                </div>
              </div>
            </div>

            <div class="column">
              <div class="field">
                <label class="label" for="auth-register-surname">Apellido</label>
                <div class="control">
                  <input
                    id="auth-register-surname"
                    v-model="apellido"
                    class="input"
                    type="text"
                    autocomplete="family-name"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label" for="auth-login-email">Correo electrónico</label>
            <div class="control">
              <input
                id="auth-login-email"
                v-model="email"
                class="input"
                type="email"
                autocomplete="username"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div class="field">
            <label class="label" for="auth-login-password">Contraseña</label>
            <div class="control">
              <input
                id="auth-login-password"
                v-model="password"
                class="input"
                type="password"
                :autocomplete="modo === 'registro' ? 'new-password' : 'current-password'"
                :minlength="modo === 'registro' ? 8 : undefined"
                required
              />
            </div>
          </div>

          <p v-if="error" class="notification is-danger is-light" role="alert">
            {{ error }}
          </p>

          <button
            class="button is-primary is-fullwidth"
            type="submit"
            :disabled="cargando"
          >
            {{ cargando
              ? (modo === 'login' ? 'Ingresando…' : 'Creando cuenta…')
              : (modo === 'login' ? 'Ingresar' : 'Crear cuenta') }}
          </button>
        </form>
      </section>
    </div>
  </div>
</template>

<style scoped>
.auth-modal {
  z-index: 30;
}

.modal-card {
  width: min(32rem, calc(100vw - 2rem));
}

.modal-card-head {
  background: var(--color-superficie);
}

.modal-card-title {
  color: var(--color-texto);
  font-weight: 700;
}

.modal-card-body {
  background: var(--color-superficie);
}

.auth-modal-intro {
  margin-bottom: 1.25rem;
  color: var(--color-secundario);
}

.auth-tabs {
  margin-bottom: 1.25rem;
}

.auth-tabs button {
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0.5em 1em;
}

.auth-tabs .is-active button {
  cursor: default;
  font-weight: 700;
}
</style>
