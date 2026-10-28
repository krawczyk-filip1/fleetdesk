<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { Order } from '@/types'

defineProps<{ order: Pick<Order, 'id' | 'number'> }>()
</script>

<template>
  <RouterLink
    :to="{ name: 'order-details', params: { id: order.id } }"
    class="font-medium whitespace-nowrap text-brand-700 hover:underline"
  >
    {{ order.number }}
  </RouterLink>
</template>
