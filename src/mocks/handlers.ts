import { delay, http, HttpResponse, type HttpHandler } from 'msw'
import type { ApiError, AssignmentPayload, AssignmentResult } from '@/types'
import { hasErrors, validateAssignment } from '@/utils/assignment'
import { formatDriverName } from '@/utils/format'
import { orders } from './data/orders'
import { drivers, vehicles } from './data/fleet'

// Pracujemy na kopii danych, bo PATCH je zmienia (jak prawdziwa baza - do odświeżenia strony).
const db = structuredClone({ orders, drivers, vehicles })

// Sztuczne opóźnienie sieci - bez niego nie zobaczylibyśmy stanu ładowania.
const NETWORK_DELAY_MS = 400

export const handlers: HttpHandler[] = [
  http.get('/api/orders', async () => {
    await delay(NETWORK_DELAY_MS)
    return HttpResponse.json(db.orders)
  }),

  http.get('/api/orders/:id', async ({ params }) => {
    await delay(NETWORK_DELAY_MS)
    const order = db.orders.find((o) => o.id === params.id)
    if (!order) {
      return HttpResponse.json<ApiError>({ message: 'Nie znaleziono zlecenia' }, { status: 404 })
    }
    return HttpResponse.json(order)
  }),

  http.patch<{ id: string }, Partial<AssignmentPayload>, AssignmentResult | ApiError>(
    '/api/orders/:id/assignment',
    async ({ params, request }) => {
      await delay(NETWORK_DELAY_MS)
      const order = db.orders.find((o) => o.id === params.id)
      if (!order) {
        return HttpResponse.json<ApiError>({ message: 'Nie znaleziono zlecenia' }, { status: 404 })
      }
      // 409 Conflict: zlecenie zmieniło się w międzyczasie (np. przypisał je ktoś inny)
      if (order.status !== 'pending') {
        return HttpResponse.json<ApiError>(
          { message: 'Zlecenie jest już przypisane – odśwież stronę' },
          { status: 409 },
        )
      }

      const body = await request.json()
      const driver = db.drivers.find((d) => d.id === body.driverId)
      const vehicle = db.vehicles.find((v) => v.id === body.vehicleId)

      const fieldErrors = validateAssignment(order, driver, vehicle)
      if (!driver || !vehicle || hasErrors(fieldErrors)) {
        return HttpResponse.json<ApiError>(
          { message: 'Nie można przypisać zlecenia', fieldErrors },
          { status: 422 },
        )
      }

      order.driverId = driver.id
      order.vehicleId = vehicle.id
      order.status = 'assigned'
      order.statusHistory.push({
        status: 'assigned',
        changedAt: new Date().toISOString(),
        note: `Przypisano: ${formatDriverName(driver)}, ${vehicle.registration}`,
      })
      driver.status = 'on_route'
      vehicle.status = 'in_use'

      return HttpResponse.json({ order, driver, vehicle })
    },
  ),

  http.get('/api/drivers', async () => {
    await delay(NETWORK_DELAY_MS)
    return HttpResponse.json(db.drivers)
  }),

  http.get('/api/vehicles', async () => {
    await delay(NETWORK_DELAY_MS)
    return HttpResponse.json(db.vehicles)
  }),
]
