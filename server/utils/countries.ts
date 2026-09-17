import { createError } from 'h3'
import type { Country } from '../../shared/types/country'

const API_URL = 'https://api.restcountries.com/countries/v5'
const FIELDS = 'names.common,codes.alpha_2,region,capitals,flag.url_png'

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}

function text(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function invalidResponse(): never {
  throw createError({ statusCode: 502, message: 'The countries service returned invalid data. Please try again later.' })
}

export function parsePage(payload: unknown): { countries: Country[], count: number, more: boolean } {
  const envelope = record(payload)
  const data = record(envelope.data)
  if (envelope.success === false || (Array.isArray(envelope.errors) && envelope.errors.length)) invalidResponse()
  if (data._demo) throw createError({ statusCode: 503, message: 'The countries service is using a demo key. A personal REST Countries API key is required.' })
  if (!Array.isArray(data.objects)) invalidResponse()
  const meta = record(data.meta)
  if (typeof meta.more !== 'boolean') invalidResponse()

  const countries = data.objects.flatMap((item): Country[] => {
    const country = record(item)
    const code = text(record(country.codes).alpha_2).toUpperCase()
    const name = text(record(country.names).common)
    const region = text(country.region)
    if (!name || !region) invalidResponse()
    // The live v5 dataset includes territories without an ISO alpha-2 code.
    // They cannot be identified by our quiz model, but do not invalidate the page.
    if (!code) return []
    if (!/^[A-Z]{2}$/.test(code)) invalidResponse()
    const rawFlag = text(record(country.flag).url_png)
    let flag: string | null = null
    try {
      const url = new URL(rawFlag)
      if (url.protocol === 'https:') flag = url.href
    } catch { /* Missing flags are excluded from flag quizzes. */ }
    const capitals = Array.isArray(country.capitals)
      ? country.capitals.map(capital => text(record(capital).name)).filter(Boolean)
      : []
    return [{ code, name, region, capitals: [...new Set(capitals)], flag }]
  })
  return { countries, count: data.objects.length, more: meta.more }
}

type FetchPage = (url: string, options: { headers: Record<string, string>, query: Record<string, string | number>, timeout: number, retry: number }) => Promise<unknown>

export async function fetchCountries(apiKey: string, fetchPage: FetchPage): Promise<Country[]> {
  if (!apiKey.trim()) {
    throw createError({ statusCode: 503, message: 'The countries service is not configured. Please add the REST Countries API key on the server.' })
  }
  const countries = new Map<string, Country>()
  let offset = 0
  // Bound pagination so a malformed upstream response cannot exhaust the API quota.
  for (let page = 0; page < 10; page++) {
    let payload: unknown
    try {
      payload = await fetchPage(API_URL, {
        headers: { Authorization: `Bearer ${apiKey.trim()}` },
        query: { limit: 100, offset, response_fields: FIELDS },
        timeout: 10_000,
        retry: 0,
      })
    } catch (error) {
      const failure = record(error)
      const status = failure.statusCode ?? failure.status ?? record(failure.response).status
      const message = status === 401
        ? 'The countries service API key is invalid. Please check the server configuration.'
        : status === 403
          ? 'The countries service denied access. Please check the API key and account quota.'
          : status === 429
            ? 'The countries service request limit was reached. Please try again later.'
            : status === 410
              ? 'This version of the countries service is no longer available. Please contact the site owner.'
              : 'The countries service could not be reached. Please try again in a moment.'
      // Never forward upstream errors, request headers, or credentials to the browser.
      throw createError({ statusCode: 502, message })
    }
    const result = parsePage(payload)
    const previousSize = countries.size
    result.countries.forEach(country => countries.set(country.code, country))
    if (!result.more) {
      if (countries.size < 4) invalidResponse()
      return [...countries.values()]
    }
    if (!result.count || (result.countries.length > 0 && countries.size === previousSize)) invalidResponse()
    offset += result.count
  }
  return invalidResponse()
}
