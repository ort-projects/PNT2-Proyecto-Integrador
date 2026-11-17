<script setup>
const valor = defineModel({ type: String, default: '' })

defineProps({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  minlength: { type: [Number, String], default: undefined },
  error: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <div class="field">
    <label class="label" :for="id">{{ label }}</label>
    <div class="control">
      <input
        :id="id"
        v-model="valor"
        class="input"
        :class="{ 'is-danger': error }"
        :aria-invalid="Boolean(error)"
        :aria-describedby="error ? `${id}-error` : undefined"
        :type="type"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :minlength="minlength"
        :disabled="disabled"
        required
      />
    </div>
    <p v-if="error" :id="`${id}-error`" class="help is-danger">
      {{ error }}
    </p>
  </div>
</template>
