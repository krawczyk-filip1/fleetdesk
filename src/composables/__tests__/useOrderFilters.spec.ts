import { describe, it, expect } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { useOrderFilters } from '../useOrderFilters'

// Composable z useRoute() musi działać wewnątrz komponentu z routerem,
// więc montujemy pusty komponent i wyciągamy z niego wynik.
async function setup(initialUrl: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/orders', component: { render: () => null } }],
  })
  await router.push(initialUrl)

  let filters!: ReturnType<typeof useOrderFilters>
  const TestComponent = defineComponent({
    setup() {
      filters = useOrderFilters()
      return () => null
    },
  })
  mount(TestComponent, { global: { plugins: [router] } })

  return { router, filters }
}

describe('useOrderFilters', () => {
  it('czyta filtry i sortowanie z adresu URL', async () => {
    const { filters } = await setup('/orders?status=delayed&q=gdańsk&sort=cargo&dir=desc')

    expect(filters.status.value).toBe('delayed')
    expect(filters.search.value).toBe('gdańsk')
    expect(filters.sort.value).toEqual({ key: 'cargo', direction: 'desc' })
    expect(filters.hasActiveFilters.value).toBe(true)
  })

  it('ignoruje niepoprawne wartości wpisane ręcznie w URL', async () => {
    const { filters } = await setup('/orders?status=xyz&sort=hack')

    expect(filters.status.value).toBe('')
    expect(filters.sort.value).toEqual({ key: 'deadline', direction: 'asc' })
  })

  it('zapisuje zmianę do URL, a pusty filtr usuwa z adresu', async () => {
    const { router, filters } = await setup('/orders?q=test')

    filters.status.value = 'pending'
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ q: 'test', status: 'pending' })

    filters.resetFilters()
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({})
  })
})
