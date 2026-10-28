<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useOrdersStore } from '@/stores/orders'
import { useFleetStore } from '@/stores/fleet'
import { useOrderRisk } from '@/composables/useOrderRisk'
import { countByStatus } from '@/utils/stats'
import { describeDay, greeting } from '@/utils/summary'
import { formatDriverName, formatTime, toTelHref } from '@/utils/format'
import KpiCard from '@/components/ui/KpiCard.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import InitialsAvatar from '@/components/ui/InitialsAvatar.vue'
import StatusBadge from '@/components/ui/StatusBadge.vue'
import LoadingState from '@/components/ui/LoadingState.vue'
import ErrorState from '@/components/ui/ErrorState.vue'
import RiskBadge from '@/components/orders/RiskBadge.vue'
import OrdersByStatusChart from '@/components/orders/OrdersByStatusChart.vue'

const ordersStore = useOrdersStore()
const fleetStore = useFleetStore()
const { orders } = storeToRefs(ordersStore)
const { vehicles } = storeToRefs(fleetStore)
const { now, riskReason } = useOrderRisk()

// Dashboard potrzebuje obu źródeł - ładowanie i błąd łączymy w jeden stan
const isLoading = computed(() => ordersStore.isLoading || fleetStore.isLoading)
const error = computed(() => ordersStore.error ?? fleetStore.error)

const counts = computed(() => countByStatus(orders.value))
const activeCount = computed(() => orders.value.length - counts.value.delivered)
const operationalVehicles = computed(() => vehicles.value.filter((v) => v.status !== 'service'))
const vehiclesInUse = computed(() => vehicles.value.filter((v) => v.status === 'in_use').length)

const attentionOrders = computed(() =>
  orders.value
    .filter((order) => order.status === 'delayed' || riskReason(order))
    .sort(
      (a, b) =>
        Number(b.status === 'delayed') - Number(a.status === 'delayed') ||
        a.deadline.localeCompare(b.deadline),
    ),
)
const atRiskCount = computed(() => attentionOrders.value.filter((o) => riskReason(o)).length)

const today = computed(() =>
  new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    now.value,
  ),
)
const summary = computed(() =>
  describeDay({
    delayed: counts.value.delayed,
    atRisk: atRiskCount.value,
    pending: counts.value.pending,
  }),
)

const todoItems = computed(() =>
  attentionOrders.value.map((order) => {
    const driver = order.driverId ? fleetStore.driversById.get(order.driverId) : undefined
    const driverName = driver ? formatDriverName(driver) : undefined
    const route = `${order.origin.city} → ${order.destination.city}`
    const isDelayed = order.status === 'delayed'
    return {
      order,
      driver,
      driverName,
      title: driverName
        ? `${driverName} · ${order.customer}`
        : `${order.customer} czeka na kierowcę`,
      detail: isDelayed
        ? `${order.number} · ${route} · termin minął o ${formatTime(order.deadline)}`
        : `${order.number} · ${route} · ${riskReason(order)}`,
      isDelayed,
      reason: riskReason(order) ?? '',
    }
  }),
)

function loadData() {
  ordersStore.fetchOrders()
  fleetStore.fetchFleet()
}

onMounted(loadData)
</script>

<template>
  <LoadingState v-if="isLoading" label="Sprawdzam, co dzieje się na trasach…" />

  <ErrorState v-else-if="error" :message="error" @retry="loadData" />

  <div v-else class="flex flex-col gap-6">
    <header class="flex flex-col gap-1.5">
      <p class="text-sm text-muted first-letter:uppercase">{{ today }}</p>
      <h1 class="text-3xl font-bold tracking-tight text-ink">
        {{ greeting(new Date(now)) }} {{ summary.headline }}
      </h1>
      <p v-if="summary.advice" class="max-w-2xl text-lg text-ink-soft">{{ summary.advice }}</p>
    </header>

    <dl class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="W toku" :value="activeCount" unit="zleceń" />
      <KpiCard
        label="Po terminie"
        :value="counts.delayed"
        :tone="counts.delayed > 0 ? 'danger' : 'default'"
      />
      <KpiCard
        label="Może się spóźnić"
        :value="atRiskCount"
        :tone="atRiskCount > 0 ? 'warning' : 'default'"
      />
      <KpiCard
        label="Auta w drodze"
        :value="vehiclesInUse"
        :unit="`z ${operationalVehicles.length}`"
      />
    </dl>

    <div class="grid gap-4 lg:grid-cols-3">
      <section
        aria-labelledby="todo-heading"
        class="rounded-card bg-surface p-2 shadow-card lg:col-span-2"
      >
        <h2 id="todo-heading" class="px-4 pt-4 pb-2 text-lg font-bold text-ink">
          Twoja lista na teraz
        </h2>
        <p v-if="todoItems.length === 0" class="px-4 pb-4 text-muted">
          Nic pilnego. Wszystkie kursy jadą zgodnie z planem.
        </p>
        <ul v-else>
          <li
            v-for="item in todoItems"
            :key="item.order.id"
            class="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line px-4 py-3.5"
          >
            <InitialsAvatar :name="item.driverName" />
            <div class="min-w-0 flex-[1_1_16rem]">
              <p class="font-semibold text-ink">{{ item.title }}</p>
              <p class="text-sm text-muted">{{ item.detail }}</p>
            </div>
            <StatusBadge v-if="item.isDelayed" label="Po terminie" tone="red" />
            <RiskBadge v-else :reason="item.reason" />

            <a
              v-if="item.driver"
              :href="toTelHref(item.driver.phone)"
              class="ml-auto inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Zadzwoń<span class="sr-only"> do: {{ item.driverName }}</span>
            </a>
            <RouterLink
              v-else
              :to="{ name: 'order-details', params: { id: item.order.id } }"
              class="ml-auto inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Przypisz<span class="sr-only"> zlecenie {{ item.order.number }}</span>
            </RouterLink>
          </li>
        </ul>
      </section>

      <BaseCard title="Zlecenia według statusu">
        <OrdersByStatusChart :counts="counts" />
      </BaseCard>
    </div>
  </div>
</template>
