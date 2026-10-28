<script setup lang="ts">
import { RouterLink } from 'vue-router'
import PageHeader from '@/components/layout/PageHeader.vue'
</script>

<template>
  <PageHeader title="Nie znaleziono strony" subtitle="Ten adres nie istnieje." />
  <RouterLink :to="{ name: 'dashboard' }" class="text-brand-700 underline"
    >Wróć do dashboardu</RouterLink
  >
</template>
