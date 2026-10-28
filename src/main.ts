import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { onInvalidResponse } from './api/http'

// Mock API działa także na produkcji (Vercel), bo projekt nie ma prawdziwego backendu.
// Aplikację montujemy dopiero po starcie workera - inaczej pierwsze żądania by go ominęły.
async function enableMocking() {
  const { worker } = await import('./mocks/browser')
  const options = { onUnhandledRequest: 'bypass', quiet: import.meta.env.PROD } as const
  await worker.start(options)

  // Przeglądarka usypia Service Workera po ok. 30 s bezczynności karty (np. po przełączeniu
  // na inną kartę). Wybudzony worker nie pamięta, że ta karta używa mocków, i przepuszcza
  // żądania do serwera, który zwraca index.html. Wtedy włączamy mocki ponownie, a api/http.ts
  // powtarza żądanie.
  onInvalidResponse(async () => {
    worker.stop()
    await worker.start(options)
  })
}

// Jeśli worker nie wystartuje, i tak montujemy aplikację - użytkownik zobaczy
// komunikat o błędzie z przyciskiem "Spróbuj ponownie" zamiast białej strony.
enableMocking()
  .catch((error) => console.error('[MSW] Nie udało się uruchomić mock API', error))
  .then(() => {
    const app = createApp(App)

    app.use(createPinia())
    app.use(router)

    app.mount('#app')
  })
