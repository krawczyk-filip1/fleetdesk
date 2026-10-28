import type { Cargo, Location, Order, OrderStatus, StatusChange } from '@/types'
import { LOCATIONS } from './locations'

// Daty liczymy względem chwili uruchomienia aplikacji. Dzięki temu demo zawsze
// wygląda "na żywo": są zlecenia na dziś, po terminie i zbliżające się do terminu.
const HOUR = 60 * 60 * 1000
const now = Date.now()

function hoursFromNow(hours: number): string {
  return new Date(now + hours * HOUR).toISOString()
}

interface OrderSeed {
  customer: string
  origin: Location
  destination: Location
  cargo: Cargo
  /** Odbiór ładunku - godziny od teraz (ujemne = w przeszłości) */
  pickupIn: number
  /** Termin dostawy - godziny od teraz */
  deadlineIn: number
  status: OrderStatus
  driverId?: string
  vehicleId?: string
}

// Historia statusów wynika z obecnego statusu: zlecenie "Dostarczone" musiało
// wcześniej być "Oczekuje" -> "Przypisane" -> "W trasie".
function buildHistory(seed: OrderSeed): StatusChange[] {
  const history: StatusChange[] = [
    { status: 'pending', changedAt: hoursFromNow(seed.pickupIn - 24), note: 'Zlecenie utworzone' },
  ]
  if (seed.status === 'pending') return history

  history.push({ status: 'assigned', changedAt: hoursFromNow(seed.pickupIn - 3) })
  if (seed.status === 'assigned') return history

  history.push({
    status: 'in_transit',
    changedAt: hoursFromNow(seed.pickupIn),
    note: 'Ładunek odebrany',
  })
  if (seed.status === 'delayed') {
    history.push({
      status: 'delayed',
      changedAt: hoursFromNow(seed.deadlineIn),
      note: 'Przekroczony termin dostawy',
    })
  }
  if (seed.status === 'delivered') {
    history.push({
      status: 'delivered',
      changedAt: hoursFromNow(seed.deadlineIn - 1),
      note: 'Odbiór potwierdzony przez klienta',
    })
  }
  return history
}

function buildOrder(seed: OrderSeed, index: number): Order {
  const sequence = String(index + 101).padStart(4, '0')
  const created = new Date(now + (seed.pickupIn - 24) * HOUR)
  const month = String(created.getMonth() + 1).padStart(2, '0')

  return {
    id: `o${index + 1}`,
    number: `ZL/${created.getFullYear()}/${month}/${sequence}`,
    customer: seed.customer,
    origin: seed.origin,
    destination: seed.destination,
    cargo: seed.cargo,
    pickupAt: hoursFromNow(seed.pickupIn),
    deadline: hoursFromNow(seed.deadlineIn),
    status: seed.status,
    driverId: seed.driverId ?? null,
    vehicleId: seed.vehicleId ?? null,
    statusHistory: buildHistory(seed),
    createdAt: created.toISOString(),
  }
}

const L = LOCATIONS

