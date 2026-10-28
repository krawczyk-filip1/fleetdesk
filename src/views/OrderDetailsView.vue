<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import type { Order } from '@/types'
import { getOrder } from '@/api/orders'
import { ApiRequestError, getErrorMessage } from '@/api/http'
import { useFleetStore } from '@/stores/fleet'
import { useOrderRisk } from '@/composables/useOrderRisk'
import { VEHICLE_TYPE_LABELS } from '@/constants/labels'
import { formatDateTime, formatDriverName, formatWeight, toTelHref } from '@/utils/format'
import PageHeader from '@/components/layout/PageHeader.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import OrderStatusBadge from '@/components/orders/OrderStatusBadge.vue'
import OrderStatusTimeline from '@/components/orders/OrderStatusTimeline.vue'
import AssignOrderForm from '@/components/orders/AssignOrderForm.vue'

const props = defineProps<{ id: string }>()

const fleetStore = useFleetStore()
const { riskReason } = useOrderRisk()

// Stan lokalny, a nie store: szczegóły jednego zlecenia potrzebne są tylko na tej stronie.
// Store trzyma to, co współdzieli kilka widoków (lista zleceń, flota).
const order = ref<Order | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const notFound = ref(false)

async function loadOrder() {
  isLoading.value = true
  error.value = null
  notFound.value = false
  try {
    order.value = await getOrder(props.id)
  } catch (e) {
    order.value = null
    if (e instanceof ApiRequestError && e.status === 404) notFound.value = true
    else error.value = getErrorMessage(e)
  } finally {
    isLoading.value = false
  }
}

// watch zamiast onMounted: przy przejściu z /orders/o1 na /orders/o2 Vue Router
// używa tego samego komponentu, więc onMounted drugi raz by się nie wykonał.
watch(() => props.id, loadOrder, { immediate: true })

onMounted(() => fleetStore.fetchFleet())

const driver = computed(() =>
  order.value?.driverId ? fleetStore.driversById.get(order.value.driverId) : undefined,
)
const vehicle = computed(() =>
  order.value?.vehicleId ? fleetStore.vehiclesById.get(order.value.vehicleId) : undefined,
)

const justAssigned = ref(false)

function onAssigned(updated: Order) {
  order.value = updated
  justAssigned.value = true
}

const loadPercent = computed(() => {
  if (!order.value || !vehicle.value) return null
  return Math.round((order.value.cargo.weightKg / vehicle.value.capacityKg) * 100)
})

// Jeśli użytkownik przyszedł z listy z filtrami, "Wróć" zachowa te filtry.
// Vue Router zapisuje poprzedni adres w history.state.back.
const previousPath: unknown = window.history.state?.back
const backLink =
  typeof previousPath === 'string' && previousPath.startsWith('/orders')
    ? previousPath
    : { name: 'orders' }
</script>

