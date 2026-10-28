<script setup lang="ts">
import { RouterLink } from 'vue-router'

const navItems = [
  { to: { name: 'dashboard' }, label: 'Dzień dyspozytora' },
  { to: { name: 'orders' }, label: 'Zlecenia' },
  { to: { name: 'dispatch' }, label: 'Planowanie' },
  { to: { name: 'fleet' }, label: 'Kierowcy i auta' },
  { to: { name: 'map' }, label: 'Mapa' },
] as const
</script>

<template>
  <aside class="px-3 py-4 md:w-60 md:shrink-0 md:px-4 md:py-7">
    <div class="flex items-center gap-2.5 px-2 pb-3 md:pb-6">
      <span
        class="flex size-9 items-center justify-center rounded-xl bg-brand-600"
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M3 7h11v9H3z" />
          <path d="M14 10h4l3 3v3h-7" />
          <circle cx="7" cy="17.5" r="1.8" />
          <circle cx="17" cy="17.5" r="1.8" />
        </svg>
      </span>
      <span class="text-lg font-bold text-ink">FleetDesk</span>
    </div>

    <nav aria-label="Nawigacja główna">
      <ul class="flex gap-1 overflow-x-auto pb-1 md:flex-col md:pb-0">
        <li v-for="item in navItems" :key="item.label">
          <RouterLink
            :to="item.to"
            class="block rounded-xl px-3.5 py-2.5 text-sm whitespace-nowrap text-ink-soft hover:bg-surface hover:text-ink"
            exact-active-class="bg-surface font-semibold !text-ink shadow-card"
          >
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
  </aside>
</template>
