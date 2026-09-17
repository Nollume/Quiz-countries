import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope } from 'vue'
import type { Country } from '../../shared/types/country'
import { createQuestions, eligibleCountries } from '../../app/utils/quiz'
import { useQuiz } from '../../app/composables/useQuiz'

const countries: Country[] = Array.from({ length: 30 }, (_, i) => ({
  code: `C${i}`, name: `Country ${i}`, region: i < 25 ? 'Europe' : 'Asia', capitals: [`Capital ${i}`], flag: `https://example.com/${i}.png`,
}))

describe('questions', () => {
  it('creates 20 unique questions, each with 4 unique answers including the correct one', () => {
    const questions = createQuestions(countries, 'flags', 'europe')
    expect(questions).toHaveLength(20)
    expect(new Set(questions.map(question => question.country.code)).size).toBe(20)
    for (const question of questions) {
      expect(new Set(question.options.map(option => option.code)).size).toBe(4)
      expect(question.options).toContainEqual(question.country)
      expect(question.options.every(country => country.region === 'Europe')).toBe(true)
    }
  })
  it('excludes missing clues and uses the actual total for small regions', () => {
    expect(eligibleCountries([{ ...countries[0]!, capitals: [] }], 'capitals', 'all')).toEqual([])
    expect(eligibleCountries([{ ...countries[0]!, flag: null }], 'flags', 'all')).toEqual([])
    expect(createQuestions(countries, 'flags', 'asia')).toHaveLength(5)
    expect(() => createQuestions(countries.slice(0, 3), 'flags', 'all')).toThrow('Not enough')
  })
  it('excludes countries sharing the clue capital from distractors', () => {
    const pool = countries.map(country => ({ ...country, capitals: country.code === 'C1' ? ['Capital 0'] : country.capitals }))
    for (const question of createQuestions(pool, 'capitals', 'all')) {
      expect(question.options.filter(option => option.capitals.some(capital => question.country.capitals.includes(capital)))).toHaveLength(1)
    }
  })
})

describe('game lifecycle', () => {
  afterEach(() => vi.useRealTimers())
  function setup() {
    vi.useFakeTimers()
    const scope = effectScope()
    const game = scope.run(() => useQuiz())!
    game.start(countries, 'flags', 'all')
    return { game, scope }
  }
  it('waits for the clue, accepts only one answer and stops the timer', () => {
    const { game, scope } = setup()
    vi.advanceTimersByTime(20_000)
    expect(game.answered.value).toBe(false)
    game.answer(game.question.value!.country.code)
    expect(game.score.value).toBe(0)
    game.clueReady()
    game.answer(game.question.value!.country.code)
    game.answer(game.question.value!.country.code)
    expect(game.score.value).toBe(1)
    expect(vi.getTimerCount()).toBe(0)
    scope.stop()
  })
  it('times out and blocks late answers even if the interval was throttled', () => {
    const { game, scope } = setup()
    game.clueReady()
    vi.setSystemTime(Date.now() + 11_000)
    game.answer(game.question.value!.country.code)
    expect(game.timedOut.value).toBe(true)
    expect(game.score.value).toBe(0)
    scope.stop()
  })
  it('reveals an unanswered question after ten seconds', () => {
    const { game, scope } = setup()
    game.clueReady()
    vi.advanceTimersByTime(10_000)
    expect(game.timedOut.value).toBe(true)
    expect(game.answered.value).toBe(true)
    expect(game.remaining.value).toBe(0)
    scope.stop()
  })
  it('finishes exactly 20 rounds, then resets all game state', () => {
    const { game, scope } = setup()
    game.next()
    expect(game.index.value).toBe(0)
    for (let i = 0; i < 20; i++) {
      game.clueReady()
      game.answer(game.question.value!.country.code)
      game.next()
    }
    expect(game.phase.value).toBe('summary')
    expect(game.score.value).toBe(20)
    game.reset()
    expect(game.phase.value).toBe('setup')
    expect(game.score.value).toBe(0)
    expect(game.questions.value).toEqual([])
    expect(vi.getTimerCount()).toBe(0)
    scope.stop()
  })
  it('cleans up timers on reset and unmount', () => {
    const { game, scope } = setup()
    game.clueReady()
    game.reset()
    expect(vi.getTimerCount()).toBe(0)
    game.start(countries, 'flags', 'all')
    game.clueReady()
    scope.stop()
    expect(vi.getTimerCount()).toBe(0)
  })
})
