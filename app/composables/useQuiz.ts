import { computed, onScopeDispose, ref } from 'vue'
import type { Country, Question, QuizMode, Region } from '../../shared/types/country'
import { createQuestions } from '../utils/quiz'

export function useQuiz() {
  const questions = ref<Question[]>([])
  const index = ref(0)
  const score = ref(0)
  const phase = ref<'setup' | 'playing' | 'summary'>('setup')
  const selected = ref<string | null>(null)
  const answered = ref(false)
  const timedOut = ref(false)
  const remaining = ref(10)
  const ready = ref(false)
  const question = computed(() => questions.value[index.value])
  let timer: ReturnType<typeof setInterval> | undefined
  let deadline = 0

  function stopTimer() {
    clearInterval(timer)
    timer = undefined
  }

  function expire() {
    remaining.value = 0
    answered.value = true
    timedOut.value = true
    stopTimer()
  }

  function clueReady() {
    if (phase.value !== 'playing' || ready.value || answered.value) return
    ready.value = true
    deadline = Date.now() + 10_000
    timer = setInterval(() => {
      remaining.value = Math.max(0, (deadline - Date.now()) / 1000)
      if (remaining.value === 0) expire()
    }, 100)
  }

  function resetRound() {
    stopTimer()
    selected.value = null
    answered.value = false
    timedOut.value = false
    remaining.value = 10
    ready.value = false
  }

  function start(countries: Country[], mode: QuizMode, region: Region) {
    const nextQuestions = createQuestions(countries, mode, region)
    resetRound()
    questions.value = nextQuestions
    index.value = 0
    score.value = 0
    phase.value = 'playing'
  }

  function answer(code: string) {
    if (phase.value !== 'playing' || answered.value || !ready.value || !question.value) return
    if (Date.now() >= deadline) { expire(); return }
    if (!question.value.options.some(option => option.code === code)) return
    selected.value = code
    answered.value = true
    stopTimer()
    if (code === question.value.country.code) score.value++
  }

  function next() {
    if (!answered.value) return
    if (index.value + 1 >= questions.value.length) {
      stopTimer()
      phase.value = 'summary'
    } else {
      resetRound()
      index.value++
    }
  }

  function reset() {
    resetRound()
    phase.value = 'setup'
    questions.value = []
    index.value = 0
    score.value = 0
  }

  onScopeDispose(stopTimer)
  return { questions, index, score, phase, selected, answered, timedOut, remaining, ready, question, start, answer, next, reset, clueReady }
}
