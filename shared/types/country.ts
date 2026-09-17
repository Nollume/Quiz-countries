export interface Country {
  code: string
  name: string
  region: string
  capitals: string[]
  flag: string | null
}

export type QuizMode = 'flags' | 'capitals'
export const regions = ['all', 'europe', 'asia', 'africa', 'americas', 'oceania'] as const
export type Region = typeof regions[number]

export interface Question {
  country: Country
  options: Country[]
}
