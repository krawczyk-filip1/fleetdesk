import { describe, it, expect } from 'vitest'
import { orders } from '../data/orders'
import { drivers, vehicles } from '../data/fleet'
import { isActiveOrder } from '@/utils/orders'

describe('dane mock API', () => {
  const activeOrders = orders.filter(isActiveOrder)

  it('kierowca i pojazd z aktywnym zleceniem są oznaczeni jako zajęci', () => {
    for (const order of activeOrders) {
      const driver = drivers.find((d) => d.id === order.driverId)
      const vehicle = vehicles.find((v) => v.id === order.vehicleId)
      // Porównujemy obiekty z numerem zlecenia - przy błędzie od razu widać, którego dotyczy
      expect({ order: order.number, driver: driver?.status, vehicle: vehicle?.status }).toEqual({
        order: order.number,
        driver: 'on_route',
        vehicle: 'in_use',
      })
    }
  })

  it('nikt nie ma dwóch aktywnych zleceń naraz', () => {
    const driverIds = activeOrders.map((o) => o.driverId)
    const vehicleIds = activeOrders.map((o) => o.vehicleId)
    expect(new Set(driverIds).size).toBe(driverIds.length)
    expect(new Set(vehicleIds).size).toBe(vehicleIds.length)
  })

  it('każdy przypisany ładunek mieści się w pojeździe', () => {
    for (const order of orders.filter((o) => o.vehicleId)) {
      const vehicle = vehicles.find((v) => v.id === order.vehicleId)!
      expect(order.cargo.weightKg).toBeLessThanOrEqual(vehicle.capacityKg)
      expect(order.cargo.pallets).toBeLessThanOrEqual(vehicle.palletSlots)
    }
  })
})
