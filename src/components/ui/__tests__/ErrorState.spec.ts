import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorState from '../ErrorState.vue'

describe('ErrorState', () => {
  it('pokazuje komunikat i emituje retry po kliknięciu przycisku', async () => {
    const wrapper = mount(ErrorState, { props: { message: 'Brak połączenia z serwerem' } })

    expect(wrapper.get('[role="alert"]').text()).toContain('Brak połączenia z serwerem')

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
