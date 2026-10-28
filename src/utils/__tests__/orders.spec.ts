import { describe, it, expect } from 'vitest'
import type { Order, OrderFilterValues } from '@/types'
import { orders as mockOrders } from '@/mocks/data/orders'
import {
  filterOrders,
  mapActiveOrdersBy,
  sortOrders,
  toLocalDateKey,
  UNASSIGNED_DRIVER,
} from '../orders'

function makeOrder(overrides: Partial<Order>): Order {
  return { ...mockOrders[0]!, ...overrides }
}

const NO_FILTERS: OrderFilterValues = {
  status: '',
  driverId: '',
  dateFrom: '',
  dateTo: '',
  search: '',
}

const gdansk = makeOrder({
  id: 'a',
  number: 'ZL/1',
  customer: 'Browar Mazurski',
  destination: { ...mockOrders[0]!.destination, city: 'Gdańsk' },
  status: 'delayed',
  driverId: 'd1',
  deadline: new Date(2026, 9, 10, 12).toISOString(),
  cargo: { description: '', weightKg: 5000, pallets: 10 },
})
const lublin = makeOrder({
  id: 'b',
  number: 'ZL/2',
  customer: 'Agro-Plon',
  destination: { ...mockOrders[0]!.destination, city: 'Lublin' },
  status: 'pending',
  driverId: null,
  deadline: new Date(2026, 9, 20, 12).toISOString(),
  cargo: { description: '', weightKg: 800, pallets: 2 },
})
const orders = [gdansk, lublin]

const ids = (list: Order[]) => list.map((o) => o.id)

describe('filterOrders', () => {
  it('bez filtrów zwraca wszystkie zlecenia', () => {
    expect(ids(filterOrders(orders, NO_FILTERS))).toEqual(['a', 'b'])
  })

  it('filtruje po statusie', () => {
    expect(ids(filterOrders(orders, { ...NO_FILTERS, status: 'delayed' }))).toEqual(['a'])
  })

  it('filtruje po kierowcy i po zleceniach bez kierowcy', () => {
    expect(ids(filterOrders(orders, { ...NO_FILTERS, driverId: 'd1' }))).toEqual(['a'])
    expect(ids(filterOrders(orders, { ...NO_FILTERS, driverId: UNASSIGNED_DRIVER }))).toEqual(['b'])
  })

  it('filtruje po zakresie terminu dostawy (włącznie z granicami)', () => {
    const result = filterOrders(orders, {
      ...NO_FILTERS,
      dateFrom: '2026-10-10',
      dateTo: '2026-10-15',
    })
    expect(ids(result)).toEqual(['a'])
  })

  it('wyszukuje bez względu na wielkość liter, także po mieście', () => {
    expect(ids(filterOrders(orders, { ...NO_FILTERS, search: 'BROWAR' }))).toEqual(['a'])
    expect(ids(filterOrders(orders, { ...NO_FILTERS, search: ' lublin ' }))).toEqual(['b'])
  })
})

describe('sortOrders', () => {
  it('sortuje liczbowo po wadze ładunku w obu kierunkach', () => {
    expect(ids(sortOrders(orders, { key: 'cargo', direction: 'asc' }))).toEqual(['b', 'a'])
    expect(ids(sortOrders(orders, { key: 'cargo', direction: 'desc' }))).toEqual(['a', 'b'])
  })

  it('sortuje po statusie według kolejności procesu, a nie alfabetu', () => {
    // pending jest w procesie przed delayed, choć alfabetycznie "d" < "p"
    expect(ids(sortOrders(orders, { key: 'status', direction: 'asc' }))).toEqual(['b', 'a'])
  })

  it('nie zmienia oryginalnej tablicy', () => {
    sortOrders(orders, { key: 'cargo', direction: 'asc' })
    expect(ids(orders)).toEqual(['a', 'b'])
  })
})

describe('toLocalDateKey', () => {
  it('zwraca datę w formacie RRRR-MM-DD w lokalnej strefie', () => {
    expect(toLocalDateKey(new Date(2026, 0, 5, 23, 30).toISOString())).toBe('2026-01-05')
  })
})

describe('mapActiveOrdersBy', () => {
  it('łączy kierowcę tylko z aktywnym zleceniem (nie z dostarczonym)', () => {
    const active = makeOrder({ id: 'x', driverId: 'd1', status: 'in_transit' })
    const done = makeOrder({ id: 'y', driverId: 'd2', status: 'delivered' })

    const result = mapActiveOrdersBy([active, done], 'driverId')

    expect(result.get('d1')?.id).toBe('x')
    expect(result.has('d2')).toBe(false)
  })
})
