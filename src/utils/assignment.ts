import type { AssignmentErrors, Driver, Order, Vehicle } from '@/types'
import { DRIVER_STATUS_LABELS, VEHICLE_STATUS_LABELS } from '@/constants/labels'
import { formatWeight } from './format'

// Te same reguły działają w formularzu i w mock API - serwer nie ufa klientowi
// (ktoś mógł w międzyczasie zająć kierowcę).
export function validateAssignment(
  order: Order,
  driver: Driver | undefined,
  vehicle: Vehicle | undefined,
): AssignmentErrors {
  const errors: AssignmentErrors = {}

  if (!driver) {
    errors.driverId = 'Wybierz kierowcę'
  } else if (driver.status !== 'available') {
    errors.driverId = `Kierowca jest niedostępny (${DRIVER_STATUS_LABELS[driver.status].toLowerCase()})`
  }

  // else if: pokazujemy jeden, najważniejszy błąd pojazdu naraz
  if (!vehicle) {
    errors.vehicleId = 'Wybierz pojazd'
  } else if (vehicle.status !== 'available') {
    errors.vehicleId = `Pojazd jest niedostępny (${VEHICLE_STATUS_LABELS[vehicle.status].toLowerCase()})`
  } else if (order.cargo.weightKg > vehicle.capacityKg) {
    errors.vehicleId = `Pojazd za mały: ładunek ${formatWeight(order.cargo.weightKg)}, ładowność ${formatWeight(vehicle.capacityKg)}`
  } else if (order.cargo.pallets > vehicle.palletSlots) {
    errors.vehicleId = `Za mało miejsc paletowych: ${order.cargo.pallets} palet, ${vehicle.palletSlots} miejsc`
  }

  return errors
}

export function hasErrors(errors: AssignmentErrors): boolean {
  return Object.keys(errors).length > 0
}

// Najmniejszy pasujący - żeby nie wysyłać ciągnika z naczepą po 3 palety.
export function suggestVehicle(order: Order, vehicles: Vehicle[]): Vehicle | undefined {
  return vehicles
    .filter(
      (v) =>
        v.status === 'available' &&
        v.capacityKg >= order.cargo.weightKg &&
        v.palletSlots >= order.cargo.pallets,
    )
    .sort((a, b) => a.capacityKg - b.capacityKg)[0]
}
