<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AssignmentErrors, Driver, Order, Vehicle } from '@/types'
import {
  DRIVER_STATUS_LABELS,
  VEHICLE_STATUS_LABELS,
  VEHICLE_TYPE_LABELS,
} from '@/constants/labels'
import { hasErrors, validateAssignment } from '@/utils/assignment'
import { formatDriverName, formatWeight } from '@/utils/format'
import { ApiRequestError, getErrorMessage } from '@/api/http'
import { useOrdersStore } from '@/stores/orders'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const props = defineProps<{
  order: Order
  drivers: Driver[]
  vehicles: Vehicle[]
}>()

const emit = defineEmits<{ assigned: [order: Order] }>()

const ordersStore = useOrdersStore()

const driverId = ref('')
const vehicleId = ref('')
const hasSubmitted = ref(false)
const isSubmitting = ref(false)
const serverErrors = ref<AssignmentErrors>({})
const generalError = ref<string | null>(null)

// Pokazujemy wszystkich, a nie tylko dostępnych: dyspozytor widzi, dlaczego ktoś odpada.
// Dostępni są na górze listy.
const byAvailability = (a: { status: string }, b: { status: string }) =>
  Number(b.status === 'available') - Number(a.status === 'available')

const driverOptions = computed(() =>
  [...props.drivers].sort(byAvailability).map((d) => ({
    value: d.id,
    label: `${formatDriverName(d)} – ${DRIVER_STATUS_LABELS[d.status]}`,
  })),
)

const vehicleOptions = computed(() =>
  [...props.vehicles].sort(byAvailability).map((v) => ({
    value: v.id,
    label: `${v.registration} · ${VEHICLE_TYPE_LABELS[v.type]} · ${formatWeight(v.capacityKg)} – ${VEHICLE_STATUS_LABELS[v.status]}`,
  })),
)

const selectedDriver = computed(() => props.drivers.find((d) => d.id === driverId.value))
const selectedVehicle = computed(() => props.vehicles.find((v) => v.id === vehicleId.value))

const clientErrors = computed(() =>
  validateAssignment(props.order, selectedDriver.value, selectedVehicle.value),
)

// Po zmianie wyboru stary błąd z serwera jest już nieaktualny
watch([driverId, vehicleId], () => {
  serverErrors.value = {}
  generalError.value = null
})

// "Wybierz kierowcę" dopiero po kliknięciu "Przypisz", żeby nie oznaczać błędem pustego formularza.
// Błąd wybranej opcji (np. "pojazd za mały") pokazujemy od razu.
function fieldError(field: 'driverId' | 'vehicleId'): string | undefined {
  const isSelected = field === 'driverId' ? driverId.value : vehicleId.value
  if (!isSelected && !hasSubmitted.value) return undefined
  return serverErrors.value[field] ?? clientErrors.value[field]
}

async function submit() {
  hasSubmitted.value = true
  if (hasErrors(clientErrors.value)) return

  isSubmitting.value = true
  try {
    const updated = await ordersStore.assignOrder(props.order.id, {
      driverId: driverId.value,
      vehicleId: vehicleId.value,
    })
    emit('assigned', updated)
  } catch (e) {
    // 422 z serwera: błędy przy konkretnych polach (np. ktoś zajął kierowcę przed chwilą)
    if (e instanceof ApiRequestError && e.fieldErrors) {
      serverErrors.value = e.fieldErrors
    }
    generalError.value = getErrorMessage(e)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="submit">
    <p class="text-sm text-muted">
      Ładunek: {{ formatWeight(order.cargo.weightKg) }}, {{ order.cargo.pallets }} palet
    </p>

    <BaseSelect
      v-model="driverId"
      label="Kierowca"
      placeholder="Wybierz kierowcę…"
      :options="driverOptions"
      :error="fieldError('driverId')"
    />
    <BaseSelect
      v-model="vehicleId"
      label="Pojazd"
      placeholder="Wybierz pojazd…"
      :options="vehicleOptions"
      :error="fieldError('vehicleId')"
    />

    <p v-if="generalError" role="alert" class="text-sm font-medium text-danger">
      {{ generalError }}
    </p>

    <BaseButton type="submit" :disabled="isSubmitting">
      {{ isSubmitting ? 'Przypisywanie…' : 'Przypisz' }}
    </BaseButton>
  </form>
</template>
