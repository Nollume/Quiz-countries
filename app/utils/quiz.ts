import type { Country, Question, QuizMode, Region } from '../../shared/types/country'

export function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

export function eligibleCountries(countries: Country[], mode: QuizMode, region: Region): Country[] {
  const unique = [...new Map(countries.map(country => [country.code, country])).values()]
  return unique.filter(country =>
    (region === 'all' || country.region.toLowerCase() === region)
    && (mode === 'flags' ? Boolean(country.flag) : country.capitals.length > 0),
  )
}

export function createQuestions(countries: Country[], mode: QuizMode, region: Region): Question[] {
  const pool = eligibleCountries(countries, mode, region)
  if (pool.length < 4) throw new Error('Not enough countries are available for these settings. Choose another region or quiz type.')
  return shuffle(pool).slice(0, 20).map(country => {
    // Shared capitals must not produce two valid answers to the same clue.
    const distractors = pool.filter(other => other.code !== country.code && other.name !== country.name
      && (mode !== 'capitals' || !other.capitals.some(capital => country.capitals.includes(capital))))
    if (distractors.length < 3) throw new Error('Not enough different answers are available. Choose another region.')
    return { country, options: shuffle([country, ...shuffle(distractors).slice(0, 3)]) }
  })
}
