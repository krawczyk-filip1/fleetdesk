<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import type { TableColumn } from '@/types'
import { useOrdersStore } from '@/stores/orders'
import { useFleetStore } from '@/stores/fleet'
import { useOrderFilters } from '@/composables/useOrderFilters'
import { useOrderRisk } from '@/composables/useOrderRisk'
import { formatDateTime, formatDriverName, formatWeight } from '@/utils/format'
import { filterOrders, sortOrders } from '@/utils/orders'
import PageHeader from '@/components/layout/PageHeader.vue'
import DataTable from '@/components/ui/DataTable.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge.vue'
import OrderFilters from '@/components/orders/OrderFilters.vue'
import OrderLink from '@/components/orders/OrderLink.vue'
import RiskBadge from '@/components/orders/RiskBadge.vue'
import InitialsAvatar from '@/components/ui/InitialsAvatar.vue'

const ordersStore = useOrdersStore()
const fleetStore = useFleetStore()

const { orders, isLoading, error } = storeToRefs(ordersStore)
const { drivers } = storeToRefs(fleetStore)

const {
  search,
  status,
  driverId,
  dateFrom,
  dateTo,
  sort,
  filters,
  hasActiveFilters,
  resetFilters,
} = useOrderFilters()
const { riskReason } = useOrderRisk()

const visibleOrders = computed(() =>
  sortOrders(filterOrders(orders.value, filters.value), sort.value),
)

const columns: TableColumn[] = [
  { key: 'number', label: 'Numer', sortable: true },
  { key: 'customer', label: 'Klient', sortable: true },
  { key: 'route', label: 'Trasa' },
  { key: 'cargo', label: 'Ładunek', align: 'right', sortable: true },
  { key: 'deadline', label: 'Termin dostawy', sortable: true },
  { key: 'driver', label: 'Kierowca' },
  { key: 'status', label: 'Status', sortable: true },
]

function driverName(driverId: string | null): string {
  if (!driverId) return '—'
  const driver = fleetStore.driversById.get(driverId)
  return driver ? formatDriverName(driver) : '—'
}

function loadData() {
  // Kierowcy są potrzebni tylko do nazwisk i filtra - bez nich tabela działa, więc nie czekamy.
  ordersStore.fetchOrders()
  fleetStore.fetchFleet()
}

onMounted(loadData)
</script>

<template>
  <PageHeader title="Zlecenia" subtitle="Wszystkie zlecenia transportowe" />

  <!-- Kolejność warunków ma znaczenie: najpierw ładowanie, potem błąd, potem pusta lista -->
  <LoadingState v-if="isLoading" label="Wczytywanie zleceń…" />

  <ErrorState v-else-if="error" :message="error" @retry="loadData" />

  <EmptyState
    v-else-if="orders.length === 0"
    title="Brak zleceń"
    description="Nowe zlecenia pojawią się tutaj, gdy klienci je złożą."
  />

  <template v-else>
    <OrderFilters
      v-model:search="search"
      v-model:status="status"
      v-model:driver="driverId"
      v-model:from="dateFrom"
      v-model:to="dateTo"
      :drivers="drivers"
      :has-active-filters="hasActiveFilters"
      @reset="resetFilters"
    />

    <p class="mb-2 text-sm text-muted" aria-live="polite">
      Wyświetlono {{ visibleOrders.length }} z {{ orders.length }} zleceń
    </p>

    <EmptyState
      v-if="visibleOrders.length === 0"
      title="Brak zleceń spełniających kryteria"
      description="Zmień filtry albo wyczyść je, żeby zobaczyć wszystkie zlecenia."
    >
      <BaseButton variant="secondary" @click="resetFilters">Wyczyść filtry</BaseButton>
    </EmptyState>

    <DataTable
      v-else
      v-model:sort="sort"
      :columns="columns"
      :rows="visibleOrders"
      row-key="id"
      caption="Lista zleceń transportowych"
    >
      <template #cell-number="{ row }">
        <OrderLink :order="row" />
      </template>

      <template #cell-route="{ row }">
        <span class="whitespace-nowrap">
          {{ row.origin.city }}
          <span aria-hidden="true" class="text-subtle">→</span>
          <span class="sr-only">do</span>
          {{ row.destination.city }}
        </span>
      </template>

      <template #cell-cargo="{ row }">
        <div class="whitespace-nowrap">{{ formatWeight(row.cargo.weightKg) }}</div>
        <div class="text-xs text-muted">{{ row.cargo.pallets }} pal.</div>
      </template>

      <template #cell-deadline="{ row }">
        <span class="whitespace-nowrap">{{ formatDateTime(row.deadline) }}</span>
      </template>

      <template #cell-driver="{ row }">
        <span v-if="row.driverId" class="flex items-center gap-2 whitespace-nowrap">
          <InitialsAvatar :name="driverName(row.driverId)" size="sm" />
          {{ driverName(row.driverId) }}
        </span>
        <span v-else class="text-muted">Brak kierowcy</span>
      </template>

      <template #cell-status="{ row }">
        <div class="flex flex-wrap gap-1">
          <OrderStatusBadge :status="row.status" />
          <RiskBadge v-if="riskReason(row)" :reason="riskReason(row) ?? ''" />
        </div>
      </template>
    </DataTable>
  </template>
</template>
