<script setup lang="ts">
import { computed, useId } from 'vue'
import type { Driver, OrderStatus } from '@/types'
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from '@/constants/labels'
import { UNASSIGNED_DRIVER } from '@/utils/orders'
import { formatDriverName } from '@/utils/format'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SearchInput from '@/components/ui/SearchInput.vue'

const props = defineProps<{
  drivers: Driver[]
  hasActiveFilters: boolean
}>()

const emit = defineEmits<{ reset: [] }>()

const search = defineModel<string>('search', { required: true })
const status = defineModel<OrderStatus | ''>('status', { required: true })
const driver = defineModel<string>('driver', { required: true })
const from = defineModel<string>('from', { required: true })
const to = defineModel<string>('to', { required: true })

const statusOptions = ORDER_STATUSES.map((value) => ({ value, label: ORDER_STATUS_LABELS[value] }))

const driverOptions = computed(() => [
  { value: UNASSIGNED_DRIVER, label: 'Bez kierowcy' },
  ...props.drivers.map((d) => ({ value: d.id, label: formatDriverName(d) })),
])

const fromId = useId()
const toId = useId()
const inputClass = 'min-h-11 rounded-xl border border-line-strong bg-surface px-3 text-sm text-ink'
</script>

<template>
  <form
    role="search"
    aria-label="Filtry zleceń"
    class="mb-4 grid items-end gap-3 rounded-card bg-surface shadow-card p-4 sm:grid-cols-2 lg:grid-cols-6"
    @submit.prevent
  >
    <SearchInput
      v-model="search"
      label="Szukaj"
      placeholder="Numer, klient, miasto…"
      class="sm:col-span-2"
    />
    <BaseSelect v-model="status" label="Status" :options="statusOptions" />
    <BaseSelect v-model="driver" label="Kierowca" :options="driverOptions" placeholder="Wszyscy" />

    <div class="flex flex-col gap-1">
      <label :for="fromId" class="text-xs font-medium text-muted">Termin od</label>
      <input :id="fromId" v-model="from" type="date" :max="to || undefined" :class="inputClass" />
    </div>
    <div class="flex flex-col gap-1">
      <label :for="toId" class="text-xs font-medium text-muted">Termin do</label>
      <input :id="toId" v-model="to" type="date" :min="from || undefined" :class="inputClass" />
    </div>

    <div v-if="hasActiveFilters" class="flex justify-end sm:col-span-2 lg:col-span-6">
      <BaseButton variant="secondary" @click="emit('reset')">Wyczyść filtry</BaseButton>
    </div>
  </form>
</template>
