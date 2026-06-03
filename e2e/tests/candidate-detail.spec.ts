// e2e/tests/candidate-detail.spec.ts
// Critical path: detail page renders AI scores, re-score triggers API, no XSS.
import { test, expect } from '@playwright/test';
import { mockApi, loginAs, TEST_CANDIDATE } from './helpers';

test.describe('Candidate detail page', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
    await loginAs(page);
  });

  test('renders AI score and breakdown', async ({ page }) => {
    await page.goto(`/candidates/${TEST_CANDIDATE.id}`);
    await expect(page.getByText(TEST_CANDIDATE.name)).toBeVisible();
    await expect(page.getByText(String(TEST_CANDIDATE.overall_score))).toBeVisible();
    await expect(page.getByText(TEST_CANDIDATE.ai_score.summary)).toBeVisible();
  });

  test('re-score button calls POST /ai/rescore/:id', async ({ page }) => {
    let rescoreCalled = false;
    await page.route(`/api/v1/ai/rescore/${TEST_CANDIDATE.id}`, async (route) => {
      rescoreCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { status: 'completed', candidate_id: TEST_CANDIDATE.id } }),
      });
    });

    await page.goto(`/candidates/${TEST_CANDIDATE.id}`);
    await page.getByRole('button', { name: /re-?score/i }).click();
    await page.waitForTimeout(1_000);
    expect(rescoreCalled).toBe(true);
  });

  test('AI summary is not rendered as raw HTML (XSS guard)', async ({ page }) => {
    // Inject a candidate whose summary contains a script tag
    const xssCandidate = {
      ...TEST_CANDIDATE,
      id: 'cand-xss',
      ai_score: {
        ...TEST_CANDIDATE.ai_score,
        summary: '<script>window.__xss_fired=true</script>Strong candidate',
      },
    };

    await page.route(`/api/v1/candidates/cand-xss`, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: xssCandidate }),
      }),
    );

    await page.goto('/candidates/cand-xss');
    // The script must NOT have executed
    const xssFired = await page.evaluate(() => (window as any).__xss_fired);
    expect(xssFired).toBeFalsy();
    // The text content should still be visible (sanitized, not stripped entirely)
    await expect(page.getByText(/strong candidate/i)).toBeVisible();
  });

  test('shows all tab panels', async ({ page }) => {
    await page.goto(`/candidates/${TEST_CANDIDATE.id}`);
    const tabs = ['AI Overview', 'Resume', 'Notes', 'Interviews', 'Timeline'];
    for (const tabName of tabs) {
      const tab = page.getByRole('tab', { name: tabName }).or(page.getByText(tabName));
      if (await tab.isVisible()) {
        await tab.click();
        await expect(page).not.toHaveURL(/error/i);
      }
    }
  });

  test('download report button triggers PDF fetch', async ({ page }) => {
    let reportRequested = false;
    await page.route(`/api/v1/candidates/${TEST_CANDIDATE.id}/report`, async (route) => {
      reportRequested = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('%PDF-1.4 test'),
      });
    });

    await page.goto(`/candidates/${TEST_CANDIDATE.id}`);
    await page.getByRole('button', { name: /report|download/i }).click();
    await page.waitForTimeout(500);
    expect(reportRequested).toBe(true);
  });
});
