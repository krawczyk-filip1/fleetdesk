<script setup lang="ts">
import { nextTick, useTemplateRef, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppSidebar from '@/components/layout/AppSidebar.vue'

const route = useRoute()
const main = useTemplateRef<HTMLElement>('main')

// W SPA po kliknięciu linku focus zostaje w menu, a czytnik ekranu nie wie, że zmieniła się strona.
// Przenosimy focus na treść - ale tylko przy zmianie ścieżki, nie query:
// inaczej każda litera wpisana w wyszukiwarkę (?q=...) zabierałaby focus z pola.
watch(
  () => route.path,
  () => nextTick(() => main.value?.focus()),
)
</script>

<template>
  <a
    href="#main-content"
    class="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-surface focus:px-3 focus:py-2 focus:shadow"
  >
    Przejdź do treści
  </a>

  <div class="flex min-h-screen flex-col md:flex-row">
    <AppSidebar />

    <!-- min-w-0: element flex domyślnie nie zwęża się poniżej szerokości treści,
         więc szeroka tabela rozpychałaby stronę zamiast przewijać się w swoim kontenerze.
         focus:outline-none: focus ustawiany z kodu nie potrzebuje ramki wokół całej strony -->
    <main
      id="main-content"
      ref="main"
      tabindex="-1"
      class="min-w-0 flex-1 p-4 focus:outline-none md:p-6 lg:p-8"
    >
      <RouterView />
    </main>
  </div>
</template>
