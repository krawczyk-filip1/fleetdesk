import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import MapView from '../MapView.vue'
import { getDrivers, getVehicles } from '@/api/fleet'
import { getOrders } from '@/api/orders'
import { drivers, vehicles } from '@/mocks/data/fleet'
import { orders } from '@/mocks/data/orders'

vi.mock('@/api/fleet')
vi.mock('@/api/orders')

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/orders/:id', name: 'order-details', component: { render: () => null } }],
  })
  const wrapper = mount(MapView, {
    // Leaflet potrzebuje prawdziwej przeglądarki (wymiary, canvas) - w teście podmieniamy
    // mapę na zaślepkę i sprawdzamy, jakie dane widok jej przekazuje
    global: { plugins: [createPinia(), router], stubs: { FleetMap: true } },
  })
  await flushPromises()
  return wrapper
}

describe('MapView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getDrivers).mockResolvedValue(drivers)
    vi.mocked(getVehicles).mockResolvedValue(vehicles)
    vi.mocked(getOrders).mockResolvedValue(orders)
  })

  it('przekazuje mapie znacznik dla każdego pojazdu', async () => {
    const wrapper = await mountView()

    const markers = wrapper.findComponent({ name: 'FleetMap' }).props('markers')
    expect(markers).toHaveLength(vehicles.length)
  })

  it('wypisuje pojazdy w trasie z kierowcą i odległością do celu', async () => {
    const wrapper = await mountView()

    const inRoute = orders.filter((o) => o.status === 'in_transit' || o.status === 'delayed')
    const items = wrapper.findAll('section li')
    expect(items).toHaveLength(inRoute.length)
    // Anna Kowalska wiezie towar z Warszawy do Gdańska autem KR 7310M
    const anna = items.find((li) => li.text().includes('KR 7310M'))!
    expect(anna.text()).toContain('Anna Kowalska')
    expect(anna.text()).toMatch(/\d+ km/)
  })

  it('kliknięcie pojazdu na liście zaznacza go na mapie', async () => {
    const wrapper = await mountView()

    await wrapper.get('section li button').trigger('click')

    expect(wrapper.findComponent({ name: 'FleetMap' }).props('selectedId')).not.toBeNull()
    expect(wrapper.get('section li button').attributes('aria-pressed')).toBe('true')
  })
})
