<script setup lang="ts">
withDefaults(defineProps<{ label?: string }>(), { label: 'Ładowanie danych…' })
</script>

<template>
  <div role="status" class="flex items-center justify-center gap-3 py-16 text-muted">
    <span
      class="size-5 rounded-full motion-safe:animate-spin border-2 border-line-strong border-t-brand-600"
      aria-hidden="true"
    />
    <span>{{ label }}</span>
  </div>
</template>
