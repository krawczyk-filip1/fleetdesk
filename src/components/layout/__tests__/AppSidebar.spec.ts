import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import AppSidebar from '../AppSidebar.vue'

// Minimalny router z tymi samymi nazwami tras - RouterLink potrafi wtedy zbudować href.
function createTestRouter() {
  const Stub = { template: '<div />' }
  return createRouter({
    history: createMemoryHistory(),
    routes: ['dashboard', 'orders', 'dispatch', 'fleet', 'map'].map((name) => ({
      path: name === 'dashboard' ? '/' : `/${name}`,
      name,
      component: Stub,
    })),
  })
}

describe('AppSidebar', () => {
  it('renderuje linki nawigacji z poprawnymi adresami', async () => {
    const router = createTestRouter()
    await router.push('/')

    const wrapper = mount(AppSidebar, { global: { plugins: [router] } })
    const links = wrapper.findAll('a')

    expect(links.map((a) => a.text())).toEqual([
      'Dzień dyspozytora',
      'Zlecenia',
      'Planowanie',
      'Kierowcy i auta',
      'Mapa',
    ])
    expect(links.map((a) => a.attributes('href'))).toEqual([
      '/',
      '/orders',
      '/dispatch',
      '/fleet',
      '/map',
    ])
  })

  it('oznacza aktywny link przez aria-current', async () => {
    const router = createTestRouter()
    await router.push('/orders')

    const wrapper = mount(AppSidebar, { global: { plugins: [router] } })

    expect(wrapper.get('a[aria-current="page"]').text()).toBe('Zlecenia')
  })
})
