import type { AssignmentPayload, AssignmentResult, Order } from '@/types'
import { request } from './http'

export function getOrders(): Promise<Order[]> {
  return request<Order[]>('/api/orders')
}

export function getOrder(id: string): Promise<Order> {
  return request<Order>(`/api/orders/${encodeURIComponent(id)}`)
}

export function patchOrderAssignment(
  id: string,
  payload: AssignmentPayload,
): Promise<AssignmentResult> {
  return request<AssignmentResult>(`/api/orders/${encodeURIComponent(id)}/assignment`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
