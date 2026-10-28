<script setup lang="ts">
import BaseButton from './BaseButton.vue'

defineProps<{ message: string }>()

const emit = defineEmits<{ retry: [] }>()
</script>

<template>
  <div role="alert" class="rounded-card bg-danger-soft px-6 py-10 text-center">
    <p class="text-lg font-semibold text-danger">Coś poszło nie tak przy wczytywaniu danych</p>
    <p class="mt-1 text-sm text-danger">{{ message }}</p>
    <BaseButton variant="danger" class="mt-5" @click="emit('retry')">Spróbuj ponownie</BaseButton>
  </div>
</template>
