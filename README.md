# FleetDesk – panel dyspozytora floty

FleetDesk to aplikacja webowa wspierająca zarządzanie zleceniami transportowymi, kierowcami i pojazdami.

Projekt powstał jako aplikacja portfolio, której celem jest usprawnienie codziennej pracy dyspozytora. Pomaga kontrolować terminy zleceń, przydzielać kierowców i pojazdy oraz monitorować ich pozycje na mapie.

## Funkcjonalności

### Dashboard
- Podsumowanie aktualnej sytuacji i statusów zleceń.
- Informacje o zleceniach przeterminowanych i zagrożonych opóźnieniem.
- Lista problemów wymagających reakcji wraz z sugerowanym kolejnym krokiem.

### Zlecenia
- Lista zleceń z wyszukiwarką, sortowaniem i filtrami.
- Filtrowanie według statusu, kierowcy i terminu.
- Zapisywanie filtrów w adresie URL.
- Szczegóły zlecenia obejmujące trasę, ładunek, kierowcę i pojazd.
- Historia zmian statusu.

### Przydzielanie zleceń
- Formularz wyboru kierowcy i pojazdu.
- Sprawdzanie dostępności kierowcy.
- Walidacja ładowności pojazdu i liczby miejsc paletowych.

### Planowanie
- Tablica planowania z możliwością przeciągania zleceń na kierowców.
- Automatyczny dobór najmniejszego dostępnego pojazdu, który spełnia wymagania ładunku.
- Alternatywny sposób przydzielania zleceń za pomocą formularza.

### Kierowcy i pojazdy
- Lista kierowców i pojazdów.
- Informacje o dostępności, ładowności i aktualnych zleceniach.

### Mapa floty
- Mapa z pozycjami pojazdów.
- Symulacja ruchu pojazdów aktualizowana co 2 sekundy.
- Informacja o odległości pojazdu od celu.

### Alerty
- Oznaczanie zleceń zagrożonych opóźnieniem.
- Alerty na stronie szczegółów zlecenia.
- Aktualizacja informacji o ryzyku opóźnienia bez odświeżania strony.

## Technologie

- Vue 3
- TypeScript
- Vite
- Pinia
- Vue Router
- Tailwind CSS 4
- Leaflet + OpenStreetMap
- MSW
- Vitest + Vue Test Utils
- ESLint + oxlint

## Testy

Projekt zawiera 86 testów w 25 plikach.

Testy obejmują między innymi:
- Filtrowanie i sortowanie zleceń.
- Walidację przydzielania kierowców i pojazdów.
- Wykrywanie ryzyka opóźnień.
- Obsługę błędów API.
- Działanie formularzy, tabel i dashboardu.
- Wybrane funkcje związane z planowaniem i mapą.

## Dane demonstracyjne

Aplikacja korzysta z fikcyjnych danych i mock API. Zmiany wprowadzone podczas korzystania z aplikacji nie są zapisywane na stałe i mogą zniknąć po odświeżeniu strony.

Daty są generowane względem momentu uruchomienia aplikacji, aby można było zobaczyć zlecenia aktualne, przeterminowane i zbliżające się do terminu.

Pozycje pojazdów na mapie są symulowane. Aplikacja nie korzysta obecnie z rzeczywistych danych GPS.