const seeds: OrderSeed[] = [
  {
    customer: 'Hurtownia Budmat Sp. z o.o.',
    origin: L.warszawa,
    destination: L.lublin,
    cargo: { description: 'Materiały budowlane', weightKg: 900, pallets: 4 },
    pickupIn: 5,
    deadlineIn: 12,
    status: 'pending',
  },
  {
    customer: 'Agro-Plon S.A.',
    origin: L.poznan,
    destination: L.szczecin,
    cargo: { description: 'Nawozy w workach', weightKg: 6000, pallets: 12 },
    pickupIn: 8,
    deadlineIn: 20,
    status: 'pending',
  },
  {
    customer: 'Meblex Sp. z o.o.',
    origin: L.wroclaw,
    destination: L.krakow,
    cargo: { description: 'Meble biurowe', weightKg: 2500, pallets: 10 },
    pickupIn: 3,
    deadlineIn: 10,
    status: 'pending',
  },
  {
    customer: 'Drukarnia Kolor',
    origin: L.lodz,
    destination: L.warszawa,
    cargo: { description: 'Papier drukarski', weightKg: 1100, pallets: 6 },
    pickupIn: 2,
    deadlineIn: 6,
    status: 'pending',
  },
  {
    customer: 'Elektro-Hurt S.A.',
    origin: L.katowice,
    destination: L.gdansk,
    cargo: { description: 'Sprzęt AGD', weightKg: 14000, pallets: 26 },
    pickupIn: 20,
    deadlineIn: 40,
    status: 'pending',
  },
  {
    customer: 'Piekarnia Złoty Kłos',
    origin: L.torun,
    destination: L.bydgoszcz,
    cargo: { description: 'Pieczywo mrożone', weightKg: 600, pallets: 3 },
    pickupIn: 1,
    deadlineIn: 4,
    status: 'pending',
  },
  {
    customer: 'Stal-Pol Sp. z o.o.',
    origin: L.kielce,
    destination: L.rzeszow,
    cargo: { description: 'Profile stalowe', weightKg: 18000, pallets: 20 },
    pickupIn: 30,
    deadlineIn: 48,
    status: 'pending',
  },
  {
    customer: 'Zielony Ogród',
    origin: L.opole,
    destination: L.wroclaw,
    cargo: { description: 'Rośliny doniczkowe', weightKg: 800, pallets: 6 },
    pickupIn: 24,
    deadlineIn: 30,
    status: 'pending',
  },

  {
    customer: 'Okno-Tech Sp. z o.o.',
    origin: L.bydgoszcz,
    destination: L.poznan,
    cargo: { description: 'Okna PCV', weightKg: 1200, pallets: 8 },
    pickupIn: 4,
    deadlineIn: 9,
    status: 'assigned',
    driverId: 'd1',
    vehicleId: 'v1',
  },
  {
    customer: 'Browar Mazurski',
    origin: L.olsztyn,
    destination: L.warszawa,
    cargo: { description: 'Napoje w skrzynkach', weightKg: 1300, pallets: 10 },
    pickupIn: 6,
    deadlineIn: 14,
    status: 'assigned',
    driverId: 'd4',
    vehicleId: 'v4',
  },
  {
    customer: 'Chemland S.A.',
    origin: L.krakow,
    destination: L.katowice,
    cargo: { description: 'Chemia gospodarcza', weightKg: 6500, pallets: 14 },
    pickupIn: 2,
    deadlineIn: 7,
    status: 'assigned',
    driverId: 'd7',
    vehicleId: 'v7',
  },

  {
    customer: 'Hurtownia Spożywcza Smak',
    origin: L.warszawa,
    destination: L.gdansk,
    cargo: { description: 'Artykuły spożywcze', weightKg: 7500, pallets: 15 },
    pickupIn: -3,
    deadlineIn: 1.5,
    status: 'in_transit',
    driverId: 'd2',
    vehicleId: 'v2',
  },
  {
    customer: 'Opon-Max Sp. z o.o.',
    origin: L.szczecin,
    destination: L.poznan,
    cargo: { description: 'Opony ciężarowe', weightKg: 20000, pallets: 30 },
    pickupIn: -2,
    deadlineIn: 5,
    status: 'in_transit',
    driverId: 'd3',
    vehicleId: 'v3',
  },
  {
    customer: 'Papiernia Karton-Pak',
    origin: L.krakow,
    destination: L.wroclaw,
    cargo: { description: 'Rolki papieru', weightKg: 9500, pallets: 18 },
    pickupIn: -4,
    deadlineIn: 4,
    status: 'in_transit',
    driverId: 'd5',
    vehicleId: 'v5',
  },

  {
    customer: 'Tekstil-Łódź Sp. z o.o.',
    origin: L.lodz,
    destination: L.gdansk,
    cargo: { description: 'Odzież', weightKg: 15000, pallets: 28 },
    pickupIn: -10,
    deadlineIn: -1,
    status: 'delayed',
    driverId: 'd8',
    vehicleId: 'v6',
  },
  {
    customer: 'Pasze Podlasia',
    origin: L.bialystok,
    destination: L.lublin,
    cargo: { description: 'Pasza dla zwierząt', weightKg: 21000, pallets: 32 },
    pickupIn: -8,
    deadlineIn: -2,
    status: 'delayed',
    driverId: 'd9',
    vehicleId: 'v9',
  },

  {
    customer: 'Hurtownia Budmat Sp. z o.o.',
    origin: L.warszawa,
    destination: L.lodz,
    cargo: { description: 'Płytki ceramiczne', weightKg: 1000, pallets: 5 },
    pickupIn: -30,
    deadlineIn: -22,
    status: 'delivered',
    driverId: 'd1',
    vehicleId: 'v1',
  },
  {
    customer: 'Meblex Sp. z o.o.',
    origin: L.wroclaw,
    destination: L.opole,
    cargo: { description: 'Krzesła', weightKg: 700, pallets: 6 },
    pickupIn: -28,
    deadlineIn: -20,
    status: 'delivered',
    driverId: 'd4',
    vehicleId: 'v8',
  },
  {
    customer: 'Agro-Plon S.A.',
    origin: L.poznan,
    destination: L.bydgoszcz,
    cargo: { description: 'Zboże w big-bagach', weightKg: 6800, pallets: 14 },
    pickupIn: -50,
    deadlineIn: -40,
    status: 'delivered',
    driverId: 'd7',
    vehicleId: 'v7',
  },
  {
    customer: 'Elektro-Hurt S.A.',
    origin: L.katowice,
    destination: L.krakow,
    cargo: { description: 'Telewizory', weightKg: 3000, pallets: 12 },
    pickupIn: -48,
    deadlineIn: -42,
    status: 'delivered',
    driverId: 'd2',
    vehicleId: 'v2',
  },
  {
    customer: 'Stal-Pol Sp. z o.o.',
    origin: L.kielce,
    destination: L.warszawa,
    cargo: { description: 'Pręty zbrojeniowe', weightKg: 22000, pallets: 24 },
    pickupIn: -72,
    deadlineIn: -60,
    status: 'delivered',
    driverId: 'd3',
    vehicleId: 'v3',
  },
  {
    customer: 'Drukarnia Kolor',
    origin: L.lodz,
    destination: L.torun,
    cargo: { description: 'Ulotki reklamowe', weightKg: 2000, pallets: 6 },
    pickupIn: -26,
    deadlineIn: -18,
    status: 'delivered',
    driverId: 'd5',
    vehicleId: 'v5',
  },
  {
    customer: 'Chemland S.A.',
    origin: L.krakow,
    destination: L.rzeszow,
    cargo: { description: 'Farby i lakiery', weightKg: 12000, pallets: 22 },
    pickupIn: -70,
    deadlineIn: -58,
    status: 'delivered',
    driverId: 'd8',
    vehicleId: 'v6',
  },
  {
    customer: 'Browar Mazurski',
    origin: L.olsztyn,
    destination: L.gdansk,
    cargo: { description: 'Piwo w kegach', weightKg: 18000, pallets: 30 },
    pickupIn: -96,
    deadlineIn: -84,
    status: 'delivered',
    driverId: 'd9',
    vehicleId: 'v9',
  },
]

export const orders: Order[] = seeds.map(buildOrder)
