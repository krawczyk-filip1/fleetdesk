import type { Order } from '@/types'

export const AT_RISK_HOURS = 2

const HOUR_MS = 60 * 60 * 1000

// `now` jako parametr, a nie Date.now() w środku - w testach ustawiamy dowolny "teraz".
export function getRiskReason(order: Order, now: number): string | null {
  // Dostarczone są zakończone, a opóźnione już mają swój (czerwony) status
  if (order.status === 'delivered' || order.status === 'delayed') return null

  const msToDeadline = Date.parse(order.deadline) - now
  const msToPickup = Date.parse(order.pickupAt) - now

  if (msToDeadline <= 0) return 'Termin dostawy minął'
  if (order.status === 'pending' && msToPickup < AT_RISK_HOURS * HOUR_MS) {
    return `Brak kierowcy, a odbiór za mniej niż ${AT_RISK_HOURS} h`
  }
  if (msToDeadline < AT_RISK_HOURS * HOUR_MS) {
    return `Mniej niż ${AT_RISK_HOURS} h do terminu dostawy`
  }
  return null
}
