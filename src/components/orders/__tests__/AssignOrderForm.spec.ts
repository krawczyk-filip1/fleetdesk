import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia } from 'pinia'
import AssignOrderForm from '../AssignOrderForm.vue'
import { patchOrderAssignment } from '@/api/orders'
import { ApiRequestError } from '@/api/http'
import { orders } from '@/mocks/data/orders'
import { drivers, vehicles } from '@/mocks/data/fleet'

vi.mock('@/api/orders')

// o3 = "Meble biurowe", 2500 kg, 10 palet, status "Oczekuje"
const order = orders.find((o) => o.id === 'o3')!

function mountForm() {
  return mount(AssignOrderForm, {
    props: { order, drivers, vehicles },
    global: { plugins: [createPinia()] },
  })
}

// Selecty w kolejności: [0] kierowca, [1] pojazd
async function choose(wrapper: ReturnType<typeof mountForm>, driverId: string, vehicleId: string) {
  const [driverSelect, vehicleSelect] = wrapper.findAll('select')
  await driverSelect!.setValue(driverId)
  await vehicleSelect!.setValue(vehicleId)
}

describe('AssignOrderForm', () => {
  beforeEach(() => vi.resetAllMocks())

  it('nie pokazuje błędów "wybierz..." przed wysłaniem, a po wysłaniu tak', async () => {
    const wrapper = mountForm()
    // Sprawdzamy aria-invalid, a nie tekst - placeholder selecta też brzmi "Wybierz kierowcę..."
    expect(wrapper.findAll('select[aria-invalid="true"]')).toHaveLength(0)

    await wrapper.get('form').trigger('submit')

    expect(wrapper.findAll('select[aria-invalid="true"]')).toHaveLength(2)
    expect(patchOrderAssignment).not.toHaveBeenCalled()
  })

  it('od razu pokazuje, że pojazd jest za mały, i nie wysyła żądania', async () => {
    const wrapper = mountForm()

    await choose(wrapper, 'd6', 'v8') // v8 = bus 1000 kg
    await wrapper.get('form').trigger('submit')

    expect(wrapper.text()).toContain('Pojazd za mały')
    expect(wrapper.findAll('select[aria-invalid="true"]')).toHaveLength(1)
    expect(patchOrderAssignment).not.toHaveBeenCalled()
  })

  it('wysyła poprawne przypisanie i emituje zaktualizowane zlecenie', async () => {
    const updated = { ...order, status: 'assigned' as const, driverId: 'd6', vehicleId: 'v11' }
    vi.mocked(patchOrderAssignment).mockResolvedValue({
      order: updated,
      driver: { ...drivers.find((d) => d.id === 'd6')!, status: 'on_route' },
      vehicle: { ...vehicles.find((v) => v.id === 'v11')!, status: 'in_use' },
    })
    const wrapper = mountForm()

    await choose(wrapper, 'd6', 'v11')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(patchOrderAssignment).toHaveBeenCalledWith('o3', { driverId: 'd6', vehicleId: 'v11' })
    expect(wrapper.emitted('assigned')?.[0]).toEqual([updated])
  })

  it('pokazuje błąd z serwera (422) przy właściwym polu', async () => {
    vi.mocked(patchOrderAssignment).mockRejectedValue(
      new ApiRequestError(422, 'Nie można przypisać zlecenia', {
        driverId: 'Kierowca jest niedostępny (na zleceniu)',
      }),
    )
    const wrapper = mountForm()

    await choose(wrapper, 'd6', 'v11')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toBe('Nie można przypisać zlecenia')
    expect(wrapper.text()).toContain('Kierowca jest niedostępny (na zleceniu)')
    expect(wrapper.emitted('assigned')).toBeUndefined()
  })
})
