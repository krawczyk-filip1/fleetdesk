import type { BadgeTone, DriverStatus, OrderStatus, VehicleStatus, VehicleType } from '@/types'

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Oczekuje',
  assigned: 'Przypisane',
  in_transit: 'W trasie',
  delivered: 'Dostarczone',
  delayed: 'Opóźnione',
}

// Kolejność procesu - używana w selekcie i przy sortowaniu po statusie
export const ORDER_STATUSES = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]

export const DRIVER_STATUS_LABELS: Record<DriverStatus, string> = {
  available: 'Dostępny',
  on_route: 'Na zleceniu',
  off_duty: 'Poza pracą',
}

export const VEHICLE_STATUS_LABELS: Record<VehicleStatus, string> = {
  available: 'Dostępny',
  in_use: 'W użyciu',
  service: 'Serwis',
}

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  van: 'Bus dostawczy',
  truck: 'Ciężarówka',
  semi: 'Ciągnik z naczepą',
}

export const ORDER_STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  pending: 'gray',
  assigned: 'indigo',
  in_transit: 'blue',
  delivered: 'green',
  delayed: 'red',
}

export const DRIVER_STATUS_TONES: Record<DriverStatus, BadgeTone> = {
  available: 'green',
  on_route: 'blue',
  off_duty: 'gray',
}

export const VEHICLE_STATUS_TONES: Record<VehicleStatus, BadgeTone> = {
  available: 'green',
  in_use: 'blue',
  service: 'amber',
}
