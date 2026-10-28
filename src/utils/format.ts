import type { Driver } from '@/types'

// Formatery Intl tworzymy raz - konstruktor jest kosztowny, a format() tani.
const dateTimeFormatter = new Intl.DateTimeFormat('pl-PL', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

const numberFormatter = new Intl.NumberFormat('pl-PL')

/** "2026-10-28T13:30:00.000Z" -> "28.10.2026, 14:30" (w strefie czasowej użytkownika) */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

export function formatWeight(kg: number): string {
  return `${numberFormatter.format(kg)} kg`
}

export function formatDriverName(driver: Pick<Driver, 'firstName' | 'lastName'>): string {
  return `${driver.firstName} ${driver.lastName}`
}

export function toTelHref(phone: string): string {
  return `tel:${phone.replace(/\s/g, '')}`
}

const timeFormatter = new Intl.DateTimeFormat('pl-PL', { hour: '2-digit', minute: '2-digit' })

export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

// Formy podajemy same, bo zależą od słowa (np. "czeka" / "czekają" / "czeka").
export function pluralPl(count: number, one: string, few: string, many: string): string {
  if (count === 1) return one
  const lastDigit = count % 10
  const lastTwoDigits = count % 100
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14)) return few
  return many
}
