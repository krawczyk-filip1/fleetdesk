import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DashboardView from '../DashboardView.vue'
import { getOrders } from '@/api/orders'
import { getDrivers, getVehicles } from '@/api/fleet'
import { orders } from '@/mocks/data/orders'
import { drivers, vehicles } from '@/mocks/data/fleet'

vi.mock('@/api/orders')
vi.mock('@/api/fleet')

async function mountView() {
  const Stub = { render: () => null }
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/orders', name: 'orders', component: Stub },
      { path: '/orders/:id', name: 'order-details', component: Stub },
    ],
  })
  const wrapper = mount(DashboardView, { global: { plugins: [createPinia(), router] } })
  await flushPromises()
  return wrapper
}

// Wartość KPI po etykiecie: <dt>Etykieta</dt><dd>Wartość</dd>
function kpiValue(wrapper: Awaited<ReturnType<typeof mountView>>, label: string) {
  const term = wrapper.findAll('dt').find((dt) => dt.text().includes(label))!
  return term.element.nextElementSibling?.textContent?.trim()
}

describe('DashboardView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getOrders).mockResolvedValue(orders)
    vi.mocked(getDrivers).mockResolvedValue(drivers)
    vi.mocked(getVehicles).mockResolvedValue(vehicles)
  })

  it('pokazuje KPI wyliczone z danych', async () => {
    const wrapper = await mountView()

    const delivered = orders.filter((o) => o.status === 'delivered').length
    const delayed = orders.filter((o) => o.status === 'delayed').length
    expect(kpiValue(wrapper, 'W toku')).toBe(`${orders.length - delivered} zleceń`)
    expect(kpiValue(wrapper, 'Po terminie')).toBe(String(delayed))
    // Dane mock: 8 z 11 sprawnych pojazdów w użyciu (1 w serwisie)
    expect(kpiValue(wrapper, 'Auta w drodze')).toBe('8 z 11')
  })

  it('wita dyspozytora podsumowaniem dnia zwykłymi zdaniami', async () => {
    const wrapper = await mountView()

    // Dane mock mają 2 opóźnione zlecenia
    expect(wrapper.get('h1').text()).toContain('2 kursy są już po terminie.')
  })

  it('lista "na teraz" ma opóźnione i zagrożone zlecenia z następnym krokiem', async () => {
    const wrapper = await mountView()

    const text = wrapper.get('section[aria-labelledby="todo-heading"]').text()
    for (const order of orders.filter((o) => o.status === 'delayed')) {
      expect(text).toContain(order.number)
    }
    expect(text).toContain('Może się spóźnić')
    // Z kierowcą: telefon (link tel:), bez kierowcy: przypisanie
    expect(wrapper.find('a[href^="tel:"]').exists()).toBe(true)
    expect(text).toContain('Przypisz')
  })

  it('pokazuje błąd, gdy nie uda się wczytać zleceń', async () => {
    vi.mocked(getOrders).mockRejectedValue(new Error('Błąd serwera (500)'))
    const wrapper = await mountView()

    expect(wrapper.get('[role="alert"]').text()).toContain('Błąd serwera (500)')
  })
})
