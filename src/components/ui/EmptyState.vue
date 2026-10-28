<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>

<template>
  <div class="rounded-card bg-surface px-6 py-12 text-center shadow-card">
    <p class="text-lg font-semibold text-ink">{{ title }}</p>
    <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
    <div v-if="$slots.default" class="mt-5">
      <slot />
    </div>
  </div>
</template>
