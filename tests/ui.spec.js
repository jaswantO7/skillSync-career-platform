const { test, expect } = require('@playwright/test')

test.describe('Landing page', () => {
  test('loads all major sections', async ({ page }) => {
    await page.goto('/')

    // Hero
    await expect(page.locator('h1')).toContainText('Career')
    await expect(page.getByRole('link', { name: 'Get Free Skill Audit' })).toBeVisible()

    // Features section
    await expect(page.getByRole('heading', { name: /Everything you need to grow/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'AI Skill Analysis' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Career Paths' })).toBeVisible()

    // How it works
    await expect(page.getByRole('heading', { name: /Four steps to grow/ })).toBeVisible()

    // Testimonials
    await expect(page.getByRole('heading', { name: /Real people, real results/ })).toBeVisible()
    await expect(page.getByText('Sarah Chen')).toBeVisible()

    // Pricing
    await expect(page.getByRole('heading', { name: /Choose your growth plan/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Free', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pro', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Enterprise', exact: true })).toBeVisible()

    // CTA
    await expect(page.getByRole('link', { name: /Start Your Free/ })).toBeVisible()
  })

  test('navigation links scroll to sections', async ({ page }) => {
    await page.goto('/')
    await page.locator('a:has-text("Features")').first().click()
    await expect(page.locator('#features')).toBeVisible()
  })

  test('has gradient text elements', async ({ page }) => {
    await page.goto('/')
    const gradient = page.locator('[class*="gradient-text"]')
    expect(await gradient.count()).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Plans page', () => {
  test('shows all three plan tiers', async ({ page }) => {
    await page.goto('/plans')
    await expect(page.getByRole('heading', { name: /Choose your plan/ })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Free', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pro', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Enterprise', exact: true })).toBeVisible()
  })
})

test.describe('Mentor chat page', () => {
  test('page loads without 404', async ({ page }) => {
    const resp = await page.goto('/mentor')
    expect(resp.status()).toBeLessThan(400)
  })
})
