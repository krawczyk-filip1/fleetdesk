<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger'
    type?: 'button' | 'submit'
  }>(),
  { variant: 'primary', type: 'button' },
)

const variantClasses = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-surface text-ink shadow-card ring-1 ring-inset ring-line-strong hover:bg-canvas',
  danger: 'bg-danger text-white hover:brightness-110',
}
</script>

<template>
  <!-- min-h-11 = 44 px: wygodny cel dla palca na tablecie -->
  <button
    :type="type"
    class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
    :class="variantClasses[variant]"
  >
    <slot />
  </button>
</template>
