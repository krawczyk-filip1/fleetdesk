<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <header class="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-ink">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1.5 text-base text-ink-soft">{{ subtitle }}</p>
    </div>
    <slot name="actions" />
  </header>
</template>
