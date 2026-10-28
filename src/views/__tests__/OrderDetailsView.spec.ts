import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import OrderDetailsView from '../OrderDetailsView.vue'
import { getOrder } from '@/api/orders'
import { getDrivers, getVehicles } from '@/api/fleet'
import { ApiRequestError } from '@/api/http'
import { orders } from '@/mocks/data/orders'
import { drivers, vehicles } from '@/mocks/data/fleet'

vi.mock('@/api/orders')
vi.mock('@/api/fleet')

function mountView(id: string) {
  const Stub = { render: () => null }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/orders', name: 'orders', component: Stub },
      { path: '/orders/:id', name: 'order-details', component: Stub },
    ],
  })
  return mount(OrderDetailsView, {
    props: { id },
    global: { plugins: [createPinia(), router] },
  })
}

describe('OrderDetailsView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getDrivers).mockResolvedValue(drivers)
    vi.mocked(getVehicles).mockResolvedValue(vehicles)
  })

  it('pokazuje szczegóły zlecenia z kierowcą i pojazdem', async () => {
    // Zlecenie "W trasie" z przypisanym kierowcą (Anna Kowalska) i pojazdem KR 7310M
    const order = orders.find((o) => o.driverId === 'd2' && o.status === 'in_transit')!
    vi.mocked(getOrder).mockResolvedValue(order)

    const wrapper = mountView(order.id)
    await flushPromises()

    expect(getOrder).toHaveBeenCalledWith(order.id)
    expect(wrapper.get('h1').text()).toBe(`Zlecenie ${order.number}`)
    expect(wrapper.text()).toContain('Anna Kowalska')
    expect(wrapper.text()).toContain('KR 7310M')
    expect(wrapper.findAll('ol li')).toHaveLength(order.statusHistory.length)
  })

  it('pokazuje komunikat "nie znaleziono", gdy API zwróci 404', async () => {
    vi.mocked(getOrder).mockRejectedValue(new ApiRequestError(404, 'Nie znaleziono zlecenia'))

    const wrapper = mountView('nie-istnieje')
    await flushPromises()

    expect(wrapper.text()).toContain('Nie znaleziono zlecenia')
    expect(wrapper.find('[role="alert"]').exists()).toBe(false)
  })
})
