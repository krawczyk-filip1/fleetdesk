import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, ref } from 'vue'
import type { GeoPoint, Vehicle } from '@/types'
import { vehicles as mockVehicles } from '@/mocks/data/fleet'
import { useVehicleSimulation } from '../useVehicleSimulation'

const moving: Vehicle = { ...mockVehicles[0]!, id: 'a', position: { lat: 50, lng: 19 } }
const parked: Vehicle = { ...mockVehicles[0]!, id: 'b', position: { lat: 52, lng: 21 } }
const target: GeoPoint = { lat: 50, lng: 20 }

function setup() {
  let result!: ReturnType<typeof useVehicleSimulation>
  const wrapper = mount(
    defineComponent({
      setup() {
        // Cel ma tylko pojazd "a" - "b" powinien stać w miejscu
        result = useVehicleSimulation(ref([moving, parked]), ref(new Map([['a', target]])), 1000)
        return () => null
      },
    }),
  )
  return { wrapper, position: (id: string) => result.positions.value.get(id) }
}

describe('useVehicleSimulation', () => {
  afterEach(() => vi.useRealTimers())

  it('co interwał przesuwa pojazd z celem, a pozostałe zostawia', () => {
    vi.useFakeTimers()
    const { position } = setup()

    expect(position('a')).toEqual({ lat: 50, lng: 19 })

    vi.advanceTimersByTime(1000)

    expect(position('a')!.lng).toBeGreaterThan(19)
    expect(position('a')!.lng).toBeLessThan(20)
    expect(position('b')).toEqual({ lat: 52, lng: 21 })
  })

  it('zatrzymuje się w celu i przestaje liczyć po odmontowaniu', () => {
    vi.useFakeTimers()
    const { wrapper, position } = setup()

    // 1° przy kroku 0,03° = 34 ticki; dajemy zapas
    vi.advanceTimersByTime(60_000)
    expect(position('a')).toEqual(target)

    wrapper.unmount()
    expect(vi.getTimerCount()).toBe(0)
  })
})
