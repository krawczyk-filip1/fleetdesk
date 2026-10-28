import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import OrderStatusTimeline from '../OrderStatusTimeline.vue'

describe('OrderStatusTimeline', () => {
  it('pokazuje zmiany w kolejności i oznacza ostatnią jako bieżący krok', () => {
    const wrapper = mount(OrderStatusTimeline, {
      props: {
        history: [
          { status: 'pending', changedAt: '2026-10-01T08:00:00.000Z', note: 'Zlecenie utworzone' },
          { status: 'assigned', changedAt: '2026-10-01T10:00:00.000Z' },
          { status: 'in_transit', changedAt: '2026-10-01T12:00:00.000Z' },
        ],
      },
    })

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(3)
    expect(items[0]!.text()).toContain('Oczekuje')
    expect(items[1]!.text()).toContain('Przypisane')
    expect(items[2]!.text()).toContain('W trasie')
    expect(items[0]!.text()).toContain('Zlecenie utworzone')
    expect(wrapper.get('[aria-current="step"]').text()).toContain('W trasie')
  })
})