<template>
  <RouterLink :to="backLink" class="mb-4 inline-block text-sm text-brand-700 hover:underline">
    <span aria-hidden="true">←</span> Wróć do listy zleceń
  </RouterLink>

  <LoadingState v-if="isLoading" label="Wczytywanie zlecenia…" />

  <ErrorState v-else-if="error" :message="error" @retry="loadOrder" />

  <EmptyState
    v-else-if="notFound"
    title="Nie znaleziono zlecenia"
    description="Zlecenie mogło zostać usunięte albo link jest nieprawidłowy."
  />

  <template v-else-if="order">
    <PageHeader :title="`Zlecenie ${order.number}`" :subtitle="order.customer">
      <template #actions>
        <OrderStatusBadge :status="order.status" />
      </template>
    </PageHeader>

    <p
      v-if="riskReason(order)"
      role="status"
      class="mb-4 flex items-center gap-2 rounded-card bg-warning-soft px-4 py-3 text-sm text-warning"
    >
      <span aria-hidden="true">⚠</span>
      <span><strong>Zlecenie zagrożone opóźnieniem:</strong> {{ riskReason(order) }}</span>
    </p>

    <div class="grid gap-4 lg:grid-cols-3">
      <div class="flex flex-col gap-4 lg:col-span-2">
        <BaseCard title="Trasa">
          <dl class="grid gap-4 sm:grid-cols-2">
            <div>
              <dt class="text-xs font-medium text-muted uppercase">Załadunek</dt>
              <dd class="mt-1 font-medium text-ink">{{ order.origin.city }}</dd>
              <dd class="text-sm text-muted">{{ order.origin.address }}</dd>
              <dd class="mt-1 text-sm text-muted">
                <time :datetime="order.pickupAt">{{ formatDateTime(order.pickupAt) }}</time>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-muted uppercase">Rozładunek (termin)</dt>
              <dd class="mt-1 font-medium text-ink">{{ order.destination.city }}</dd>
              <dd class="text-sm text-muted">{{ order.destination.address }}</dd>
              <dd class="mt-1 text-sm text-muted">
                <time :datetime="order.deadline">{{ formatDateTime(order.deadline) }}</time>
              </dd>
            </div>
          </dl>
        </BaseCard>

        <BaseCard title="Ładunek">
          <dl class="grid gap-4 sm:grid-cols-3">
            <div>
              <dt class="text-xs font-medium text-muted uppercase">Opis</dt>
              <dd class="mt-1 text-ink">{{ order.cargo.description }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-muted uppercase">Waga</dt>
              <dd class="mt-1 text-ink">{{ formatWeight(order.cargo.weightKg) }}</dd>
            </div>
            <div>
              <dt class="text-xs font-medium text-muted uppercase">Palety</dt>
              <dd class="mt-1 text-ink">{{ order.cargo.pallets }}</dd>
            </div>
          </dl>
        </BaseCard>
      </div>

      <div class="flex flex-col gap-4">
        <BaseCard title="Przypisanie">
          <AssignOrderForm
            v-if="order.status === 'pending'"
            :order="order"
            :drivers="fleetStore.drivers"
            :vehicles="fleetStore.vehicles"
            @assigned="onAssigned"
          />

          <template v-else>
            <p
              v-if="justAssigned"
              role="status"
              class="mb-4 rounded-xl bg-success-soft px-3 py-2 text-sm font-medium text-success"
            >
              Zlecenie przypisane
            </p>
            <dl class="flex flex-col gap-4">
              <div>
                <dt class="text-xs font-medium text-muted uppercase">Kierowca</dt>
                <template v-if="driver">
                  <dd class="mt-1 text-ink">{{ formatDriverName(driver) }}</dd>
                  <dd class="text-sm">
                    <a :href="toTelHref(driver.phone)" class="text-brand-700 hover:underline">
                      {{ driver.phone }}
                    </a>
                  </dd>
                </template>
                <dd v-else class="mt-1 text-muted">—</dd>
              </div>
              <div>
                <dt class="text-xs font-medium text-muted uppercase">Pojazd</dt>
                <template v-if="vehicle">
                  <dd class="mt-1 font-mono text-ink">{{ vehicle.registration }}</dd>
                  <dd class="text-sm text-muted">
                    {{ VEHICLE_TYPE_LABELS[vehicle.type] }}, ładowność
                    {{ formatWeight(vehicle.capacityKg) }}
                  </dd>
                  <dd v-if="loadPercent !== null" class="mt-2">
                    <div class="flex justify-between text-xs text-muted">
                      <span>Wykorzystanie ładowności</span>
                      <span>{{ loadPercent }}%</span>
                    </div>
                    <progress
                      :value="loadPercent"
                      max="100"
                      class="mt-1 h-2 w-full overflow-hidden rounded-full [&::-moz-progress-bar]:bg-brand-600 [&::-webkit-progress-bar]:bg-line [&::-webkit-progress-value]:bg-brand-600"
                    >
                      {{ loadPercent }}%
                    </progress>
                  </dd>
                </template>
                <dd v-else class="mt-1 text-muted">—</dd>
              </div>
            </dl>
          </template>
        </BaseCard>

        <BaseCard title="Historia statusów">
          <OrderStatusTimeline :history="order.statusHistory" />
        </BaseCard>
      </div>
    </div>
  </template>
</template>
