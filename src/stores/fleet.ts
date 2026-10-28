import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { Driver, Vehicle } from '@/types'
import { getDrivers, getVehicles } from '@/api/fleet'
import { getErrorMessage } from '@/api/http'

export const useFleetStore = defineStore('fleet', () => {
  const drivers = ref<Driver[]>([])
  const vehicles = ref<Vehicle[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const driversById = computed(() => new Map(drivers.value.map((d) => [d.id, d])))
  const vehiclesById = computed(() => new Map(vehicles.value.map((v) => [v.id, v])))

  const availableDrivers = computed(() => drivers.value.filter((d) => d.status === 'available'))
  const availableVehicles = computed(() => vehicles.value.filter((v) => v.status === 'available'))

  function replaceDriver(updated: Driver) {
    drivers.value = drivers.value.map((d) => (d.id === updated.id ? updated : d))
  }

  function replaceVehicle(updated: Vehicle) {
    vehicles.value = vehicles.value.map((v) => (v.id === updated.id ? updated : v))
  }

  async function fetchFleet() {
    isLoading.value = true
    error.value = null
    try {
      const [driverList, vehicleList] = await Promise.all([getDrivers(), getVehicles()])
      drivers.value = driverList
      vehicles.value = vehicleList
    } catch (e) {
      error.value = getErrorMessage(e)
    } finally {
      isLoading.value = false
    }
  }

  return {
    drivers,
    vehicles,
    isLoading,
    error,
    driversById,
    vehiclesById,
    availableDrivers,
    availableVehicles,
    fetchFleet,
    replaceDriver,
    replaceVehicle,
  }
})
