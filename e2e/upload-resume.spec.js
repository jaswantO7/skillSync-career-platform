const { test, expect } = require('@playwright/test')
const path = require('path')

const BASE = 'http://localhost:3000'

test.describe('SkillSync — Resume Upload End-to-End', () => {
  test('upload a resume and see AI analysis results', async ({ page }) => {
    // 1. Sign in
    await page.goto(`${BASE}/auth/signin`)
    await page.fill('input[name="email"]', 'joy@example.com')
    await page.fill('input[name="password"]', 'J@swant000')
    await page.click('button[type="submit"]')
    await page.waitForURL(/\/dashboard/, { timeout: 20000 })
    console.log('✓ Signed in, on dashboard')

    // 2. Navigate to skill audit
    await page.goto(`${BASE}/skill-audit`)
    await page.waitForSelector('h1')
    console.log('✓ On skill audit page')

    // 3. Verify the upload UI is visible
    await expect(page.getByRole('button', { name: 'Upload Resume' })).toBeVisible()
    console.log('✓ Upload UI visible')

    // 4. Upload the resume file via the dropzone
    // The FileUploader uses react-dropzone with an <input> inside it
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(path.resolve(__dirname, 'test-resume.txt'))
    console.log('✓ File selected')

    // 5. Wait for the file to appear in the uploader and click "Analyze Resume"
    await page.waitForSelector('text=test-resume.txt', { timeout: 5000 })
    await page.click('button:has-text("Analyze Resume")')
    console.log('✓ Clicked Analyze Resume')

    // 6. Wait for AI processing (step 2) with a longer timeout
    // The AI call goes to Express → OpenAI, could take 30-60s
    await page.waitForSelector('text=Analysis Complete', { timeout: 120000 })
    console.log('✓ Analysis complete!')

    // 7. Verify results are displayed
    await expect(page.locator('text=What\'s Next?')).toBeVisible()
    await expect(page.locator('text=Generate Career Path')).toBeVisible()

    // 8. Take a screenshot of results
    await page.screenshot({ path: 'e2e/resume-analysis-result.png', fullPage: true })
    console.log('✓ Screenshot saved')
  })
})
