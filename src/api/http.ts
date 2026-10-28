import type { ApiError, FieldErrors } from '@/types'

export class ApiRequestError extends Error {
  status: number
  fieldErrors?: FieldErrors

  constructor(status: number, message: string, fieldErrors?: FieldErrors) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

// Warstwa api/ nie wie nic o MSW - reakcję na odpowiedź inną niż JSON podpina main.ts.
let invalidResponseHandler: (() => Promise<void>) | null = null
// Trwające odzyskiwanie - kilka żądań naraz (zlecenia, kierowcy, pojazdy) czeka na to samo
let recovery: Promise<void> | null = null

export function onInvalidResponse(handler: () => Promise<void>) {
  invalidResponseHandler = handler
}

function isJsonResponse(response: Response): boolean {
  return response.headers.get('content-type')?.includes('application/json') ?? false
}

export async function request<T>(url: string, init?: RequestInit, isRetry = false): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...init })
  } catch {
    // fetch rzuca tylko przy braku sieci - błędy HTTP (404, 500) obsługujemy niżej
    throw new ApiRequestError(0, 'Brak połączenia z serwerem')
  }

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiError | null
    throw new ApiRequestError(
      response.status,
      body?.message ?? `Błąd serwera (${response.status})`,
      body?.fieldErrors,
    )
  }

  // Odpowiedź "200 OK", ale nie JSON - np. serwer oddał index.html zamiast danych.
  // Bez tego sprawdzenia użytkownik zobaczyłby techniczne "Unexpected token '<'".
  if (!isJsonResponse(response)) {
    if (invalidResponseHandler && !isRetry) {
      recovery ??= invalidResponseHandler().finally(() => (recovery = null))
      await recovery
      return request<T>(url, init, true)
    }
    throw new ApiRequestError(
      response.status,
      'Serwer zwrócił nieoczekiwaną odpowiedź. Spróbuj ponownie za chwilę.',
    )
  }

  return (await response.json()) as T
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Wystąpił nieoczekiwany błąd'
}
