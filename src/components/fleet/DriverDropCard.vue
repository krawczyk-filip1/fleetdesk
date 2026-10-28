<script setup lang="ts">
import type { Driver } from '@/types'
import { formatDriverName } from '@/utils/format'
import InitialsAvatar from '@/components/ui/InitialsAvatar.vue'

defineProps<{
  driver: Driver
  isDropAllowed: boolean
  isOver: boolean
}>()
</script>

<template>
  <div
    class="rounded-card border-2 border-dashed p-4 transition"
    :class="[
      isOver
        ? 'border-brand-600 bg-brand-50'
        : isDropAllowed
          ? 'border-brand-100 bg-surface'
          : 'border-line-strong bg-surface',
    ]"
  >
    <div class="flex items-center gap-3">
      <InitialsAvatar :name="formatDriverName(driver)" />
      <div>
        <p class="font-semibold text-ink">{{ formatDriverName(driver) }}</p>
        <p class="text-sm text-muted">{{ driver.phone }}</p>
      </div>
    </div>
    <p class="mt-2 text-xs" :class="isOver ? 'font-medium text-brand-700' : 'text-subtle'">
      {{ isOver ? 'Upuść, aby przypisać' : 'Przeciągnij tu zlecenie' }}
    </p>
  </div>
</template>
