import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import type { GeoPoint, Vehicle } from '@/types'
import { moveTowards } from '@/utils/geo'

const STEP_DEGREES = 0.03 // ~3 km

// Pozycje trzymamy lokalnie, a nie w store - to tylko efekt wizualny tej strony.
// W prawdziwej aplikacji przychodziłyby z GPS (np. przez WebSocket).
export function useVehicleSimulation(
  vehicles: Ref<Vehicle[]>,
  destinations: Ref<Map<string, GeoPoint>>,
  intervalMs = 2000,
) {
  const positions = ref(new Map<string, GeoPoint>())

  // watch, bo pojazdy mogą się wczytać już po starcie symulacji.
  watch(
    vehicles,
    (list) => {
      const next = new Map(positions.value)
      for (const vehicle of list) {
        if (!next.has(vehicle.id)) next.set(vehicle.id, vehicle.position)
      }
      positions.value = next
    },
    { immediate: true },
  )

  function tick() {
    // Nowa mapa zamiast zmiany w miejscu - wszystko, co od niej zależy, łatwo się przeliczy
    const next = new Map(positions.value)
    for (const [vehicleId, target] of destinations.value) {
      const current = next.get(vehicleId)
      if (current) next.set(vehicleId, moveTowards(current, target, STEP_DEGREES))
    }
    positions.value = next
  }

  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    timer = setInterval(tick, intervalMs)
  })
  onUnmounted(() => clearInterval(timer))

  return { positions }
}
