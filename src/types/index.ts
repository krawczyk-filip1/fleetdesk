// Daty trzymamy jako stringi ISO 8601 - tak przychodzą z API (JSON nie ma typu Date).

export interface GeoPoint {
  lat: number
  lng: number
}

export interface Location {
  city: string
  address: string
  coords: GeoPoint
}

export type OrderStatus = 'pending' | 'assigned' | 'in_transit' | 'delivered' | 'delayed'

export interface Cargo {
  description: string
  weightKg: number
  pallets: number
}

export interface StatusChange {
  status: OrderStatus
  changedAt: string
  note?: string
}

export interface Order {
  id: string
  number: string
  customer: string
  origin: Location
  destination: Location
  cargo: Cargo
  pickupAt: string
  deadline: string
  status: OrderStatus
  driverId: string | null
  vehicleId: string | null
  statusHistory: StatusChange[]
  createdAt: string
}

/** Wartości filtrów listy zleceń. Pusty string = filtr wyłączony. */
export interface OrderFilterValues {
  status: OrderStatus | ''
  /** ID kierowcy albo UNASSIGNED_DRIVER (zlecenia bez kierowcy) */
  driverId: string
  /** Zakres terminu dostawy, format z <input type="date">: RRRR-MM-DD */
  dateFrom: string
  dateTo: string
  search: string
}

export interface AssignmentPayload {
  driverId: string
  vehicleId: string
}

export type AssignmentErrors = Partial<Record<keyof AssignmentPayload, string>>

export interface AssignmentResult {
  order: Order
  driver: Driver
  vehicle: Vehicle
}

export type DriverStatus = 'available' | 'on_route' | 'off_duty'

export interface Driver {
  id: string
  firstName: string
  lastName: string
  phone: string
  status: DriverStatus
}

/** van = bus dostawczy, truck = ciężarówka (solo), semi = ciągnik z naczepą */
export type VehicleType = 'van' | 'truck' | 'semi'

export type VehicleStatus = 'available' | 'in_use' | 'service'

export interface Vehicle {
  id: string
  registration: string
  type: VehicleType
  capacityKg: number
  palletSlots: number
  status: VehicleStatus
  position: GeoPoint
}

export interface ApiError {
  message: string
  fieldErrors?: FieldErrors
}

export type FieldErrors = Partial<Record<string, string>>

export type BadgeTone = 'gray' | 'blue' | 'indigo' | 'green' | 'red' | 'amber'

export interface TableColumn {
  /** Nazwa pola w wierszu i nazwa slotu: `#cell-<key>` */
  key: string
  label: string
  align?: 'left' | 'right'
  sortable?: boolean
}

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  key: string
  direction: SortDirection
}
