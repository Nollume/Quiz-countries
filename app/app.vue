<script setup lang="ts">
import type { Country, QuizMode, Region } from '../shared/types/country'
import { regions } from '#shared/types/country'
import { eligibleCountries } from './utils/quiz'

const mode = ref<QuizMode>('flags')
const region = ref<Region>('all')
const gameError = ref('')
const heading = useTemplateRef('heading')
const { data: countries, status, error, refresh } = useFetch<Country[]>('/api/countries', {
  server: false,
  default: () => [],
  retry: 0,
  timeout: 45_000,
})
const { questions, index, score, phase, selected, answered, timedOut, remaining, ready, question, start, answer, next, reset, clueReady } = useQuiz()
const loading = computed(() => status.value === 'pending' || status.value === 'idle')
const available = computed(() => eligibleCountries(countries.value, mode.value, region.value).length)
const errorMessage = computed(() => {
  if (!error.value) return ''
  const details = error.value.data as { message?: unknown, statusMessage?: unknown } | undefined
  const message = details?.message || details?.statusMessage
  return typeof message === 'string' ? message : 'Countries could not be loaded. Check your connection and try again.'
})
const resultMessage = computed(() => {
  const ratio = score.value / questions.value.length
  if (ratio === 1) return 'A perfect trip around the world. Well done!'
  if (ratio >= 0.75) return 'Great work! You know your way around the world.'
  if (ratio >= 0.5) return 'A good start. There is still more to discover!'
  return 'Every round is a chance to learn somewhere new. Try again!'
})

function startGame() {
  gameError.value = ''
  if (loading.value || error.value) return
  try { start(countries.value, mode.value, region.value) }
  catch (failure) { gameError.value = failure instanceof Error ? failure.message : 'The quiz could not be started.' }
}

watch([mode, region], () => { gameError.value = '' })
watch([phase, index], async () => {
  await nextTick()
  heading.value?.focus()
})
</script>

