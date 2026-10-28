import { describe, it, expect } from 'vitest'
import { pluralPl } from '../format'
import { describeDay, greeting } from '../summary'

describe('pluralPl', () => {
  const zlecen = (n: number) => `${n} ${pluralPl(n, 'zlecenie', 'zlecenia', 'zleceń')}`

  it('odmienia zgodnie z polską gramatyką', () => {
    expect(zlecen(1)).toBe('1 zlecenie')
    expect(zlecen(3)).toBe('3 zlecenia')
    expect(zlecen(5)).toBe('5 zleceń')
    expect(zlecen(0)).toBe('0 zleceń')
  })

  it('obsługuje wyjątki 12-14 i liczby złożone', () => {
    expect(zlecen(12)).toBe('12 zleceń')
    expect(zlecen(22)).toBe('22 zlecenia')
    expect(zlecen(112)).toBe('112 zleceń')
  })
})

describe('describeDay', () => {
  it('przy opóźnieniach każe zacząć od telefonów', () => {
    const { headline, advice } = describeDay({ delayed: 2, atRisk: 3, pending: 8 })
    expect(headline).toBe('2 kursy są już po terminie.')
    expect(advice).toBe(
      'Zacznij od telefonów do kierowców z listy poniżej. Jeszcze 3 zlecenia mogą się spóźnić. Na kierowcę czeka 8 zleceń.',
    )
  })

  it('bez opóźnień ostrzega o zagrożonych', () => {
    expect(describeDay({ delayed: 0, atRisk: 1, pending: 0 }).headline).toBe(
      'Wszystko na czas, ale 1 zlecenie może się spóźnić.',
    )
  })

  it('gdy wszystko gra, mówi to wprost', () => {
    expect(describeDay({ delayed: 0, atRisk: 0, pending: 0 })).toEqual({
      headline: 'Wszystko idzie zgodnie z planem.',
      advice: '',
    })
  })
})

describe('greeting', () => {
  it('mówi "Dzień dobry" w dzień i "Dobry wieczór" od 18:00', () => {
    expect(greeting(new Date(2026, 9, 28, 9, 0))).toBe('Dzień dobry!')
    expect(greeting(new Date(2026, 9, 28, 18, 0))).toBe('Dobry wieczór!')
  })
})
