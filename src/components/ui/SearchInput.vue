<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ label: string; placeholder?: string }>()

const model = defineModel<string>({ required: true })
const id = useId()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label :for="id" class="text-xs font-medium text-muted">{{ label }}</label>
    <input
      :id="id"
      v-model="model"
      type="search"
      :placeholder="placeholder"
      autocomplete="off"
      class="min-h-11 rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-subtle"
    />
  </div>
</template>
