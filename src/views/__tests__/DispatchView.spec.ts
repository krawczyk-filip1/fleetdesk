import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import DispatchView from '../DispatchView.vue'
import { getOrders, patchOrderAssignment } from '@/api/orders'
import { getDrivers, getVehicles } from '@/api/fleet'
import { ApiRequestError } from '@/api/http'
import { orders } from '@/mocks/data/orders'
import { drivers, vehicles } from '@/mocks/data/fleet'

vi.mock('@/api/orders')
vi.mock('@/api/fleet')

async function mountView() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/orders/:id', name: 'order-details', component: { render: () => null } }],
  })
  const wrapper = mount(DispatchView, { global: { plugins: [createPinia(), router] } })
  await flushPromises()
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountView>>

// Przeciągnięcie = dragstart na karcie zlecenia, potem dragover i drop na karcie kierowcy.
// jsdom nie ma DataTransfer - widok obsługuje jego brak, więc wystarczą same zdarzenia.
async function dragOrderToDriver(wrapper: Wrapper, orderNumber: string, driverName: string) {
  const orderCard = wrapper.findAll('article').find((a) => a.text().includes(orderNumber))!
  const driverCard = wrapper
    .findAll('section[aria-labelledby="drivers-heading"] li > div')
    .find((d) => d.text().includes(driverName))!

  await orderCard.trigger('dragstart')
  await driverCard.trigger('dragover')
  await driverCard.trigger('drop')
  await flushPromises()
}

describe('DispatchView', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.mocked(getOrders).mockResolvedValue(orders)
    vi.mocked(getDrivers).mockResolvedValue(drivers)
    vi.mocked(getVehicles).mockResolvedValue(vehicles)
  })

  it('pokazuje oczekujące zlecenia i dostępnych kierowców', async () => {
    const wrapper = await mountView()

    const pending = orders.filter((o) => o.status === 'pending')
    expect(wrapper.findAll('article')).toHaveLength(pending.length)
    expect(wrapper.text()).toContain('Agnieszka Lewandowska')
    expect(wrapper.text()).not.toContain('Anna Kowalska') // na zleceniu
  })

  it('po upuszczeniu przypisuje zlecenie z automatycznie dobranym pojazdem', async () => {
    // o3: 2500 kg, 10 palet -> najmniejszy pasujący wolny pojazd to ciężarówka EL 2290S (v12)
    const order = orders.find((o) => o.id === 'o3')!
    vi.mocked(patchOrderAssignment).mockResolvedValue({
      order: { ...order, status: 'assigned', driverId: 'd6', vehicleId: 'v12' },
      driver: { ...drivers.find((d) => d.id === 'd6')!, status: 'on_route' },
      vehicle: { ...vehicles.find((v) => v.id === 'v12')!, status: 'in_use' },
    })
    const wrapper = await mountView()

    await dragOrderToDriver(wrapper, order.number, 'Agnieszka Lewandowska')

    expect(patchOrderAssignment).toHaveBeenCalledWith('o3', { driverId: 'd6', vehicleId: 'v12' })
    expect(wrapper.get('[aria-live]').text()).toContain(`Przypisano ${order.number}`)
    // Zlecenie znika z oczekujących, a kierowca z dostępnych - bez przeładowania
    expect(wrapper.findAll('article').some((a) => a.text().includes(order.number))).toBe(false)
    const driversSection = wrapper.get('section[aria-labelledby="drivers-heading"]')
    expect(driversSection.text()).not.toContain('Agnieszka Lewandowska')
  })

  it('pokazuje błąd z serwera, gdy przypisanie zostanie odrzucone', async () => {
    vi.mocked(patchOrderAssignment).mockRejectedValue(
      new ApiRequestError(422, 'Nie można przypisać zlecenia', {
        driverId: 'Kierowca jest niedostępny (na zleceniu)',
      }),
    )
    const wrapper = await mountView()
    const order = orders.find((o) => o.id === 'o3')!

    await dragOrderToDriver(wrapper, order.number, 'Agnieszka Lewandowska')

    expect(wrapper.get('[aria-live]').text()).toBe('Kierowca jest niedostępny (na zleceniu)')
    expect(wrapper.findAll('article').some((a) => a.text().includes(order.number))).toBe(true)
  })
})
