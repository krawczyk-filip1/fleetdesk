import { describe, it, expect } from 'vitest'
import type { Vehicle } from '@/types'
import { orders } from '@/mocks/data/orders'
import { vehicles } from '@/mocks/data/fleet'
import { countByStatus, fleetUtilization } from '../stats'

describe('countByStatus', () => {
  it('liczy zlecenia w każdym statusie i zwraca zera dla pustej listy', () => {
    const pending = { ...orders[0]!, status: 'pending' as const }
    const delayed = { ...orders[0]!, status: 'delayed' as const }

    expect(countByStatus([pending, pending, delayed])).toEqual({
      pending: 2,
      assigned: 0,
      in_transit: 0,
      delivered: 0,
      delayed: 1,
    })
    expect(Object.values(countByStatus([]))).toEqual([0, 0, 0, 0, 0])
  })
})

describe('fleetUtilization', () => {
  const base = vehicles[0]!
  const withStatus = (status: Vehicle['status']): Vehicle => ({ ...base, status })

  it('liczy procent sprawnych pojazdów w użyciu, pomijając serwis', () => {
    // 1 z 2 sprawnych w użyciu = 50%; pojazd w serwisie nie liczy się do mianownika
    const fleet = [withStatus('in_use'), withStatus('available'), withStatus('service')]
    expect(fleetUtilization(fleet)).toBe(50)
  })

  it('zwraca 0 dla pustej floty zamiast dzielić przez zero', () => {
    expect(fleetUtilization([])).toBe(0)
  })
})
