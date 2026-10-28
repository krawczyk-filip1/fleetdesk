import type { Order } from '@/types'
import { getRiskReason } from '@/utils/risk'
import { useNow } from './useNow'

// riskReason() czyta now.value, więc szablon i computed, które jej używają, przeliczą się same co minutę.
export function useOrderRisk() {
  const now = useNow()

  function riskReason(order: Order): string | null {
    return getRiskReason(order, now.value)
  }

  return { now, riskReason }
}
