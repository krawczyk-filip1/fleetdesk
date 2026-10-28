<script setup lang="ts">
import { onMounted, onUnmounted, useTemplateRef, watch } from 'vue'
import L from 'leaflet'
// CSS Leafleta importujemy tutaj, a nie globalnie - trafi do paczki tylko strony z mapą
import 'leaflet/dist/leaflet.css'
import type { GeoPoint } from '@/types'

export interface MapMarker {
  id: string
  position: GeoPoint
  label: string
  color: string
}

const props = defineProps<{
  markers: MapMarker[]
  selectedId: string | null
}>()

const emit = defineEmits<{ select: [id: string] }>()

const POLAND_CENTER: L.LatLngTuple = [52.0, 19.4]

const container = useTemplateRef<HTMLDivElement>('container')

// Celowo NIE ref(): Leaflet sam zarządza swoimi obiektami. Reaktywny Proxy Vue
// wokół mapy Leafleta tylko spowalnia i potrafi psuć jej wewnętrzny stan.
let map: L.Map | null = null
const layers = new Map<string, L.CircleMarker>()

// textContent zamiast HTML: Leaflet wstawia stringi jako HTML, a tak nie da się
// "wstrzyknąć" kodu (XSS), nawet gdyby nazwa przyszła z API z niebezpiecznymi znakami
function textElement(text: string): HTMLElement {
  const element = document.createElement('span')
  element.textContent = text
  return element
}

function syncMarkers(markers: MapMarker[]) {
  if (!map) return
  for (const marker of markers) {
    const existing = layers.get(marker.id)
    if (existing) {
      existing.setLatLng(marker.position)
      existing.setStyle({ fillColor: marker.color })
      continue
    }
    const layer = L.circleMarker(marker.position, {
      radius: 9,
      color: '#ffffff',
      weight: 2,
      fillColor: marker.color,
      fillOpacity: 1,
    })
      .bindTooltip(textElement(marker.label))
      .on('click', () => emit('select', marker.id))
      .addTo(map)
    layers.set(marker.id, layer)
  }
}

onMounted(() => {
  if (!container.value) return
  map = L.map(container.value, { center: POLAND_CENTER, zoom: 6 })
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map)
  syncMarkers(props.markers)
})

// Przesuwamy istniejące znaczniki zamiast tworzyć je od nowa - płynniej i bez migania
watch(() => props.markers, syncMarkers)

watch(
  () => props.selectedId,
  (id) => {
    const layer = id ? layers.get(id) : undefined
    if (!map || !layer) return
    // prefers-reduced-motion: przeskok zamiast animowanego przelotu
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    map.flyTo(layer.getLatLng(), 8, { animate: !reduceMotion })
    layer.openTooltip()
  },
)

onUnmounted(() => {
  map?.remove()
  map = null
  layers.clear()
})
</script>

<template>
  <div
    ref="container"
    role="region"
    aria-label="Mapa pozycji pojazdów"
    class="h-[60vh] min-h-96 w-full rounded-card shadow-card"
  />
</template>
