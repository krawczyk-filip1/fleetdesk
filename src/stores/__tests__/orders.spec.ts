import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useOrdersStore } from '../orders'
import { getOrders } from '@/api/orders'
import { ApiRequestError } from '@/api/http'
import { orders as mockOrders } from '@/mocks/data/orders'

vi.mock('@/api/orders')

describe('useOrdersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.resetAllMocks()
  })

  it('wczytuje zlecenia i kończy ładowanie', async () => {
    vi.mocked(getOrders).mockResolvedValue(mockOrders)
    const store = useOrdersStore()

    const pending = store.fetchOrders()
    expect(store.isLoading).toBe(true)
    await pending

    expect(store.isLoading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.orders).toHaveLength(mockOrders.length)
  })

  it('zapisuje komunikat błędu, gdy API zwróci błąd', async () => {
    vi.mocked(getOrders).mockRejectedValue(new ApiRequestError(500, 'Błąd serwera (500)'))
    const store = useOrdersStore()

    await store.fetchOrders()

    expect(store.isLoading).toBe(false)
    expect(store.error).toBe('Błąd serwera (500)')
    expect(store.orders).toEqual([])
  })
})
