import { expect, test } from '@playwright/test'

const countries = Array.from({ length: 24 }, (_, index) => ({
  code: `C${index}`, name: `Country ${index}`, region: index < 20 ? 'Europe' : 'Asia',
  capitals: [`Capital ${index}`], flag: `https://flags.example.test/${index}.svg`,
}))
const flag = '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><path fill="#fff" d="M0 0h240v80H0z"/><path fill="#e22" d="M0 80h240v80H0z"/></svg>'

test('shows a server error, retries and completes a capital quiz without browser errors', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  let requests = 0
  await page.route('**/api/countries', route => {
    requests++
    return requests === 1
      ? route.fulfill({ status: 502, json: { message: 'The countries service request limit was reached. Please try again later.' } })
      : route.fulfill({ json: countries })
  })
  await page.goto('/')
  await expect(page.getByRole('alert')).toContainText('request limit')
  await expect(page.getByRole('button', { name: 'Start quiz' })).toBeDisabled()
  await page.getByRole('button', { name: 'Try again' }).click()
  await page.getByLabel('Quiz type').selectOption('capitals')
  await page.getByRole('radio', { name: 'Europe' }).check()
  await page.getByRole('button', { name: 'Start quiz' }).click()
  const seen = new Set<string>()
  for (let round = 0; round < 20; round++) {
    await expect(page.getByText(`${round + 1} / 20`, { exact: true })).toBeVisible()
    const clue = page.getByText(/^Capital \d+$/)
    const capital = (await clue.textContent())!
    expect(seen.has(capital)).toBe(false)
    seen.add(capital)
    await page.getByRole('button', { name: new RegExp(`^[A-D] Country ${capital.split(' ')[1]}$`) }).click()
    await expect(page.getByText('Correct!', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: round === 19 ? 'See results' : 'Next question' }).click()
  }
  await expect(page.getByRole('heading', { name: 'Your score' })).toBeVisible()
  await expect(page.getByText('20 / 20', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Play again' }).click()
  await expect(page.getByRole('button', { name: 'Start quiz' })).toBeEnabled()
  expect(requests).toBe(2)
  expect(errors).toEqual([])
})

test('flag failure is retryable and the timer waits for the image', async ({ page }) => {
  await page.route('**/api/countries', route => route.fulfill({ json: countries }))
  let imageRequests = 0
  await page.route('https://flags.example.test/**', route => {
    imageRequests++
    return imageRequests === 1 ? route.abort() : route.fulfill({ contentType: 'image/svg+xml', body: flag })
  })
  await page.goto('/')
  await page.getByRole('button', { name: 'Start quiz' }).click()
  await expect(page.getByRole('alert')).toContainText('flag could not be loaded')
  await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '10')
  await expect(page.getByRole('group', { name: 'Answer choices' }).getByRole('button').first()).toBeDisabled()
  await page.getByRole('button', { name: 'Retry flag' }).click()
  await expect(page.getByRole('img', { name: 'Flag to identify' })).toBeVisible()
  await expect(page.getByRole('group', { name: 'Answer choices' }).getByRole('button').first()).toBeEnabled()
  await page.getByRole('button', { name: 'End quiz' }).click()
  await expect(page.getByRole('button', { name: 'Start quiz' })).toBeEnabled()
})

test('reveals the correct answer on timeout and resets for the next question', async ({ page }) => {
  await page.route('**/api/countries', route => route.fulfill({ json: countries }))
  await page.clock.install()
  await page.goto('/')
  await page.getByLabel('Quiz type').selectOption('capitals')
  await page.getByRole('button', { name: 'Start quiz' }).click()
  await expect(page.getByText('Choose your answer.', { exact: true })).toBeVisible()
  await page.clock.fastForward(11_000)
  await expect(page.getByText(/Time’s up!/)).toBeVisible()
  await expect(page.getByText('Score: 0')).toBeVisible()
  await page.getByRole('button', { name: 'Next question' }).click()
  await expect(page.getByText('2 / 20', { exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next question' })).toBeDisabled()
})
