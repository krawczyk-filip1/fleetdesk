import type { Driver, Vehicle } from '@/types'
import { request } from './http'

export function getDrivers(): Promise<Driver[]> {
  return request<Driver[]>('/api/drivers')
}

export function getVehicles(): Promise<Vehicle[]> {
  return request<Vehicle[]>('/api/vehicles')
}
