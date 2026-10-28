import type { GeoPoint } from '@/types'

// Uproszczenie na potrzeby symulacji: linia prosta, a prawdziwy pojazd jedzie po drogach.
export function moveTowards(from: GeoPoint, to: GeoPoint, maxStep: number): GeoPoint {
  const dLat = to.lat - from.lat
  const dLng = to.lng - from.lng
  const distance = Math.hypot(dLat, dLng)

  if (distance <= maxStep) return { ...to }

  const ratio = maxStep / distance
  return { lat: from.lat + dLat * ratio, lng: from.lng + dLng * ratio }
}

const EARTH_RADIUS_KM = 6371
const toRadians = (degrees: number) => (degrees * Math.PI) / 180

/** Odległość "w linii prostej" po powierzchni Ziemi (wzór haversine) */
export function distanceKm(a: GeoPoint, b: GeoPoint): number {
  const dLat = toRadians(b.lat - a.lat)
  const dLng = toRadians(b.lng - a.lng)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h))
}
