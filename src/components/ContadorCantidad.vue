<script setup>
import { computed } from 'vue'
import { useCartStore } from '../store/cart.js'

const props = defineProps({
  productoId: {
    type: [String, Number],
    required: true,
  },
  idCantidad: {
    type: String,
    required: true,
  },
})

const cartStore = useCartStore()

const cantidad = computed(() =>
  cartStore.items.find(
    (item) => String(item.id) === String(props.productoId),
  )?.cantidad ?? 1,
)

function disminuirCantidad() {
  cartStore.disminuirCantidad(props.productoId)
}

function aumentarCantidad() {
  cartStore.aumentarCantidad(props.productoId)
}
</script>

<template>
  <div class="purchase-controls">
    <label class="quantity-label" :for="idCantidad">Cantidad</label>

    <div class="quantity-counter" aria-label="Seleccionar cantidad">
      <button
        type="button"
        class="quantity-button"
        aria-label="Quitar una unidad"
        :disabled="cantidad <= 1"
        @click="disminuirCantidad"
      >
        −
      </button>

      <output :id="idCantidad" class="quantity-value" aria-live="polite">
        {{ cantidad }}
      </output>

      <button
        type="button"
        class="quantity-button"
        aria-label="Agregar una unidad a la cantidad"
        @click="aumentarCantidad"
      >
        +
      </button>
    </div>
  </div>
</template>

<style scoped>
.purchase-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.75rem;
}

.quantity-label {
  font-weight: 600;
}

.quantity-counter {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  border: 1px solid var(--color-borde);
  background: var(--color-superficie);
}

.quantity-button {
  width: 2.75rem;
  height: 2.75rem;
  border: 0;
  background: transparent;
  color: var(--color-texto);
  cursor: pointer;
  font: inherit;
  font-size: 1.25rem;
}

.quantity-button:hover:not(:disabled) {
  background: var(--color-pistacho);
}

.quantity-button:disabled {
  color: var(--color-secundario);
  cursor: not-allowed;
  opacity: 0.5;
}

.quantity-value {
  min-width: 2.5rem;
  text-align: center;
}
</style>
