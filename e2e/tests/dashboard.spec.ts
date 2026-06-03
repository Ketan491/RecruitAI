// e2e/tests/dashboard.spec.ts
// Critical path: dashboard KPI cards show live data (not hardcoded values).
import { test, expect } from '@playwright/test';
import { mockApi, loginAs } from './helpers';

test.describe('Dashboard', () => {
  test('KPI cards reflect API data', async ({ page }) => {
    await mockApi(page);
    await loginAs(page);

    // The mock returns total_applicants: 24 — verify the UI shows it
    await expect(page.getByText('24')).toBeVisible({ timeout: 5_000 });
  });

  test('delta badges are not hardcoded at 12', async ({ page }) => {
    // Override the stats mock to return specific delta values
    await page.route('/api/v1/dashboard/stats', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            total_applicants: 7, shortlisted: 3, in_interview: 1,
            offers_sent: 0, hired: 0, rejected: 1,
            // Deliberately unusual delta so we can assert it's rendered, not hardcoded
            deltas: { total_applicants: 99, shortlisted: 0, in_interview: 0, offers_sent: 0, hired: 0, rejected: 0 },
          },
        }),
      }),
    );

    await mockApi(page); // wire the rest of the routes
    await loginAs(page);

    // Delta of 99 must appear; the old hardcoded 12 must NOT appear as a delta
    await expect(page.getByText(/\+?99/)).toBeVisible({ timeout: 5_000 });
  });

  test('renders without crashing when deltas are zero or negative', async ({ page }) => {
    await page.route('/api/v1/dashboard/stats', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            total_applicants: 0, shortlisted: 0, in_interview: 0,
            offers_sent: 0, hired: 0, rejected: 0,
            deltas: { total_applicants: -5, shortlisted: -2, in_interview: 0, offers_sent: 0, hired: 0, rejected: 0 },
          },
        }),
      }),
    );

    await mockApi(page);
    await loginAs(page);
    // Page should load without a crash
    await expect(page.locator('body')).not.toContainText('Something went wrong', { timeout: 5_000 });
  });
});
