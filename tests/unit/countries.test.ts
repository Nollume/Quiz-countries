import { describe, expect, it, vi } from 'vitest'
import { fetchCountries, parsePage } from '../../server/utils/countries'

function country(code: string) {
  return { codes: { alpha_2: code }, names: { common: code }, region: 'Europe', capitals: [{ name: 'Capital' }], flag: { url_png: `https://example.com/${code}.png` } }
}
function page(codes: string[], more = false) {
  return { data: { objects: codes.map(country), meta: { more } } }
}

describe('REST Countries v5', () => {
  it('normalizes the new names, capital objects, flags and ISO codes', () => {
    expect(parsePage(page(['SK'])).countries[0]).toEqual({ code: 'SK', name: 'SK', region: 'Europe', capitals: ['Capital'], flag: 'https://example.com/SK.png' })
  })
  it('loads every page, requests only required fields and sends credentials in a header', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(page(['SK', 'CZ'], true)).mockResolvedValueOnce(page(['AT', 'PL']))
    expect(await fetchCountries('test-key', fetcher)).toHaveLength(4)
    expect(fetcher.mock.calls[1]?.[1]).toMatchObject({ headers: { Authorization: 'Bearer test-key' }, query: { limit: 100, offset: 2 }, retry: 0, timeout: 10_000 })
    expect(fetcher.mock.calls[0]?.[0]).toBe('https://api.restcountries.com/countries/v5')
  })
  it('does not make requests when the API key is missing', async () => {
    const fetcher = vi.fn()
    await expect(fetchCountries('', fetcher)).rejects.toThrow('not configured')
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('skips live v5 territories without ISO codes while retaining the raw page count', () => {
    const payload = page(['SK'])
    payload.data.objects.unshift({
      names: { common: 'Abkhazia' }, codes: { alpha_2: '' }, region: 'Asia',
      capitals: [{ name: 'Sukhumi' }], flag: { url_png: '' },
    })
    const result = parsePage(payload)
    expect(result.countries.map(country => country.code)).toEqual(['SK'])
    expect(result.count).toBe(2)
  })
  it('advances by the raw count even when an entire page has no usable ISO codes', async () => {
    // Empty-code territories still have valid names in the live API.
    const first = page([''], true)
    first.data.objects[0]!.names.common = 'Abkhazia'
    const second = page(['SK', '', 'CZ'], true)
    second.data.objects[1]!.names.common = 'Northern Cyprus'
    const fetcher = vi.fn()
      .mockResolvedValueOnce(first)
      .mockResolvedValueOnce(second)
      .mockResolvedValueOnce(page(['AT', 'PL']))
    const result = await fetchCountries('test-key', fetcher)
    expect(result.map(country => country.code)).toEqual(['SK', 'CZ', 'AT', 'PL'])
    expect(fetcher.mock.calls[1]?.[1].query.offset).toBe(1)
    expect(fetcher.mock.calls[2]?.[1].query.offset).toBe(4)
  })
  it.each([
    { success: false, data: null, errors: [{ message: 'deprecated' }] },
    { data: { objects: null } },
    { data: { objects: [null], meta: { more: false } } },
    { data: { objects: [], meta: {} } },
  ])('rejects malformed or unsuccessful responses, including HTTP 200 failures', payload => {
    expect(() => parsePage(payload)).toThrow('invalid data')
  })
  it('rejects demo data instead of pretending it is the full dataset', () => {
    expect(() => parsePage({ data: { _demo: {}, objects: [] } })).toThrow('demo key')
  })
  it('allows absent capital/flag data for mode-specific filtering', () => {
    const payload = { data: { objects: [{ ...country('SK'), capitals: null, flag: { url_png: 'javascript:alert(1)' } }], meta: { more: false } } }
    expect(parsePage(payload).countries[0]).toMatchObject({ capitals: [], flag: null })
  })
  it.each([401, 403, 410, 429, 500])('sanitizes upstream errors (%i) without leaking credentials', async statusCode => {
    const fetcher = vi.fn().mockRejectedValue({ statusCode, message: 'secret-key', data: { errors: [{ message: 'secret-key' }] } })
    const error = await fetchCountries('secret-key', fetcher).catch(error => error)
    expect(error.statusCode).toBe(502)
    expect(JSON.stringify(error)).not.toContain('secret-key')
  })
  it('stops repeated pages and does not return incomplete results', async () => {
    const fetcher = vi.fn().mockResolvedValue(page(['SK', 'CZ', 'AT', 'PL'], true))
    await expect(fetchCountries('test', fetcher)).rejects.toThrow('invalid data')
    expect(fetcher).toHaveBeenCalledTimes(2)
  })
  it('rejects empty data', async () => {
    await expect(fetchCountries('test', vi.fn().mockResolvedValue(page([])))).rejects.toThrow('invalid data')
  })
})
