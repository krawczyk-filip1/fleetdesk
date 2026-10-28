import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { AssignmentPayload, Order } from '@/types'
import { getOrders, patchOrderAssignment } from '@/api/orders'
import { getErrorMessage } from '@/api/http'
import { useFleetStore } from './fleet'

export const useOrdersStore = defineStore('orders', () => {
  // Przypisanie zmienia też statusy kierowcy i pojazdu
  const fleetStore = useFleetStore()

  const orders = ref<Order[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchOrders() {
    isLoading.value = true
    error.value = null
    try {
      orders.value = await getOrders()
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      isLoading.value = false
    }
  }

  // Błędy (np. 422) rzucamy dalej - tylko formularz wie, przy którym polu pokazać komunikat.
  async function assignOrder(orderId: string, payload: AssignmentPayload): Promise<Order> {
    const result = await patchOrderAssignment(orderId, payload)

    orders.value = orders.value.map((o) => (o.id === result.order.id ? result.order : o))
    fleetStore.replaceDriver(result.driver)
    fleetStore.replaceVehicle(result.vehicle)

    return result.order
  }

  return { orders, isLoading, error, fetchOrders, assignOrder }
})
