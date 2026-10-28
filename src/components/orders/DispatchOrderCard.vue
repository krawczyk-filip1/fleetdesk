<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Order, Vehicle } from '@/types'
import { formatDateTime, formatWeight } from '@/utils/format'
import RiskBadge from './RiskBadge.vue'

defineProps<{
  order: Order
  suggestedVehicle: Vehicle | undefined
  riskReason: string | null
  isDragging: boolean
}>()
</script>

<template>
  <article
    draggable="true"
    class="cursor-grab rounded-card bg-surface shadow-card p-3 transition active:cursor-grabbing"
    :class="{ 'opacity-50 ring-2 ring-brand-600': isDragging }"
  >
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="font-medium text-ink">{{ order.number }}</span>
      <RiskBadge v-if="riskReason" :reason="riskReason" />
    </div>
    <p class="mt-1 text-sm text-ink-soft">
      {{ order.origin.city }} <span aria-hidden="true">→</span><span class="sr-only">do</span>
      {{ order.destination.city }} · {{ formatWeight(order.cargo.weightKg) }},
      {{ order.cargo.pallets }} pal.
    </p>
    <p class="text-xs text-muted">Odbiór: {{ formatDateTime(order.pickupAt) }}</p>
    <p class="mt-2 text-xs" :class="suggestedVehicle ? 'text-muted' : 'text-danger'">
      {{
        suggestedVehicle
          ? `Proponowany pojazd: ${suggestedVehicle.registration}`
          : 'Brak wolnego pojazdu, który pomieści ładunek'
      }}
    </p>
    <!-- Alternatywa dla klawiatury i ekranów dotykowych: HTML5 drag & drop działa tylko myszą -->
    <RouterLink
      :to="{ name: 'order-details', params: { id: order.id } }"
      class="mt-2 inline-block text-xs font-medium text-brand-700 hover:underline"
    >
      Przypisz w formularzu<span class="sr-only"> zlecenie {{ order.number }}</span>
    </RouterLink>
  </article>
</template>
