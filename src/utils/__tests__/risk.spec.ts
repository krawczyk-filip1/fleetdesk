import { describe, it, expect } from 'vitest'
import type { Order } from '@/types'
import { orders } from '@/mocks/data/orders'
import { getRiskReason } from '../risk'

// Stały "teraz" - test daje ten sam wynik niezależnie od dnia uruchomienia
const NOW = new Date('2026-10-28T12:00:00Z').getTime()
const inHours = (h: number) => new Date(NOW + h * 60 * 60 * 1000).toISOString()

function makeOrder(overrides: Partial<Order>): Order {
  return { ...orders[0]!, pickupAt: inHours(5), deadline: inHours(10), ...overrides }
}

describe('getRiskReason', () => {
  it('zwraca null, gdy do odbioru i terminu jest dużo czasu', () => {
    expect(getRiskReason(makeOrder({ status: 'pending' }), NOW)).toBeNull()
  })

  it('ostrzega, gdy zlecenie bez kierowcy ma odbiór za mniej niż 2 h', () => {
    const order = makeOrder({ status: 'pending', pickupAt: inHours(1) })
    expect(getRiskReason(order, NOW)).toBe('Brak kierowcy, a odbiór za mniej niż 2 h')
  })

  it('ostrzega, gdy do terminu dostawy zostały mniej niż 2 h', () => {
    const order = makeOrder({ status: 'in_transit', pickupAt: inHours(-3), deadline: inHours(1.5) })
    expect(getRiskReason(order, NOW)).toBe('Mniej niż 2 h do terminu dostawy')
  })

  it('ostrzega, gdy termin minął, a status nie został zmieniony', () => {
    const order = makeOrder({ status: 'in_transit', deadline: inHours(-0.5) })
    expect(getRiskReason(order, NOW)).toBe('Termin dostawy minął')
  })

  it('pomija zlecenia dostarczone i już oznaczone jako opóźnione', () => {
    expect(getRiskReason(makeOrder({ status: 'delivered', deadline: inHours(-1) }), NOW)).toBeNull()
    expect(getRiskReason(makeOrder({ status: 'delayed', deadline: inHours(-1) }), NOW)).toBeNull()
  })
})
