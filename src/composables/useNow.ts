import { onMounted, onUnmounted, ref } from 'vue'

export function useNow(intervalMs = 60_000) {
  const now = ref(Date.now())
  let timer: ReturnType<typeof setInterval> | undefined

  onMounted(() => {
    timer = setInterval(() => (now.value = Date.now()), intervalMs)
  })

  onUnmounted(() => clearInterval(timer))

  return now
}
