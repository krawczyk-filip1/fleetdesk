<script setup lang="ts">
import StatusBadge from '@/components/ui/StatusBadge.vue'

defineProps<{ reason: string }>()
</script>

<template>
  <span :title="reason" class="inline-flex">
    <StatusBadge label="Może się spóźnić" tone="amber" />
    <span class="sr-only">: {{ reason }}</span>
  </span>
</template>
