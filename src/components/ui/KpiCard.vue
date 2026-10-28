<script setup lang="ts">
// Używana wewnątrz <dl> - dlatego <dt> i <dd>.
withDefaults(
  defineProps<{
    label: string
    value: string | number
    unit?: string
    hint?: string
    tone?: 'default' | 'warning' | 'danger'
  }>(),
  { tone: 'default' },
)

const toneClasses = {
  default: { card: 'bg-surface shadow-card', text: 'text-ink', label: 'text-muted' },
  warning: { card: 'bg-warning-soft', text: 'text-warning', label: 'text-warning' },
  danger: { card: 'bg-danger-soft', text: 'text-danger', label: 'text-danger' },
}
</script>

<template>
  <div class="rounded-card px-5 py-4" :class="toneClasses[tone].card">
    <dt class="text-sm" :class="toneClasses[tone].label">{{ label }}</dt>
    <dd class="mt-1 text-3xl font-bold tabular-nums" :class="toneClasses[tone].text">
      {{ value }}
      <span v-if="unit" class="text-base font-medium text-muted">{{ unit }}</span>
    </dd>
    <dd v-if="hint" class="mt-1 text-sm" :class="toneClasses[tone].label">{{ hint }}</dd>
  </div>
</template>
