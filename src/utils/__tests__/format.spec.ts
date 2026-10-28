import { describe, it, expect } from 'vitest'
import { formatDateTime, formatDriverName, formatWeight, toTelHref } from '../format'

describe('formatDateTime', () => {
  it('formatuje datę ISO po polsku w lokalnej strefie czasowej', () => {
    // Budujemy datę w czasie lokalnym, żeby test działał w każdej strefie
    const iso = new Date(2026, 9, 28, 14, 5).toISOString()

    expect(formatDateTime(iso)).toBe('28.10.2026, 14:05')
  })
})

describe('formatWeight', () => {
  it('dodaje jednostkę i separator tysięcy (twarda spacja)', () => {
    expect(formatWeight(15000)).toBe('15 000 kg')
  })
})

describe('formatDriverName', () => {
  it('łączy imię i nazwisko', () => {
    expect(formatDriverName({ firstName: 'Anna', lastName: 'Kowalska' })).toBe('Anna Kowalska')
  })
})

describe('toTelHref', () => {
  it('usuwa spacje z numeru telefonu', () => {
    expect(toTelHref('+48 601 234 567')).toBe('tel:+48601234567')
  })
})
