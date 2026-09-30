<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'

const layouts = {
  MainLayout: defineAsyncComponent(() => import('./layouts/MainLayout.vue')),
  AuthLayout: defineAsyncComponent(() => import('./layouts/AuthLayout.vue')),
}

const route = useRoute()
const layout = computed(() => {
  const layoutName = route.meta.layout
  if (layoutName && layoutName in layouts) {
    return layouts[layoutName]
  }
  return layouts.MainLayout
})
</script>

<template>
  <component :is="layout" />
</template>