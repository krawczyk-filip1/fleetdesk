<script setup lang="ts">
import { computed } from 'vue'
import type { StatusChange } from '@/types'
import { formatDateTime } from '@/utils/format'
import OrderStatusBadge from './OrderStatusBadge.vue'

const props = defineProps<{ history: StatusChange[] }>()

const lastIndex = computed(() => props.history.length - 1)
</script>

<template>
  <ol class="ml-1.5">
    <li
      v-for="(entry, index) in history"
      :key="`${entry.status}-${entry.changedAt}`"
      class="relative border-l border-line pb-6 pl-6 last:border-transparent last:pb-0"
      :aria-current="index === lastIndex ? 'step' : undefined"
    >
      <span
        class="absolute top-1 -left-1.5 size-3 rounded-full ring-4 ring-surface"
        :class="index === lastIndex ? 'bg-brand-600' : 'bg-line-strong'"
        aria-hidden="true"
      />
      <OrderStatusBadge :status="entry.status" />
      <time :datetime="entry.changedAt" class="mt-1 block text-sm text-muted">
        {{ formatDateTime(entry.changedAt) }}
      </time>
      <p v-if="entry.note" class="text-sm text-muted">{{ entry.note }}</p>
    </li>
  </ol>
</template>
