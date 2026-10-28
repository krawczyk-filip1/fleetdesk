<script setup lang="ts">
import { computed, onMounted, ref, useId } from 'vue'
import { storeToRefs } from 'pinia'
import type { TableColumn } from '@/types'
import { useFleetStore } from '@/stores/fleet'
import { useOrdersStore } from '@/stores/orders'
import {
  DRIVER_STATUS_LABELS,
  DRIVER_STATUS_TONES,
  VEHICLE_STATUS_LABELS,
  VEHICLE_STATUS_TONES,
  VEHICLE_TYPE_LABELS,
} from '@/constants/labels'
import { formatDriverName, formatWeight, toTelHref } from '@/utils/format'
import { mapActiveOrdersBy } from '@/utils/orders'
import PageHeader from '@/components/layout/PageHeader.vue'
import DataTable from '@/components/ui/DataTable.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import OrderLink from '@/components/orders/OrderLink.vue'
import InitialsAvatar from '@/components/ui/InitialsAvatar.vue'

const fleetStore = useFleetStore()
const ordersStore = useOrdersStore()
const { drivers, vehicles, availableDrivers, availableVehicles, isLoading, error } =
  storeToRefs(fleetStore)

// Zwykły ref, a nie URL: to jeden przełącznik wygody, jego utrata po odświeżeniu nic nie kosztuje.
// Filtry zleceń są w URL, bo tam link z filtrami ma realną wartość dla dyspozytora.
const onlyAvailable = ref(false)
const toggleId = useId()

const activeOrderByDriver = computed(() => mapActiveOrdersBy(ordersStore.orders, 'driverId'))
const activeOrderByVehicle = computed(() => mapActiveOrdersBy(ordersStore.orders, 'vehicleId'))

const driverRows = computed(() =>
  (onlyAvailable.value ? availableDrivers.value : drivers.value).map((driver) => ({
    ...driver,
    activeOrder: activeOrderByDriver.value.get(driver.id),
  })),
)
const vehicleRows = computed(() =>
  (onlyAvailable.value ? availableVehicles.value : vehicles.value).map((vehicle) => ({
    ...vehicle,
    activeOrder: activeOrderByVehicle.value.get(vehicle.id),
  })),
)

const driverColumns: TableColumn[] = [
  { key: 'name', label: 'Kierowca' },
  { key: 'phone', label: 'Telefon' },
  { key: 'status', label: 'Dostępność' },
  { key: 'order', label: 'Aktualne zlecenie' },
]

const vehicleColumns: TableColumn[] = [
  { key: 'registration', label: 'Rejestracja' },
  { key: 'type', label: 'Typ' },
  { key: 'capacity', label: 'Ładowność', align: 'right' },
  { key: 'palletSlots', label: 'Miejsca paletowe', align: 'right' },
  { key: 'status', label: 'Status' },
  { key: 'order', label: 'Aktualne zlecenie' },
]

function loadData() {
  fleetStore.fetchFleet()
  // Zlecenia tylko do kolumny "Aktualne zlecenie" - bez nich tabele i tak działają
  ordersStore.fetchOrders()
}

onMounted(loadData)
</script>

<template>
  <PageHeader title="Kierowcy i auta" subtitle="Dostępność floty na dziś">
    <template #actions>
      <div class="flex items-center gap-2 text-sm text-ink-soft">
        <input
          :id="toggleId"
          v-model="onlyAvailable"
          type="checkbox"
          class="size-4 rounded border-line-strong accent-brand-600"
        />
        <label :for="toggleId">Pokaż tylko dostępnych</label>
      </div>
    </template>
  </PageHeader>

  <LoadingState v-if="isLoading" label="Wczytywanie floty…" />

  <ErrorState v-else-if="error" :message="error" @retry="loadData" />

  <div v-else class="flex flex-col gap-8">
    <section aria-labelledby="drivers-heading">
      <h2 id="drivers-heading" class="mb-1 text-lg font-semibold text-ink">Kierowcy</h2>
      <p class="mb-3 text-sm text-muted">
        Dostępnych: {{ availableDrivers.length }} z {{ drivers.length }}
      </p>

      <EmptyState v-if="driverRows.length === 0" title="Brak dostępnych kierowców" />
      <DataTable
        v-else
        :columns="driverColumns"
        :rows="driverRows"
        row-key="id"
        caption="Lista kierowców"
      >
        <template #cell-name="{ row }">
          <span class="flex items-center gap-3 font-semibold whitespace-nowrap text-ink">
            <InitialsAvatar :name="formatDriverName(row)" size="sm" />
            {{ formatDriverName(row) }}
          </span>
        </template>
        <template #cell-phone="{ row }">
          <a :href="toTelHref(row.phone)" class="whitespace-nowrap text-brand-700 hover:underline">
            {{ row.phone }}
          </a>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge
            :label="DRIVER_STATUS_LABELS[row.status]"
            :tone="DRIVER_STATUS_TONES[row.status]"
          />
        </template>
        <template #cell-order="{ row }">
          <OrderLink v-if="row.activeOrder" :order="row.activeOrder" />
          <span v-else class="text-subtle">—</span>
        </template>
      </DataTable>
    </section>

    <section aria-labelledby="vehicles-heading">
      <h2 id="vehicles-heading" class="mb-1 text-lg font-semibold text-ink">Pojazdy</h2>
      <p class="mb-3 text-sm text-muted">
        Dostępnych: {{ availableVehicles.length }} z {{ vehicles.length }}
      </p>

      <EmptyState v-if="vehicleRows.length === 0" title="Brak dostępnych pojazdów" />
      <DataTable
        v-else
        :columns="vehicleColumns"
        :rows="vehicleRows"
        row-key="id"
        caption="Lista pojazdów"
      >
        <template #cell-registration="{ row }">
          <span class="font-mono font-medium whitespace-nowrap text-ink">
            {{ row.registration }}
          </span>
        </template>
        <template #cell-type="{ row }">
          <span class="whitespace-nowrap">{{ VEHICLE_TYPE_LABELS[row.type] }}</span>
        </template>
        <template #cell-capacity="{ row }">
          <span class="whitespace-nowrap">{{ formatWeight(row.capacityKg) }}</span>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge
            :label="VEHICLE_STATUS_LABELS[row.status]"
            :tone="VEHICLE_STATUS_TONES[row.status]"
          />
        </template>
        <template #cell-order="{ row }">
          <OrderLink v-if="row.activeOrder" :order="row.activeOrder" />
          <span v-else class="text-subtle">—</span>
        </template>
      </DataTable>
    </section>
  </div>
</template>
