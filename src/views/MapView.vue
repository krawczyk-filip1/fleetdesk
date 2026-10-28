<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { GeoPoint, Order, Vehicle } from '@/types'
import { useFleetStore } from '@/stores/fleet'
import { useOrdersStore } from '@/stores/orders'
import { useVehicleSimulation } from '@/composables/useVehicleSimulation'
import { mapActiveOrdersBy } from '@/utils/orders'
import { distanceKm } from '@/utils/geo'
import { formatDriverName } from '@/utils/format'
import PageHeader from '@/components/layout/PageHeader.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import OrderLink from '@/components/orders/OrderLink.vue'
import FleetMap, { type MapMarker } from '@/components/map/FleetMap.vue'

const fleetStore = useFleetStore()
const ordersStore = useOrdersStore()
const { vehicles } = storeToRefs(fleetStore)

const isLoading = computed(() => fleetStore.isLoading || ordersStore.isLoading)
const error = computed(() => fleetStore.error ?? ordersStore.error)

const selectedId = ref<string | null>(null)

// Kolor zawsze idzie z podpisem - w legendzie, na liście i w podpowiedzi znacznika.
const MARKER_STYLES = {
  moving: { color: '#1d4ed8', label: 'W trasie' },
  delayed: { color: '#dc2626', label: 'Opóźniony' },
  available: { color: '#14b8a6', label: 'Dostępny' },
  parked: { color: '#64748b', label: 'Postój lub serwis' },
} as const

const activeOrderByVehicle = computed(() => mapActiveOrdersBy(ordersStore.orders, 'vehicleId'))

// Jadą tylko pojazdy ze zleceniem "W trasie" albo "Opóźnione" - przypisane czekają na załadunek
const destinations = computed(() => {
  const result = new Map<string, GeoPoint>()
  for (const [vehicleId, order] of activeOrderByVehicle.value) {
    if (order.status === 'in_transit' || order.status === 'delayed') {
      result.set(vehicleId, order.destination.coords)
    }
  }
  return result
})

const { positions } = useVehicleSimulation(vehicles, destinations)

function markerStyle(vehicle: Vehicle, order: Order | undefined) {
  if (order?.status === 'delayed') return MARKER_STYLES.delayed
  if (destinations.value.has(vehicle.id)) return MARKER_STYLES.moving
  if (vehicle.status === 'available') return MARKER_STYLES.available
  return MARKER_STYLES.parked
}

function driverLabel(order: Order | undefined): string | null {
  const driver = order?.driverId ? fleetStore.driversById.get(order.driverId) : undefined
  return driver ? formatDriverName(driver) : null
}

const markers = computed<MapMarker[]>(() =>
  vehicles.value.map((vehicle) => {
    const order = activeOrderByVehicle.value.get(vehicle.id)
    const style = markerStyle(vehicle, order)
    const driver = driverLabel(order)
    return {
      id: vehicle.id,
      position: positions.value.get(vehicle.id) ?? vehicle.position,
      label: [vehicle.registration, style.label, driver].filter(Boolean).join(' · '),
      color: style.color,
    }
  }),
)

// Lista obok mapy: te same dane w formie dostępnej z klawiatury i dla czytnika ekranu
const movingVehicles = computed(() =>
  vehicles.value.flatMap((vehicle) => {
    const order = activeOrderByVehicle.value.get(vehicle.id)
    if (!order || !destinations.value.has(vehicle.id)) return []
    const position = positions.value.get(vehicle.id) ?? vehicle.position
    return [
      {
        vehicle,
        order,
        driver: driverLabel(order),
        style: markerStyle(vehicle, order),
        kmLeft: Math.round(distanceKm(position, order.destination.coords)),
      },
    ]
  }),
)

function loadData() {
  fleetStore.fetchFleet()
  ordersStore.fetchOrders()
}

onMounted(loadData)
</script>

<template>
  <PageHeader title="Mapa" subtitle="Pozycje pojazdów – symulacja ruchu co 2 sekundy" />

  <LoadingState v-if="isLoading" label="Wczytywanie floty…" />

  <ErrorState v-else-if="error" :message="error" @retry="loadData" />

  <div v-else class="grid gap-4 lg:grid-cols-3">
    <div class="lg:col-span-2">
      <FleetMap :markers="markers" :selected-id="selectedId" @select="selectedId = $event" />

      <ul class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-soft" aria-label="Legenda">
        <li v-for="style in MARKER_STYLES" :key="style.label" class="flex items-center gap-2">
          <span
            class="size-3 rounded-full ring-2 ring-surface"
            :style="{ backgroundColor: style.color }"
            aria-hidden="true"
          />
          {{ style.label }}
        </li>
      </ul>
    </div>

    <section aria-labelledby="moving-heading">
      <h2 id="moving-heading" class="mb-3 text-lg font-semibold text-ink">
        W trasie ({{ movingVehicles.length }})
      </h2>
      <ul class="flex flex-col gap-2">
        <li
          v-for="item in movingVehicles"
          :key="item.vehicle.id"
          class="rounded-card bg-surface p-3 shadow-card ring-2"
          :class="selectedId === item.vehicle.id ? 'ring-brand-600' : 'ring-transparent'"
        >
          <!-- Przycisk pokazuje pojazd na mapie; link do zlecenia jest obok,
               bo link w przycisku to niepoprawny HTML (dwa elementy interaktywne w sobie) -->
          <button
            type="button"
            class="flex w-full items-center justify-between gap-2 text-left"
            :aria-pressed="selectedId === item.vehicle.id"
            @click="selectedId = item.vehicle.id"
          >
            <span class="flex items-center gap-2">
              <span
                class="size-3 shrink-0 rounded-full"
                :style="{ backgroundColor: item.style.color }"
                aria-hidden="true"
              />
              <span class="font-mono font-medium text-ink">{{ item.vehicle.registration }}</span>
              <span class="text-xs text-muted">{{ item.style.label }}</span>
            </span>
            <span class="text-sm whitespace-nowrap text-muted tabular-nums">
              {{ item.kmLeft > 0 ? `${item.kmLeft} km` : 'Na miejscu' }}
            </span>
          </button>
          <p class="mt-1 text-sm text-muted">
            {{ item.driver ?? '—' }} · {{ item.order.destination.city }} ·
            <OrderLink :order="item.order" />
          </p>
        </li>
      </ul>
    </section>
  </div>
</template>
