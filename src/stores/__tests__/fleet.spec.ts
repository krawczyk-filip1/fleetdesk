import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFleetStore } from '../fleet'
import { getDrivers, getVehicles } from '@/api/fleet'
import { drivers, vehicles } from '@/mocks/data/fleet'

vi.mock('@/api/fleet')

describe('useFleetStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('wczytuje kierowców i pojazdy oraz wylicza dostępnych', async () => {
    vi.mocked(getDrivers).mockResolvedValue(drivers)
    vi.mocked(getVehicles).mockResolvedValue(vehicles)
    const store = useFleetStore()

    await store.fetchFleet()

    expect(store.drivers).toHaveLength(drivers.length)
    expect(store.availableDrivers.every((d) => d.status === 'available')).toBe(true)
    expect(store.availableVehicles.map((v) => v.registration)).toContain('PZ 7745E')
    expect(store.driversById.get('d2')?.lastName).toBe('Kowalska')
  })

  it('przy błędzie jednego z żądań zapisuje komunikat', async () => {
    vi.mocked(getDrivers).mockResolvedValue(drivers)
    vi.mocked(getVehicles).mockRejectedValue(new Error('Brak połączenia z serwerem'))
    const store = useFleetStore()

    await store.fetchFleet()

    expect(store.error).toBe('Brak połączenia z serwerem')
    expect(store.isLoading).toBe(false)
  })
})
