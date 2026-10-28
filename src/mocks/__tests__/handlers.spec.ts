import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupServer } from 'msw/node'
import { handlers } from '../handlers'
import { patchOrderAssignment } from '@/api/orders'
import { ApiRequestError } from '@/api/http'

const server = setupServer(...handlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())

// Z danych mock: o3 = "Meble biurowe", 2500 kg, 10 palet, status "Oczekuje"
// d6 = Agnieszka Lewandowska (dostępna), d2 = Anna Kowalska (na zleceniu)
// v8 = bus 1000 kg (dostępny), v11 = ciągnik 24 000 kg (dostępny)

describe('PATCH /api/orders/:id/assignment', () => {
  it('zwraca 422 z błędami pól, gdy przypisanie łamie reguły', async () => {
    const error = await patchOrderAssignment('o3', { driverId: 'd2', vehicleId: 'v8' }).catch(
      (e: unknown) => e,
    )

    expect(error).toBeInstanceOf(ApiRequestError)
    expect((error as ApiRequestError).status).toBe(422)
    expect((error as ApiRequestError).fieldErrors).toEqual({
      driverId: 'Kierowca jest niedostępny (na zleceniu)',
      vehicleId: 'Pojazd za mały: ładunek 2500 kg, ładowność 1000 kg',
    })
  })

  it('przypisuje zlecenie i zmienia statusy kierowcy i pojazdu', async () => {
    const result = await patchOrderAssignment('o3', { driverId: 'd6', vehicleId: 'v11' })

    expect(result.order.status).toBe('assigned')
    expect(result.order.driverId).toBe('d6')
    const lastChange = result.order.statusHistory[result.order.statusHistory.length - 1]
    expect(lastChange?.note).toBe('Przypisano: Agnieszka Lewandowska, PZ 7745E')
    expect(result.driver.status).toBe('on_route')
    expect(result.vehicle.status).toBe('in_use')
  })

  it('zwraca 409, gdy zlecenie jest już przypisane', async () => {
    // o3 zostało przypisane w poprzednim teście - "baza" MSW pamięta zmiany
    const error = await patchOrderAssignment('o3', { driverId: 'd10', vehicleId: 'v12' }).catch(
      (e: unknown) => e,
    )

    expect((error as ApiRequestError).status).toBe(409)
  })
})
