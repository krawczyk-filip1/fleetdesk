import { describe, it, expect, vi, afterEach } from 'vitest'
import { ApiRequestError, onInvalidResponse, request } from '../http'

const jsonResponse = (data: unknown) =>
  new Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } })

// Tak wygląda odpowiedź, gdy uśpiony Service Worker przepuści żądanie do serwera:
// status 200, ale zamiast danych - strona HTML aplikacji
const htmlResponse = () =>
  new Response('<!DOCTYPE html><html></html>', { headers: { 'Content-Type': 'text/html' } })

describe('request', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    onInvalidResponse(async () => {})
  })

  it('zwraca dane z odpowiedzi JSON', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([{ id: 'o1' }])))

    await expect(request('/api/orders')).resolves.toEqual([{ id: 'o1' }])
  })

  it('po odpowiedzi HTML włącza mock API ponownie i powtarza żądanie raz', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(htmlResponse())
      .mockResolvedValueOnce(jsonResponse([{ id: 'o1' }]))
    vi.stubGlobal('fetch', fetchMock)
    const recover = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    onInvalidResponse(recover)

    await expect(request('/api/orders')).resolves.toEqual([{ id: 'o1' }])
    expect(recover).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('kilka równoczesnych żądań uruchamia odzyskiwanie tylko raz', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn<typeof fetch>()
        .mockResolvedValueOnce(htmlResponse())
        .mockResolvedValueOnce(htmlResponse())
        .mockImplementation(async () => jsonResponse([])),
    )
    const recover = vi.fn<() => Promise<void>>().mockResolvedValue(undefined)
    onInvalidResponse(recover)

    await Promise.all([request('/api/orders'), request('/api/drivers')])

    expect(recover).toHaveBeenCalledOnce()
  })

  it('gdy powtórka też nie pomoże, pokazuje zrozumiały komunikat zamiast błędu parsowania', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(async () => htmlResponse()),
    )

    const error = await request('/api/orders').catch((e: unknown) => e)

    expect(error).toBeInstanceOf(ApiRequestError)
    expect((error as ApiRequestError).message).toBe(
      'Serwer zwrócił nieoczekiwaną odpowiedź. Spróbuj ponownie za chwilę.',
    )
  })

  it('przy braku sieci zwraca komunikat "Brak połączenia z serwerem"', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(request('/api/orders')).rejects.toThrow('Brak połączenia z serwerem')
  })
})
