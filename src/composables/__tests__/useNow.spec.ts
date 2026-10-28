import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, type Ref } from 'vue'
import { useNow } from '../useNow'

function mountWithNow(intervalMs: number) {
  let now!: Ref<number>
  const wrapper = mount(
    defineComponent({
      setup() {
        now = useNow(intervalMs)
        return () => null
      },
    }),
  )
  return { wrapper, now: () => now.value }
}

describe('useNow', () => {
  afterEach(() => vi.useRealTimers())

  it('odświeża czas co podany interwał i przestaje po odmontowaniu', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-28T12:00:00Z'))
    const { wrapper, now } = mountWithNow(1000)
    const start = now()

    vi.advanceTimersByTime(1000)
    expect(now()).toBe(start + 1000)

    wrapper.unmount()
    vi.advanceTimersByTime(5000)
    // Po odmontowaniu interwał jest wyczyszczony - wartość już się nie zmienia
    expect(now()).toBe(start + 1000)
  })
})
