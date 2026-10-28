<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import type { Driver, Order } from '@/types'
import { useOrdersStore } from '@/stores/orders'
import { useFleetStore } from '@/stores/fleet'
import { useOrderRisk } from '@/composables/useOrderRisk'
import { hasErrors, suggestVehicle, validateAssignment } from '@/utils/assignment'
import { formatDriverName, formatWeight } from '@/utils/format'
import { ApiRequestError, getErrorMessage } from '@/api/http'
import PageHeader from '@/components/layout/PageHeader.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import EmptyState from '@/components/ui/EmptyState.vue'
import DispatchOrderCard from '@/components/orders/DispatchOrderCard.vue'
import DriverDropCard from '@/components/fleet/DriverDropCard.vue'

const ordersStore = useOrdersStore()
const fleetStore = useFleetStore()
const { availableDrivers, vehicles } = storeToRefs(fleetStore)
const { riskReason } = useOrderRisk()

const isLoading = computed(() => ordersStore.isLoading || fleetStore.isLoading)
const error = computed(() => ordersStore.error ?? fleetStore.error)

const pendingOrders = computed(() =>
  ordersStore.orders
    .filter((o) => o.status === 'pending')
    .sort((a, b) => a.pickupAt.localeCompare(b.pickupAt)),
)

const draggedOrderId = ref<string | null>(null)
const dropTargetId = ref<string | null>(null)
const isSaving = ref(false)
const feedback = ref<{ tone: 'success' | 'error'; text: string } | null>(null)

function onDragStart(event: DragEvent, order: Order) {
  draggedOrderId.value = order.id
  if (event.dataTransfer) {
    // Firefox nie zacznie przeciągania bez setData - nawet jeśli tego nie odczytujemy
    event.dataTransfer.setData('text/plain', order.id)
    event.dataTransfer.effectAllowed = 'move'
  }
}

function onDragEnd() {
  draggedOrderId.value = null
  dropTargetId.value = null
}

// dragleave odpala się też przy wejściu kursora na element WEWNĄTRZ karty (np. nazwisko).
// Czyścimy podświetlenie tylko wtedy, gdy kursor naprawdę wyszedł poza kartę.
function onDragLeave(event: DragEvent) {
  const card = event.currentTarget as HTMLElement
  if (!card.contains(event.relatedTarget as Node | null)) dropTargetId.value = null
}

async function onDrop(driver: Driver) {
  const order = pendingOrders.value.find((o) => o.id === draggedOrderId.value)
  onDragEnd()
  if (order) await assign(order, driver)
}

async function assign(order: Order, driver: Driver) {
  if (isSaving.value) return
  feedback.value = null

  const vehicle = suggestVehicle(order, vehicles.value)
  if (!vehicle) {
    feedback.value = {
      tone: 'error',
      text: `${order.number}: brak wolnego pojazdu na ${formatWeight(order.cargo.weightKg)} i ${order.cargo.pallets} palet`,
    }
    return
  }

  // Te same reguły co w formularzu - przeciąganie to tylko inny sposób wyboru
  const errors = validateAssignment(order, driver, vehicle)
  if (hasErrors(errors)) {
    feedback.value = { tone: 'error', text: `${order.number}: ${Object.values(errors).join('. ')}` }
    return
  }

  isSaving.value = true
  try {
    await ordersStore.assignOrder(order.id, { driverId: driver.id, vehicleId: vehicle.id })
    feedback.value = {
      tone: 'success',
      text: `Przypisano ${order.number}: ${formatDriverName(driver)}, ${vehicle.registration}`,
    }
  } catch (e) {
    // Serwer mógł odrzucić (422/409), np. gdy ktoś inny przypisał kierowcę chwilę wcześniej
    const details = e instanceof ApiRequestError && e.fieldErrors
    feedback.value = {
      tone: 'error',
      text: details ? Object.values(details).join('. ') : getErrorMessage(e),
    }
  } finally {
    isSaving.value = false
  }
}

function loadData() {
  ordersStore.fetchOrders()
  fleetStore.fetchFleet()
}

onMounted(loadData)
</script>

<template>
  <PageHeader
    title="Planowanie"
    subtitle="Przeciągnij zlecenie na kierowcę – pojazd dobierzemy automatycznie"
  />

  <LoadingState v-if="isLoading" label="Wczytywanie zleceń i floty…" />

  <ErrorState v-else-if="error" :message="error" @retry="loadData" />

  <template v-else>
    <!-- Region aria-live istnieje zawsze, zmienia się tylko jego treść -
         dzięki temu czytnik ekranu na pewno ogłosi komunikat -->
    <div aria-live="polite" class="mb-4 empty:hidden">
      <p
        v-if="feedback"
        class="rounded-xl px-4 py-3 text-sm font-medium"
        :class="
          feedback.tone === 'success'
            ? 'bg-success-soft text-success'
            : 'bg-danger-soft text-danger'
        "
      >
        {{ feedback.text }}
      </p>
    </div>

    <div class="grid gap-6 md:grid-cols-2">
      <section aria-labelledby="pending-heading">
        <h2 id="pending-heading" class="mb-3 text-lg font-semibold text-ink">
          Oczekujące zlecenia ({{ pendingOrders.length }})
        </h2>
        <EmptyState v-if="pendingOrders.length === 0" title="Wszystkie zlecenia są przypisane" />
        <ul v-else class="flex flex-col gap-3">
          <li v-for="order in pendingOrders" :key="order.id">
            <DispatchOrderCard
              :order="order"
              :suggested-vehicle="suggestVehicle(order, vehicles)"
              :risk-reason="riskReason(order)"
              :is-dragging="draggedOrderId === order.id"
              @dragstart="onDragStart($event, order)"
              @dragend="onDragEnd"
            />
          </li>
        </ul>
      </section>

      <section aria-labelledby="drivers-heading" class="md:sticky md:top-4 md:self-start">
        <h2 id="drivers-heading" class="mb-3 text-lg font-semibold text-ink">
          Dostępni kierowcy ({{ availableDrivers.length }})
        </h2>
        <EmptyState v-if="availableDrivers.length === 0" title="Brak dostępnych kierowców" />
        <ul v-else class="flex flex-col gap-3">
          <li v-for="driver in availableDrivers" :key="driver.id">
            <!-- dragover.prevent: domyślnie przeglądarka NIE pozwala upuszczać na elementy -->
            <DriverDropCard
              :driver="driver"
              :is-drop-allowed="draggedOrderId !== null"
              :is-over="dropTargetId === driver.id"
              @dragover.prevent="dropTargetId = driver.id"
              @dragleave="onDragLeave"
              @drop.prevent="onDrop(driver)"
            />
          </li>
        </ul>
      </section>
    </div>
  </template>
</template>
