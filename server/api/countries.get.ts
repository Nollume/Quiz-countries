import { fetchCountries } from '../utils/countries'

// One shared dataset per cache instance; filtering happens in the browser.
// Only successful results are cached. Errors remain visible and retryable.
export default defineCachedEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  return fetchCountries(config.restCountriesApiKey, (url, options) => $fetch(url, options))
}, {
  name: 'countries-v5',
  maxAge: 60 * 60 * 24,
  swr: false,
  getKey: () => 'all',
})
