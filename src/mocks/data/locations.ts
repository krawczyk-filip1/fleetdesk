import type { Location } from '@/types'

// Fikcyjne adresy magazynów, ale prawdziwe współrzędne miast - pojazdy na mapie jadą po sensownych trasach.
// satisfies zamiast adnotacji typu: LOCATIONS.warszawa ma typ Location, a nie Location | undefined.
export const LOCATIONS = {
  warszawa: {
    city: 'Warszawa',
    address: 'ul. Magazynowa 12',
    coords: { lat: 52.2297, lng: 21.0122 },
  },
  krakow: { city: 'Kraków', address: 'ul. Półłanki 64', coords: { lat: 50.0647, lng: 19.945 } },
  gdansk: { city: 'Gdańsk', address: 'ul. Portowa 3', coords: { lat: 54.352, lng: 18.6466 } },
  poznan: { city: 'Poznań', address: 'ul. Głogowska 210', coords: { lat: 52.4064, lng: 16.9252 } },
  wroclaw: {
    city: 'Wrocław',
    address: 'ul. Logistyczna 7',
    coords: { lat: 51.1079, lng: 17.0385 },
  },
  lodz: { city: 'Łódź', address: 'ul. Przemysłowa 45', coords: { lat: 51.7592, lng: 19.456 } },
  katowice: {
    city: 'Katowice',
    address: 'ul. Hutnicza 18',
    coords: { lat: 50.2649, lng: 19.0238 },
  },
  szczecin: { city: 'Szczecin', address: 'ul. Bałtycka 9', coords: { lat: 53.4285, lng: 14.5528 } },
  lublin: {
    city: 'Lublin',
    address: 'ul. Zemborzycka 112',
    coords: { lat: 51.2465, lng: 22.5684 },
  },
  bialystok: {
    city: 'Białystok',
    address: 'ul. Wysockiego 69',
    coords: { lat: 53.1325, lng: 23.1688 },
  },
  bydgoszcz: {
    city: 'Bydgoszcz',
    address: 'ul. Fordońska 246',
    coords: { lat: 53.1235, lng: 18.0084 },
  },
  rzeszow: {
    city: 'Rzeszów',
    address: 'ul. Przemysłowa 2',
    coords: { lat: 50.0412, lng: 21.9991 },
  },
  torun: { city: 'Toruń', address: 'ul. Grudziądzka 159', coords: { lat: 53.0138, lng: 18.5984 } },
  kielce: { city: 'Kielce', address: 'ul. Zagnańska 97', coords: { lat: 50.8661, lng: 20.6286 } },
  olsztyn: { city: 'Olsztyn', address: 'ul. Lubelska 33', coords: { lat: 53.7784, lng: 20.4801 } },
  opole: { city: 'Opole', address: 'ul. Wrocławska 150', coords: { lat: 50.6751, lng: 17.9213 } },
} satisfies Record<string, Location>
