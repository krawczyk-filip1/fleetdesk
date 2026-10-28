import type { Order, OrderStatus, Vehicle } from '@/types'
import { ORDER_STATUSES } from '@/constants/labels'

// Każdy status obecny w wyniku, także z zerem
export function countByStatus(orders: Order[]): Record<OrderStatus, number> {
  const counts = Object.fromEntries(ORDER_STATUSES.map((status) => [status, 0])) as Record<
    OrderStatus,
    number
  >
  for (const order of orders) counts[order.status]++
  return counts
}

// Pojazdy w serwisie nie wchodzą do mianownika - i tak nie można ich użyć.
export function fleetUtilization(vehicles: Vehicle[]): number {
  const operational = vehicles.filter((v) => v.status !== 'service')
  if (operational.length === 0) return 0
  const inUse = operational.filter((v) => v.status === 'in_use').length
  return Math.round((inUse / operational.length) * 100)
}
