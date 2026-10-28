<script setup lang="ts" generic="T extends object">
import type { SortState, TableColumn } from '@/types'

const props = defineProps<{
  columns: TableColumn[]
  rows: T[]
  rowKey: keyof T
  caption: string
}>()

// Tabela nie sortuje danych sama - pokazuje tylko, po czym sortujemy, i zgłasza kliknięcia.
// Dane sortuje rodzic. Dzięki temu stan sortowania może trzymać np. URL.
const sort = defineModel<SortState>('sort')

function toggleSort(key: string) {
  const isSameColumn = sort.value?.key === key
  const direction = isSameColumn && sort.value?.direction === 'asc' ? 'desc' : 'asc'
  sort.value = { key, direction }
}

function ariaSort(col: TableColumn) {
  if (!col.sortable) return undefined
  if (sort.value?.key !== col.key) return 'none'
  return sort.value.direction === 'asc' ? 'ascending' : 'descending'
}

function sortIcon(key: string): string {
  if (sort.value?.key !== key) return '↕'
  return sort.value.direction === 'asc' ? '↑' : '↓'
}

function cellValue(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key]
}
</script>

<template>
  <!-- overflow-x-auto: na tablecie szeroka tabela przewija się w poziomie, a nie rozpycha strony -->
  <div class="overflow-x-auto rounded-card bg-surface shadow-card">
    <table class="min-w-full divide-y divide-line text-sm">
      <caption class="sr-only">
        {{
          caption
        }}
      </caption>
      <thead class="border-b border-line">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            scope="col"
            class="px-5 py-3.5 font-medium whitespace-nowrap text-muted"
            :class="col.align === 'right' ? 'text-right' : 'text-left'"
            :aria-sort="ariaSort(col)"
          >
            <button
              v-if="col.sortable"
              type="button"
              class="inline-flex items-center gap-1 font-medium hover:text-ink"
              @click="toggleSort(col.key)"
            >
              {{ col.label }}
              <span
                aria-hidden="true"
                :class="sort?.key === col.key ? 'text-brand-600' : 'text-subtle'"
                >{{ sortIcon(col.key) }}</span
              >
            </button>
            <template v-else>{{ col.label }}</template>
          </th>
        </tr>
      </thead>
      <tbody class="divide-y divide-line">
        <tr v-for="row in props.rows" :key="String(row[rowKey])" class="hover:bg-canvas/60">
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-5 py-3.5 align-top"
            :class="col.align === 'right' ? 'text-right' : 'text-left'"
          >
            <slot :name="`cell-${col.key}`" :row="row">{{ cellValue(row, col.key) }}</slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
