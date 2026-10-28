<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type { OrderStatus } from '@/types'
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/constants/labels'

const props = defineProps<{ counts: Record<OrderStatus, number> }>()

// Math.max(..., 1) chroni przed dzieleniem przez zero
const maxCount = computed(() => Math.max(...Object.values(props.counts), 1))

function barWidth(status: OrderStatus): string {
  return `${(props.counts[status] / maxCount.value) * 100}%`
}
</script>

<template>
  <!-- Zwykła lista z liczbami - czytelna także bez pasków (czytnik ekranu, druk).
       Paski mają jeden kolor: pokazują wielkość, a status rozpoznajemy po podpisie. -->
  <ul class="flex flex-col gap-1">
    <li v-for="status in ORDER_STATUSES" :key="status">
      <RouterLink
        :to="{ name: 'orders', query: { status } }"
        class="group block rounded-xl px-2 py-1.5 hover:bg-canvas"
        :title="`${ORDER_STATUS_LABELS[status]}: ${counts[status]} – pokaż na liście`"
      >
        <div class="flex justify-between text-sm">
          <span class="text-ink-soft group-hover:text-brand-700">
            {{ ORDER_STATUS_LABELS[status] }}
          </span>
          <span class="font-medium text-ink tabular-nums">{{ counts[status] }}</span>
        </div>
        <div class="mt-1 h-2 rounded-full bg-canvas" aria-hidden="true">
          <div class="h-2 rounded-full bg-brand-600" :style="{ width: barWidth(status) }" />
        </div>
      </RouterLink>
    </li>
  </ul>
</template>
