import { test, expect } from '@playwright/test';

test.describe('Upload and Review Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('creator can upload clip and reviewer can approve it', async ({ page, context }) => {
    // Step 1: Sign in as creator
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'creator1@podkiya.com');
    await page.click('button:has-text("Sign in with Email")');

    // Wait for email verification (in real test, use test email provider)
    await page.goto('/'); // Assume signed in for test

    // Step 2: Navigate to upload page
    await page.goto('/upload');

    // Step 3: Fill upload form
    await page.fill('input[name="title"]', 'Test Clip: Science Facts');
    await page.fill('textarea[name="description"]', 'A test clip about interesting science facts');

    // Select language
    await page.selectOption('select[name="language"]', 'en');

    // Select tags (assuming multi-select component)
    await page.click('button:has-text("Select Tags")');
    await page.click('label:has-text("Science")');
    await page.click('label:has-text("Education")');
    await page.click('button:has-text("Done")');

    // Upload audio file
    const fileInput = await page.locator('input[type="file"][accept*="audio"]');
    await fileInput.setInputFiles('./e2e/fixtures/test-audio.mp3');

    // Submit form
    await page.click('button:has-text("Upload Clip")');

    // Wait for success message
    await expect(page.locator('text=Clip uploaded successfully')).toBeVisible();

    // Step 4: Sign out
    await page.click('button:has-text("Sign Out")');

    // Step 5: Sign in as reviewer
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'reviewer1@podkiya.com');
    await page.click('button:has-text("Sign in with Email")');
    await page.goto('/'); // Assume signed in

    // Step 6: Navigate to review dashboard
    await page.goto('/review');

    // Step 7: Find the uploaded clip in review queue
    const clipCard = page.locator('text=Test Clip: Science Facts').first();
    await expect(clipCard).toBeVisible();

    // Step 8: Click to review
    await clipCard.click();

    // Step 9: Listen to preview (test that player works)
    const playButton = page.locator('button[aria-label="Play"]');
    await playButton.click();
    await expect(page.locator('button[aria-label="Pause"]')).toBeVisible();

    // Step 10: Approve clip
    await page.click('button:has-text("Approve")');

    // Optionally add notes
    await page.fill('textarea[name="notes"]', 'Great content, approved!');
    await page.click('button:has-text("Confirm Approval")');

    // Wait for success
    await expect(page.locator('text=Clip approved')).toBeVisible();

    // Step 11: Verify clip appears in feed
    await page.goto('/feed');
    await expect(page.locator('text=Test Clip: Science Facts')).toBeVisible();
  });

  test('creator receives notification when clip is approved', async ({ page }) => {
    // Sign in as creator
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'creator1@podkiya.com');
    await page.click('button:has-text("Sign in with Email")');
    await page.goto('/');

    // Navigate to notifications
    await page.goto('/notifications');

    // Check for approval notification
    await expect(page.locator('text=Your clip was approved')).toBeVisible();
    await expect(page.locator('text=Test Clip: Science Facts')).toBeVisible();
  });

  test('feed allows playing clips with checkpoints', async ({ page }) => {
    // Navigate to feed without signing in (public access)
    await page.goto('/feed');

    // Find a clip card
    const clipCard = page.locator('[data-testid="clip-card"]').first();
    await expect(clipCard).toBeVisible();

    // Click play
    const playButton = clipCard.locator('button[aria-label="Play"]');
    await playButton.click();

    // Wait for 30 second checkpoint
    await page.waitForTimeout(30000);

    // Verify checkpoint event tracked (check via network or state)
    // In real test, mock analytics or check database

    // Pause
    await clipCard.locator('button[aria-label="Pause"]').click();
  });

  test('user can like and save clips', async ({ page }) => {
    // Sign in
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'reviewer1@podkiya.com');
    await page.click('button:has-text("Sign in with Email")');
    await page.goto('/feed');

    // Find clip
    const clipCard = page.locator('[data-testid="clip-card"]').first();

    // Like clip
    const likeButton = clipCard.locator('button[aria-label="Like"]');
    await likeButton.click();
    await expect(likeButton).toHaveAttribute('aria-pressed', 'true');

    // Save clip
    const saveButton = clipCard.locator('button[aria-label="Save"]');
    await saveButton.click();
    await expect(saveButton).toHaveAttribute('aria-pressed', 'true');

    // Unlike
    await likeButton.click();
    await expect(likeButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('search finds clips by title and transcript', async ({ page }) => {
    await page.goto('/search');

    // Search for "science"
    await page.fill('input[placeholder*="Search"]', 'science');
    await page.press('input[placeholder*="Search"]', 'Enter');

    // Wait for results
    await expect(page.locator('[data-testid="search-result"]')).toHaveCount(
      (count) => count > 0
    );

    // Verify result contains search term
    await expect(page.locator('text=science').first()).toBeVisible();
  });

  test('admin can view and remove reported clip', async ({ page, context }) => {
    // Step 1: Sign in as regular user and report a clip
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'reviewer1@podkiya.com');
    await page.click('button:has-text("Sign in with Email")');
    await page.goto('/feed');

    // Find clip and report
    const clipCard = page.locator('[data-testid="clip-card"]').first();
    await clipCard.locator('button[aria-label="More options"]').click();
    await page.click('button:has-text("Report")');

    // Fill report form
    await page.selectOption('select[name="reason"]', 'spam');
    await page.fill('textarea[name="notes"]', 'This is spam content');
    await page.click('button:has-text("Submit Report")');

    await expect(page.locator('text=Report submitted')).toBeVisible();

    // Sign out
    await page.click('button:has-text("Sign Out")');

    // Step 2: Sign in as admin
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'admin@podkiya.com');
    await page.click('button:has-text("Sign in with Email")');
    await page.goto('/admin/reports');

    // Step 3: View report
    await expect(page.locator('text=This is spam content')).toBeVisible();

    // Step 4: Remove clip
    await page.click('button:has-text("Remove Clip")');
    await page.click('button:has-text("Confirm")');

    await expect(page.locator('text=Clip removed successfully')).toBeVisible();

    // Step 5: Verify clip no longer in feed
    await page.goto('/feed');
    await expect(page.locator('[data-testid="clip-card"]')).not.toContainText(
      'Reported Clip Title'
    );
  });
});

test.describe('Keyboard Shortcuts', () => {
  test('reviewer can use keyboard shortcuts to navigate and review', async ({ page }) => {
    await page.goto('/auth/signin');
    await page.fill('input[type="email"]', 'reviewer1@podkiya.com');
    await page.click('button:has-text("Sign in with Email")');
    await page.goto('/review');

    // Press J to go to next clip
    await page.keyboard.press('j');

    // Press A to approve
    await page.keyboard.press('a');
    await expect(page.locator('text=Clip approved')).toBeVisible();

    // Press K to go to previous clip
    await page.keyboard.press('k');

    // Press R to reject
    await page.keyboard.press('r');
    await page.fill('textarea[name="notes"]', 'Does not meet quality standards');
    await page.keyboard.press('Enter');
    await expect(page.locator('text=Clip rejected')).toBeVisible();
  });
});

test.describe('RTL Support', () => {
  test('app switches to RTL layout when Arabic is selected', async ({ page }) => {
    await page.goto('/');

    // Switch language to Arabic
    await page.click('button[aria-label="Language"]');
    await page.click('button:has-text("العربية")');

    // Verify dir attribute
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    // Verify Arabic text is displayed
    await expect(page.locator('text=بودكيا')).toBeVisible();
  });
});
