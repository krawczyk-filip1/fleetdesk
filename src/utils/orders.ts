import type { Order, OrderFilterValues, OrderStatus, SortState } from '@/types'
import { ORDER_STATUSES } from '@/constants/labels'

export const UNASSIGNED_DRIVER = 'none'

export function isOrderStatus(value: string): value is OrderStatus {
  return (ORDER_STATUSES as string[]).includes(value)
}

/** ISO -> "RRRR-MM-DD" w lokalnej strefie (ten sam format co <input type="date">) */
export function toLocalDateKey(iso: string): string {
  const date = new Date(iso)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

function matchesSearch(order: Order, query: string): boolean {
  const searchable = [order.number, order.customer, order.origin.city, order.destination.city]
  return searchable.some((text) => text.toLowerCase().includes(query))
}

export function filterOrders(orders: Order[], filters: OrderFilterValues): Order[] {
  const query = filters.search.trim().toLowerCase()

  return orders.filter((order) => {
    if (filters.status && order.status !== filters.status) return false

    if (filters.driverId === UNASSIGNED_DRIVER) {
      if (order.driverId !== null) return false
    } else if (filters.driverId && order.driverId !== filters.driverId) {
      return false
    }

    // Daty "RRRR-MM-DD" można porównywać jak zwykłe stringi - kolejność się zgadza
    const deadlineDay = toLocalDateKey(order.deadline)
    if (filters.dateFrom && deadlineDay < filters.dateFrom) return false
    if (filters.dateTo && deadlineDay > filters.dateTo) return false

    if (query && !matchesSearch(order, query)) return false

    return true
  })
}

const sortValueGetters = {
  number: (order: Order) => order.number,
  customer: (order: Order) => order.customer,
  cargo: (order: Order) => order.cargo.weightKg,
  deadline: (order: Order) => order.deadline,
  status: (order: Order) => ORDER_STATUSES.indexOf(order.status),
}

export type OrderSortKey = keyof typeof sortValueGetters

export function isOrderSortKey(value: string): value is OrderSortKey {
  return value in sortValueGetters
}

export function sortOrders(orders: Order[], sort: SortState): Order[] {
  if (!isOrderSortKey(sort.key)) return orders

  const getValue = sortValueGetters[sort.key]
  const direction = sort.direction === 'asc' ? 1 : -1

  return [...orders].sort((a, b) => {
    const valueA = getValue(a)
    const valueB = getValue(b)
    const result =
      typeof valueA === 'number' && typeof valueB === 'number'
        ? valueA - valueB
        : String(valueA).localeCompare(String(valueB), 'pl')
    return result * direction
  })
}

export function isActiveOrder(order: Order): boolean {
  return order.status === 'assigned' || order.status === 'in_transit' || order.status === 'delayed'
}

// Jedno przejście po zleceniach zamiast szukania osobno dla każdego wiersza tabeli.
export function mapActiveOrdersBy(orders: Order[], field: 'driverId' | 'vehicleId') {
  const result = new Map<string, Order>()
  for (const order of orders) {
    const id = order[field]
    if (id && isActiveOrder(order)) result.set(id, order)
  }
  return result
}
