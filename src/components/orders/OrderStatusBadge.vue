<script setup lang="ts">
import type { OrderStatus } from '@/types'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '@/constants/labels'
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{ status: OrderStatus }>()
</script>

<template>
  <StatusBadge :label="ORDER_STATUS_LABELS[status]" :tone="ORDER_STATUS_TONES[status]" />
</template>
