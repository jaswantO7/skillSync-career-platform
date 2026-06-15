const { test, expect } = require('@playwright/test')

const BASE = 'http://localhost:3000'

// Mock user profile returned by the backend
const MOCK_USER = {
  success: true,
  data: {
    user: {
      _id: 'mock-user-1',
      email: 'joy@example.com',
      name: 'Joy',
      role: 'Software Engineer',
      preferences: { careerGoals: ['Senior Developer'] },
      profile: { bio: 'Test user' },
      onboardingCompleted: true,
    },
    skillGraph: null,
    progress: null,
  },
}

const MOCK_STATS = {
  success: true,
  data: {
    totalPoints: 1250,
    level: 2,
    streak: { current: 5, longest: 12 },
    totalSkills: 8,
    completedProjects: 1,
    hoursLearned: 24,
    achievements: 3,
    weeklyProgress: { hoursCompleted: 6, hoursTarget: 10, tasksCompleted: 3, tasksTarget: 5 },
  },
}

test.describe('SkillSync — Landing Page', () => {
  test('loads hero section with title and CTA', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('h1')).toContainText('AI Career')
    await expect(page.locator('text=Get Your Free Skill Audit')).toBeVisible()
  })

  test('shows features section after scroll', async ({ page }) => {
    await page.goto(BASE)
    await page.evaluate(() => window.scrollTo(0, 800))
    await page.waitForTimeout(1500)
    await expect(page.locator('text=Everything You Need to Grow')).toBeVisible()
    await expect(page.getByRole('heading', { name: 'AI-Powered Skill Analysis' })).toBeVisible()
  })

  test('shows pricing section', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('text=$0')).toBeVisible()
    await expect(page.locator('text=$29')).toBeVisible()
  })

  test('has working Navbar with auth links', async ({ page }) => {
    await page.goto(BASE)
    await expect(page.locator('a[href="/auth/signin"]')).toBeVisible()
    await expect(page.locator('a[href="/auth/signup"]')).toBeVisible()
  })
})

test.describe('SkillSync — Auth Pages', () => {
  test('sign in page renders form', async ({ page }) => {
    await page.goto(`${BASE}/auth/signin`)
    await expect(page.locator('h1')).toContainText('Welcome Back')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
  })

  test('sign up page renders form', async ({ page }) => {
    await page.goto(`${BASE}/auth/signup`)
    await expect(page.locator('h1')).toContainText('Create Account')
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="email"]')).toBeVisible()
  })

  test('reset password page renders', async ({ page }) => {
    await page.goto(`${BASE}/auth/reset-password`)
    await expect(page.locator('h1')).toContainText('Reset Password')
  })
})

test.describe('SkillSync — Protected Pages (redirect without auth)', () => {
  for (const path of ['dashboard', 'skill-audit', 'career-path', 'roadmap', 'projects', 'mentor']) {
    test(`${path} redirects to sign in`, async ({ page }) => {
      await page.goto(`${BASE}/${path}`)
      await expect(page).toHaveURL(/\/auth\/signin/)
    })
  }
})

test.describe('SkillSync — Sign In Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock backend API calls that the auth context makes after Firebase sign-in
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) })
    })
    await page.route('**/api/user/stats', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STATS) })
    })
    await page.route('**/api/progress/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { progress: null, activeRoadmap: null, activeProjects: [] } }) })
    })
  })

  test('signs in with valid credentials', async ({ page }) => {
    await page.goto(`${BASE}/auth/signin`)
    await page.fill('input[name="email"]', 'joy@example.com')
    await page.fill('input[name="password"]', 'J@swant000')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 20000 })
    await expect(page.locator('h1')).toContainText('Welcome back')
  })

  test('shows validation errors on empty form', async ({ page }) => {
    await page.goto(`${BASE}/auth/signin`)
    await page.click('button[type="submit"]')
    await expect(page.locator('text=Email is required')).toBeVisible()
    await expect(page.locator('text=Password is required')).toBeVisible()
  })
})

test.describe('SkillSync — Dashboard (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) })
    })
    await page.route('**/api/user/stats', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STATS) })
    })
    await page.route('**/api/progress/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { progress: null, activeRoadmap: null, activeProjects: [] } }) })
    })
    await page.goto(`${BASE}/auth/signin`)
    await page.fill('input[name="email"]', 'joy@example.com')
    await page.fill('input[name="password"]', 'J@swant000')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 20000 })
  })

  test('dashboard shows stats cards', async ({ page }) => {
    await expect(page.locator('text=Total Points')).toBeVisible()
    await expect(page.locator('text=Current Level')).toBeVisible()
    await expect(page.locator('text=Weekly Hours')).toBeVisible()
  })

  test('dashboard shows quick actions', async ({ page }) => {
    await expect(page.locator('text=Upload Resume')).toBeVisible()
    await expect(page.locator('text=Chat with Mentor')).toBeVisible()
  })

  test('sidebar navigation links are visible', async ({ page }) => {
    await expect(page.locator('text=Skill Audit')).toBeVisible()
    await expect(page.locator('text=Career Path')).toBeVisible()
    await expect(page.locator('text=Mentor Chat')).toBeVisible()
  })
})

test.describe('SkillSync — Core Feature Pages (authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/user/me', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) })
    })
    await page.route('**/api/user/stats', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STATS) })
    })
    await page.route('**/api/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: {} }) })
    })
    await page.goto(`${BASE}/auth/signin`)
    await page.fill('input[name="email"]', 'joy@example.com')
    await page.fill('input[name="password"]', 'J@swant000')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 20000 })
  })

  test('skill-audit page loads with upload options', async ({ page }) => {
    await page.goto(`${BASE}/skill-audit`)
    await expect(page.locator('h1')).toContainText('AI-Powered Skill Audit')
    await expect(page.getByRole('button', { name: 'Upload Resume' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'LinkedIn Profile' })).toBeVisible()
  })

  test('career-path page shows recommendations', async ({ page }) => {
    await page.goto(`${BASE}/career-path`)
    await expect(page.locator('h1')).toContainText('Career Path Recommendations')
    await expect(page.locator('text=Senior Software Engineer')).toBeVisible()
    await expect(page.locator('text=Engineering Manager')).toBeVisible()
  })

  test('roadmap page shows learning plan', async ({ page }) => {
    await page.goto(`${BASE}/roadmap`)
    await expect(page.locator('h1')).toContainText('Path to Senior Software Engineer')
    await expect(page.locator('text=Overall Progress')).toBeVisible()
  })

  test('projects page shows portfolio projects', async ({ page }) => {
    await page.goto(`${BASE}/projects`)
    await expect(page.locator('h1')).toContainText('Portfolio Projects')
    await expect(page.locator('text=E-commerce Dashboard')).toBeVisible()
  })

  test('mentor page shows chat interface', async ({ page }) => {
    await page.goto(`${BASE}/mentor`)
    await expect(page.locator('text=Alex - AI Career Mentor')).toBeVisible()
    await expect(page.locator('textarea')).toBeVisible()
  })
})
