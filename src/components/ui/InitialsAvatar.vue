<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{ name?: string; size?: 'sm' | 'md' }>(), {
  size: 'md',
})

const initials = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})
</script>

<template>
  <!-- aria-hidden: imię i tak jest obok w tekście, czytnik nie powinien czytać "PW" -->
  <span
    aria-hidden="true"
    class="inline-flex shrink-0 items-center justify-center rounded-full font-bold"
    :class="[
      size === 'sm' ? 'size-8 text-xs' : 'size-11 text-sm',
      name ? 'bg-brand-50 text-brand-700' : 'bg-canvas text-muted',
    ]"
  >
    {{ initials }}
  </span>
</template>
