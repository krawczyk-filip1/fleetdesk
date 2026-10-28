import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, type VNode } from 'vue'
import DataTable from '../DataTable.vue'

interface Row {
  id: number
  name: string
  qty: number
}

const columns = [
  { key: 'name', label: 'Nazwa' },
  { key: 'qty', label: 'Ilość', align: 'right' as const },
]
const rows: Row[] = [
  { id: 1, name: 'Palety', qty: 12 },
  { id: 2, name: 'Kartony', qty: 40 },
]

// mount() nie potrafi wywnioskować typu T komponentu generycznego,
// więc renderujemy go przez h() - tak jak zrobiłby to komponent-rodzic.
function mountTable(slots: Record<string, (props: { row: Row }) => VNode> = {}) {
  return mount(() => h(DataTable<Row>, { columns, rows, rowKey: 'id', caption: 'Test' }, slots))
}

describe('DataTable', () => {
  it('renderuje nagłówki i wartości pól, gdy nie ma slotu', () => {
    const wrapper = mountTable()

    expect(wrapper.findAll('th').map((th) => th.text())).toEqual(['Nazwa', 'Ilość'])
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
    expect(wrapper.get('tbody tr').text()).toContain('Palety')
  })

  it('używa slotu cell-<key> do własnego wyglądu komórki', () => {
    const wrapper = mountTable({
      'cell-qty': ({ row }: { row: Row }) => h('strong', `${row.qty} szt.`),
    })

    expect(wrapper.findAll('strong').map((el) => el.text())).toEqual(['12 szt.', '40 szt.'])
  })

  it('po kliknięciu nagłówka zgłasza sortowanie, a drugie kliknięcie odwraca kierunek', async () => {
    const sortableColumns = [{ key: 'qty', label: 'Ilość', sortable: true }]
    const emitted: unknown[] = []
    const wrapper = mount(() =>
      h(DataTable<Row>, {
        columns: sortableColumns,
        rows,
        rowKey: 'id',
        caption: 'Test',
        sort: { key: 'qty', direction: 'asc' },
        'onUpdate:sort': (value: unknown) => emitted.push(value),
      }),
    )

    expect(wrapper.get('th').attributes('aria-sort')).toBe('ascending')

    await wrapper.get('th button').trigger('click')

    expect(emitted).toEqual([{ key: 'qty', direction: 'desc' }])
  })
})
