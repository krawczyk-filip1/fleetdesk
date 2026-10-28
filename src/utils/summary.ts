import { pluralPl } from './format'

interface DayCounts {
  delayed: number
  atRisk: number
  pending: number
}

export function describeDay({ delayed, atRisk, pending }: DayCounts) {
  let headline: string
  if (delayed > 0) {
    headline = `${delayed} ${pluralPl(delayed, 'kurs jest', 'kursy są', 'kursów jest')} już po terminie.`
  } else if (atRisk > 0) {
    headline = `Wszystko na czas, ale ${atRisk} ${pluralPl(atRisk, 'zlecenie może', 'zlecenia mogą', 'zleceń może')} się spóźnić.`
  } else {
    headline = 'Wszystko idzie zgodnie z planem.'
  }

  const advice: string[] = []
  if (delayed > 0) {
    advice.push('Zacznij od telefonów do kierowców z listy poniżej.')
    if (atRisk > 0) {
      advice.push(
        `Jeszcze ${atRisk} ${pluralPl(atRisk, 'zlecenie może', 'zlecenia mogą', 'zleceń może')} się spóźnić.`,
      )
    }
  }
  if (pending > 0) {
    advice.push(
      `Na kierowcę ${pluralPl(pending, 'czeka', 'czekają', 'czeka')} ${pending} ${pluralPl(pending, 'zlecenie', 'zlecenia', 'zleceń')}.`,
    )
  }

  return { headline, advice: advice.join(' ') }
}

export function greeting(date: Date): string {
  return date.getHours() >= 18 ? 'Dobry wieczór!' : 'Dzień dobry!'
}