<template>
  <main class="mx-auto flex min-h-dvh w-full max-w-4xl flex-col justify-center px-6 py-10 sm:px-10 sm:py-16">
    <header class="mb-8 flex items-center justify-between gap-4">
      <span class="text-sm tracking-widest text-primary-400">COUNTRIES QUIZ</span>
      <button v-if="phase === 'playing'" class="secondary-button text-sm" @click="reset">End quiz</button>
    </header>

    <section v-if="phase === 'setup'" aria-labelledby="setup-heading" class="space-y-6">
      <div class="panel px-6 py-8 text-center sm:py-10">
        <h1 id="setup-heading" ref="heading" tabindex="-1" class="text-3xl sm:text-4xl">How well do you know the world?</h1>
        <p class="mt-4 text-primary-400">Flags or capital cities. Four answers. One country.</p>
      </div>

      <form class="space-y-6" @submit.prevent="startGame">
        <div class="grid gap-6 sm:grid-cols-2">
          <div>
            <label for="quiz-mode" class="mb-3 block">Quiz type</label>
            <select id="quiz-mode" v-model="mode" :disabled="loading" class="panel quiz-type-select w-full py-3 pr-16 pl-4 disabled:opacity-50">
              <option value="flags">Flags</option>
              <option value="capitals">Capital cities</option>
            </select>
            <p class="mt-3 text-sm text-primary-400">Up to 20 questions · 10 seconds each</p>
          </div>
          <fieldset class="panel p-4">
            <legend class="px-2">Choose a region</legend>
            <div class="grid grid-cols-2 gap-3">
              <label v-for="item in regions" :key="item" class="flex cursor-pointer items-center gap-2 capitalize">
                <input v-model="region" type="radio" name="region" :value="item" :disabled="loading" class="size-4 accent-accent">
                {{ item === 'all' ? 'All regions' : item }}
              </label>
            </div>
          </fieldset>
        </div>

        <div v-if="loading" role="status" class="panel p-5 text-center" aria-live="polite">Loading countries…</div>
        <div v-else-if="error" role="alert" class="rounded-lg border border-red-400/60 bg-red-950/30 p-5">
          <h2 class="text-lg text-red-200">We couldn't load the countries</h2>
          <p class="mt-2">{{ errorMessage }}</p>
          <button type="button" class="secondary-button mt-4" @click="refresh()">Try again</button>
        </div>
        <p v-else-if="available < 4" role="alert" class="text-amber-200">Not enough countries are available. Choose another region or quiz type.</p>
        <p v-else class="text-sm text-primary-400">{{ available }} countries available · {{ Math.min(20, available) }} questions this round</p>
        <p v-if="gameError" role="alert" class="text-red-200">{{ gameError }}</p>

        <button class="button w-full sm:w-auto sm:min-w-48" :disabled="loading || !!error || available < 4">Start quiz →</button>
      </form>
    </section>

    <section v-else-if="phase === 'playing' && question" aria-labelledby="question-heading" class="space-y-6">
      <div role="progressbar" aria-label="Time remaining" :aria-valuenow="Math.ceil(remaining)" :aria-valuemin="0" :aria-valuemax="10" class="h-3 overflow-hidden rounded-sm border border-accent bg-primary-900">
        <div class="h-full origin-left transition-transform duration-100 ease-linear" :class="remaining <= 2 ? 'bg-red-500' : 'bg-accent'" :style="{ transform: `scaleX(${remaining / 10})` }" />
      </div>
      <div class="flex items-center justify-between gap-3 text-sm sm:text-base">
        <p>Score: {{ score }}</p>
        <p class="text-primary-400">{{ Math.ceil(remaining) }}s</p>
        <p>{{ index + 1 }} / {{ questions.length }}</p>
      </div>
      <h1 id="question-heading" ref="heading" tabindex="-1" class="text-xl">{{ mode === 'flags' ? 'Which country does this flag belong to?' : 'Which country has this capital?' }}</h1>

      <div class="grid gap-4 sm:grid-cols-2">
        <QuizClue :key="question.country.code" :country="question.country" :mode="mode" @ready="clueReady" />
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2" role="group" aria-label="Answer choices">
          <button v-for="(option, optionIndex) in question.options" :key="`${question.country.code}:${option.code}`" class="relative flex min-h-16 items-center overflow-hidden rounded-md border text-left transition-colors sm:flex-col sm:text-center" :class="[
            answered && option.code === question.country.code ? 'border-green-400 bg-green-900' : answered && option.code === selected ? 'border-red-400 bg-red-950' : 'border-accent bg-primary-900',
            answered && option.code === selected ? (option.code === question.country.code ? 'answer-bounce' : 'answer-shake') : '',
            !answered && ready ? 'hover:bg-primary-700' : '',
            !ready ? 'opacity-40' : '',
          ]" :disabled="answered || !ready" @click="answer(option.code)">
            <span class="flex self-stretch items-center justify-center bg-accent px-4 py-2">{{ String.fromCharCode(65 + optionIndex) }}</span>
            <span class="my-auto px-3 py-3">{{ option.name }}<span v-if="answered && option.code === question.country.code" class="mt-1 block text-sm text-green-200">✓ Correct answer</span><span v-else-if="answered && option.code === selected" class="mt-1 block text-sm text-red-200">✕ Your answer</span></span>
          </button>
        </div>
      </div>

      <div class="flex min-h-14 flex-wrap items-center justify-between gap-4">
        <p role="status" aria-live="polite">
          <template v-if="answered">{{ timedOut ? 'Time’s up!' : selected === question.country.code ? 'Correct!' : 'Not quite.' }} <span v-if="timedOut || selected !== question.country.code">The answer is {{ question.country.name }}.</span></template>
          <span v-else class="text-primary-400">{{ ready ? 'Choose your answer.' : 'The timer starts when the clue is ready.' }}</span>
        </p>
        <button class="button ml-auto" :disabled="!answered" @click="next">{{ index + 1 === questions.length ? 'See results' : 'Next question' }} →</button>
      </div>
    </section>

    <section v-else-if="phase === 'summary'" aria-labelledby="result-heading" class="panel space-y-6 p-8 text-center sm:p-12">
      <p class="text-sm tracking-widest text-primary-400">QUIZ COMPLETE</p>
      <h1 id="result-heading" ref="heading" tabindex="-1" class="text-3xl">Your score</h1>
      <p class="text-6xl">{{ score }} <span class="text-3xl text-primary-400">/ {{ questions.length }}</span></p>
      <p>{{ resultMessage }}</p>
      <button class="button" @click="reset">Play again →</button>
    </section>

    <footer class="mt-10 text-center text-xs text-primary-400">A little geography. A little curiosity.</footer>
  </main>
</template>
