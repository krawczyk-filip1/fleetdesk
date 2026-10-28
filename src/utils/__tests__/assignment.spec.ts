import { describe, it, expect } from 'vitest'
import type { Driver, Order, Vehicle } from '@/types'
import { orders } from '@/mocks/data/orders'
import { hasErrors, suggestVehicle, validateAssignment } from '../assignment'

const order: Order = {
  ...orders[0]!,
  cargo: { description: 'Meble', weightKg: 2500, pallets: 10 },
}

const driver: Driver = {
  id: 'd1',
  firstName: 'Anna',
  lastName: 'Kowalska',
  phone: '',
  status: 'available',
}

const vehicle: Vehicle = {
  id: 'v1',
  registration: 'WX 1234A',
  type: 'truck',
  capacityKg: 8000,
  palletSlots: 15,
  status: 'available',
  position: { lat: 0, lng: 0 },
}

describe('validateAssignment', () => {
  it('przepuszcza dostępnego kierowcę i wystarczająco duży pojazd', () => {
    expect(hasErrors(validateAssignment(order, driver, vehicle))).toBe(false)
  })

  it('wymaga wybrania kierowcy i pojazdu', () => {
    expect(validateAssignment(order, undefined, undefined)).toEqual({
      driverId: 'Wybierz kierowcę',
      vehicleId: 'Wybierz pojazd',
    })
  })

  it('odrzuca niedostępnego kierowcę i pojazd w serwisie', () => {
    const errors = validateAssignment(
      order,
      { ...driver, status: 'on_route' },
      { ...vehicle, status: 'service' },
    )
    expect(errors.driverId).toBe('Kierowca jest niedostępny (na zleceniu)')
    expect(errors.vehicleId).toBe('Pojazd jest niedostępny (serwis)')
  })

  it('odrzuca pojazd za mały na ładunek', () => {
    const errors = validateAssignment(order, driver, { ...vehicle, capacityKg: 1000 })
    expect(errors.vehicleId).toBe('Pojazd za mały: ładunek 2500 kg, ładowność 1000 kg')
  })

  it('odrzuca pojazd ze zbyt małą liczbą miejsc paletowych', () => {
    const errors = validateAssignment(order, driver, { ...vehicle, palletSlots: 6 })
    expect(errors.vehicleId).toBe('Za mało miejsc paletowych: 10 palet, 6 miejsc')
  })
})

describe('suggestVehicle', () => {
  const van = { ...vehicle, id: 'van', capacityKg: 1000, palletSlots: 6 }
  const truck = { ...vehicle, id: 'truck', capacityKg: 8000, palletSlots: 15 }
  const semi = { ...vehicle, id: 'semi', capacityKg: 24000, palletSlots: 33 }

  it('wybiera najmniejszy pojazd, który pomieści ładunek', () => {
    // 2500 kg i 10 palet: bus za mały, ciężarówka wystarczy - ciągnik byłby marnotrawstwem
    expect(suggestVehicle(order, [semi, van, truck])?.id).toBe('truck')
  })

  it('pomija pojazdy zajęte i w serwisie', () => {
    const busyTruck = { ...truck, status: 'in_use' as const }
    expect(suggestVehicle(order, [busyTruck, semi])?.id).toBe('semi')
  })

  it('zwraca undefined, gdy żaden wolny pojazd nie pasuje', () => {
    expect(suggestVehicle(order, [van])).toBeUndefined()
  })
})
