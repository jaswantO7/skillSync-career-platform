const { test, expect } = require('@playwright/test')

const BASE = 'http://localhost:3000'

test.describe('Dashboard Stats Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Sign in with real backend (no route mocking)
    await page.goto(`${BASE}/auth/signin`)
    await page.fill('input[name="email"]', 'joy@example.com')
    await page.fill('input[name="password"]', 'J@swant000')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 20000 })
  })

  test('dashboard shows stats from real API data', async ({ page }) => {
    // Wait for stat cards to render
    await page.waitForSelector('text=Total Points', { timeout: 10000 })
    await page.waitForSelector('text=Current Level', { timeout: 5000 })
    await page.waitForSelector('text=Current Streak', { timeout: 5000 })
    await page.waitForSelector('text=Weekly Hours', { timeout: 5000 })

    // Capture the stat values
    const cardTexts = await page.locator('text=Total Points, Current Level, Current Streak, Weekly Hours').allTextContents()
    console.log('Stat card texts:', cardTexts)

    // Log all stat values by reading the card values
    const totalPoints = await page.locator('text=Total Points').locator('..').locator('p.font-bold').textContent()
    console.log('Total Points value:', totalPoints)

    const level = await page.locator('text=Current Level').locator('..').locator('p.font-bold').textContent()
    console.log('Level value:', level)

    const streak = await page.locator('text=Current Streak').locator('..').locator('p.font-bold').textContent()
    console.log('Streak value:', streak)

    const weeklyHours = await page.locator('text=Weekly Hours').locator('..').locator('p.font-bold').textContent()
    console.log('Weekly Hours value:', weeklyHours)

    // Check weekly progress section
    await expect(page.locator('text=Weekly Progress')).toBeVisible()
    
    // Log API responses via console capture
    const apiLogs = []
    page.on('console', msg => {
      if (msg.text().includes('Fetch stats error') || msg.text().includes('Fetch progress error')) {
        apiLogs.push(msg.text())
      }
    })

    // Navigate away and back to force re-fetch
    await page.goto(`${BASE}/skill-audit`)
    await page.waitForTimeout(2000)
    await page.goto(`${BASE}/dashboard`)
    await page.waitForSelector('text=Total Points', { timeout: 10000 })
    await page.waitForTimeout(3000)

    console.log('API error logs:', apiLogs)
    
    // Screenshot for visual inspection
    await page.screenshot({ path: 'e2e/dashboard-stats.png', fullPage: true })
  })
})
