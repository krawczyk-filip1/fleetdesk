<script setup lang="ts">
import { useId } from 'vue'

defineProps<{ title: string }>()

const titleId = useId()
</script>

<template>
  <section :aria-labelledby="titleId" class="rounded-card bg-surface shadow-card p-4 md:p-5">
    <h2 :id="titleId" class="mb-4 text-base font-semibold text-ink">{{ title }}</h2>
    <slot />
  </section>
</template>
