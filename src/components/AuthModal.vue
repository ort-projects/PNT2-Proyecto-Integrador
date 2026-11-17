<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../store/auth.js'
import AuthField from './AuthField.vue'

const props = defineProps({
  open: { type: Boolean, default: false },
  mensaje: { type: String, default: '' },
})

const emit = defineEmits(['close', 'authenticated'])
const authStore = useAuthStore()

const modo = ref('login')
const email = ref('')
const nombre = ref('')
const apellido = ref('')
const password = ref('')
const error = ref('')
const erroresCampos = ref({})
const cargando = ref(false)

watch(
  () => props.open,
  (open) => {
    if (open) {
      modo.value = 'login'
      limpiarErrores()
    }
  },
)

function limpiarErrores() {
  error.value = ''
  erroresCampos.value = {}
}

function limpiarErrorCampo(campo) {
  erroresCampos.value[campo] = ''
  error.value = ''
}

function cambiarModo(nuevoModo) {
  modo.value = nuevoModo
  limpiarErrores()
}

function validarCampos() {
  const errores = {}
  const username = email.value.trim()

  if (modo.value === 'registro') {
    if (!nombre.value.trim()) {
      errores.nombre = 'Ingresá tu nombre.'
    }
    if (!apellido.value.trim()) {
      errores.apellido = 'Ingresá tu apellido.'
    }
  }

  if (!username) {
    errores.email = 'Ingresá tu correo electrónico.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username)) {
    errores.email = 'Ingresá un correo electrónico válido.'
  }

  if (!password.value) {
    errores.password = 'Ingresá tu contraseña.'
  } else if (modo.value === 'registro' && password.value.length < 8) {
    errores.password = 'La contraseña debe tener al menos 8 caracteres.'
  }

  erroresCampos.value = errores
  return Object.keys(errores).length > 0
}

async function enviarFormulario() {
  error.value = ''
  if (validarCampos()) return

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
    if (err instanceof Error) {
      error.value = err.message
    } else {
      error.value = modo.value === 'registro'
        ? 'No se pudo crear la cuenta.'
        : 'No se pudo iniciar sesión.'
    }
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
      <header class="modal-card-head auth-modal__head">
        <div>
          <p class="auth-modal__eyebrow">Tu cuenta</p>
          <h2 id="auth-modal-title" class="modal-card-title auth-modal__title">
            {{ modo === 'login' ? 'Iniciar sesión' : 'Crear usuario' }}
          </h2>
        </div>
        <button
          class="delete auth-modal__close"
          type="button"
          aria-label="Cerrar"
          @click="emit('close')"
        ></button>
      </header>

      <section class="modal-card-body auth-modal__body">
        <p class="auth-modal__intro">
          {{ mensaje || (modo === 'login'
            ? 'Ingresá con tu correo y contraseña.'
            : 'Completá tus datos para crear tu cuenta.') }}
        </p>

        <div class="tabs is-toggle is-fullwidth auth-modal__tabs">
          <ul>
            <li :class="{ 'is-active': modo === 'login' }">
              <button
                type="button"
                :aria-pressed="modo === 'login'"
                :disabled="cargando"
                @click="cambiarModo('login')"
              >
                Iniciar sesión
              </button>
            </li>
            <li :class="{ 'is-active': modo === 'registro' }">
              <button
                type="button"
                :aria-pressed="modo === 'registro'"
                :disabled="cargando"
                @click="cambiarModo('registro')"
              >
                Crear usuario
              </button>
            </li>
          </ul>
        </div>

        <form novalidate @submit.prevent="enviarFormulario">
          <div
            v-if="modo === 'registro'"
            class="columns is-variable is-2 auth-modal__name-fields"
          >
            <div class="column">
              <AuthField
                id="auth-register-name"
                v-model="nombre"
                label="Nombre"
                autocomplete="given-name"
                :error="erroresCampos.nombre"
                :disabled="cargando"
                @update:model-value="limpiarErrorCampo('nombre')"
              />
            </div>
            <div class="column">
              <AuthField
                id="auth-register-surname"
                v-model="apellido"
                label="Apellido"
                autocomplete="family-name"
                :error="erroresCampos.apellido"
                :disabled="cargando"
                @update:model-value="limpiarErrorCampo('apellido')"
              />
            </div>
          </div>

          <AuthField
            id="auth-login-email"
            v-model="email"
            label="Correo electrónico"
            type="email"
            autocomplete="username"
            placeholder="tu@email.com"
            :error="erroresCampos.email"
            :disabled="cargando"
            @update:model-value="limpiarErrorCampo('email')"
          />

          <AuthField
            id="auth-login-password"
            v-model="password"
            label="Contraseña"
            type="password"
            :autocomplete="modo === 'registro' ? 'new-password' : 'current-password'"
            :minlength="modo === 'registro' ? 8 : undefined"
            :error="erroresCampos.password"
            :disabled="cargando"
            @update:model-value="limpiarErrorCampo('password')"
          />

          <p
            v-if="error"
            class="notification is-danger is-light auth-modal__server-error"
            role="alert"
          >
            {{ error }}
          </p>

          <button
            class="button is-primary is-fullwidth auth-modal__submit"
            :class="{ 'is-loading': cargando }"
            type="submit"
            :disabled="cargando"
            :aria-busy="cargando"
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
