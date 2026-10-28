import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import FleetView from '../FleetView.vue'
import { getDrivers, getVehicles } from '@/api/fleet'
import { getOrders } from '@/api/orders'
import { drivers, vehicles } from '@/mocks/data/fleet'
import { orders } from '@/mocks/data/orders'

vi.mock('@/api/fleet')
vi.mock('@/api/orders')

async function mountView() {
  const Stub = { render: () => null }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/orders/:id', name: 'order-details', component: Stub }],
  })
  const wrapper = mount(FleetView, { global: { plugins: [createPinia(), router] } })
  await flushPromises()
  return wrapper
}

function rowCount(wrapper: Awaited<ReturnType<typeof mountView>>, headingId: string) {
  return wrapper.findAll(`section[aria-labelledby="${headingId}"] tbody tr`).length
}

describe('FleetView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getDrivers).mockResolvedValue(drivers)
    vi.mocked(getVehicles).mockResolvedValue(vehicles)
    vi.mocked(getOrders).mockResolvedValue(orders)
  })

  it('pokazuje wszystkich kierowców i pojazdy z aktualnym zleceniem', async () => {
    const wrapper = await mountView()

    expect(rowCount(wrapper, 'drivers-heading')).toBe(drivers.length)
    expect(rowCount(wrapper, 'vehicles-heading')).toBe(vehicles.length)

    // Anna Kowalska (d2) wiezie zlecenie "W trasie" - w jej wierszu jest link do niego
    const activeOrder = orders.find((o) => o.driverId === 'd2' && o.status === 'in_transit')!
    const annaRow = wrapper.findAll('tbody tr').find((tr) => tr.text().includes('Anna Kowalska'))!
    expect(annaRow.text()).toContain(activeOrder.number)
  })

  it('po zaznaczeniu "tylko dostępnych" ukrywa zajętych', async () => {
    const wrapper = await mountView()

    await wrapper.get('input[type="checkbox"]').setValue(true)

    const availableCount = drivers.filter((d) => d.status === 'available').length
    expect(rowCount(wrapper, 'drivers-heading')).toBe(availableCount)
    expect(wrapper.text()).not.toContain('Anna Kowalska')
  })
})
