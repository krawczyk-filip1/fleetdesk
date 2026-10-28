<script setup lang="ts" generic="T extends string">
import { useId } from 'vue'

defineProps<{
  label: string
  options: { value: T; label: string }[]
  placeholder?: string
  error?: string
}>()

const model = defineModel<T | ''>({ required: true })

const id = useId()
const errorId = useId()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="text-xs font-medium text-muted">{{ label }}</label>
    <select
      :id="id"
      v-model="model"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="error ? errorId : undefined"
      class="min-h-11 rounded-xl border bg-surface px-3 text-sm text-ink"
      :class="error ? 'border-danger' : 'border-line-strong'"
    >
      <option value="">{{ placeholder ?? 'Wszystkie' }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" :id="errorId" class="text-sm text-danger">{{ error }}</p>
  </div>
</template>
