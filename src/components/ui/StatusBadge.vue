<script setup lang="ts">
import type { BadgeTone } from '@/types'

const props = withDefaults(defineProps<{ label: string; tone?: BadgeTone }>(), {
  tone: 'gray',
})

// Pełne nazwy klas (nie `bg-${tone}-100`) - Tailwind znajduje klasy, czytając kod,
// więc sklejone dynamicznie nazwy nie trafiłyby do CSS.
const toneClasses: Record<BadgeTone, string> = {
  gray: 'bg-line text-ink-soft',
  blue: 'bg-brand-50 text-brand-700',
  indigo: 'bg-info-soft text-info',
  green: 'bg-success-soft text-success',
  red: 'bg-danger-soft text-danger',
  amber: 'bg-warning-soft text-warning',
}
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap"
    :class="toneClasses[props.tone]"
  >
    {{ label }}
  </span>
</template>
