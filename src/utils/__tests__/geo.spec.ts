import { describe, it, expect } from 'vitest'
import { distanceKm, moveTowards } from '../geo'

const warszawa = { lat: 52.2297, lng: 21.0122 }
const krakow = { lat: 50.0647, lng: 19.945 }

describe('moveTowards', () => {
  it('przesuwa punkt o podany krok w stronę celu', () => {
    const next = moveTowards({ lat: 0, lng: 0 }, { lat: 0, lng: 10 }, 1)
    expect(next).toEqual({ lat: 0, lng: 1 })
  })

  it('zatrzymuje się na celu zamiast go przeskoczyć', () => {
    const next = moveTowards({ lat: 0, lng: 9.5 }, { lat: 0, lng: 10 }, 1)
    expect(next).toEqual({ lat: 0, lng: 10 })
  })
})

describe('distanceKm', () => {
  it('liczy odległość Warszawa-Kraków w linii prostej (~252 km)', () => {
    expect(distanceKm(warszawa, krakow)).toBeCloseTo(252, -1)
  })

  it('zwraca 0 dla tego samego punktu', () => {
    expect(distanceKm(warszawa, warszawa)).toBe(0)
  })
})
