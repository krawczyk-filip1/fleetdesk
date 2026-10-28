import { computed } from 'vue'
import { useRoute, useRouter, type LocationQuery } from 'vue-router'
import type { OrderFilterValues, OrderStatus, SortDirection, SortState } from '@/types'
import { isOrderSortKey, isOrderStatus } from '@/utils/orders'

const DEFAULT_SORT: SortState = { key: 'deadline', direction: 'asc' }

// Filtry w URL, a nie w store: link z filtrami można komuś wysłać, a odświeżenie strony nie gubi ustawień.
export function useOrderFilters() {
  const route = useRoute()
  const router = useRouter()

  function readQuery(name: string): string {
    const value = route.query[name]
    return typeof value === 'string' ? value : ''
  }

  function updateQuery(changes: Record<string, string>) {
    const query: LocationQuery = { ...route.query }
    for (const [name, value] of Object.entries(changes)) {
      if (value) query[name] = value
      else delete query[name]
    }
    // replace zamiast push: wpisywanie w wyszukiwarkę nie zaśmieca historii,
    // a "Wstecz" wraca do poprzedniej strony, a nie do poprzedniej literki
    router.replace({ query })
  }

  function queryParam(name: string) {
    return computed({
      get: () => readQuery(name),
      set: (value: string) => updateQuery({ [name]: value }),
    })
  }

  const search = queryParam('q')
  const driverId = queryParam('driver')
  const dateFrom = queryParam('from')
  const dateTo = queryParam('to')

  // Status i sortowanie sprawdzamy - ktoś mógł ręcznie wpisać w URL ?status=cokolwiek
  const status = computed<OrderStatus | ''>({
    get: () => {
      const value = readQuery('status')
      return isOrderStatus(value) ? value : ''
    },
    set: (value) => updateQuery({ status: value }),
  })

  const sort = computed<SortState>({
    get: () => {
      const key = readQuery('sort')
      if (!isOrderSortKey(key)) return DEFAULT_SORT
      const direction: SortDirection = readQuery('dir') === 'desc' ? 'desc' : 'asc'
      return { key, direction }
    },
    set: (value) => updateQuery({ sort: value.key, dir: value.direction }),
  })

  const filters = computed<OrderFilterValues>(() => ({
    status: status.value,
    driverId: driverId.value,
    dateFrom: dateFrom.value,
    dateTo: dateTo.value,
    search: search.value,
  }))

  const hasActiveFilters = computed(() => Object.values(filters.value).some(Boolean))

  function resetFilters() {
    // Jedno wywołanie zamiast pięciu - każdy setter osobno nadpisałby zmiany poprzedniego,
    // bo route.query aktualizuje się dopiero po zakończeniu nawigacji
    updateQuery({ status: '', driver: '', from: '', to: '', q: '' })
  }

  return {
    search,
    status,
    driverId,
    dateFrom,
    dateTo,
    sort,
    filters,
    hasActiveFilters,
    resetFilters,
  }
}
