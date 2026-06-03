// e2e/tests/upload-score.spec.ts
// Critical path: upload a resume → AI scores → candidate appears in list.
import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { mockApi, loginAs, TEST_JOB, TEST_CANDIDATE } from './helpers';

// Minimal 1-page PDF (valid magic bytes) used as a fake resume upload.
function minimalPdfBuffer(): Buffer {
  return Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n' +
    'xref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n' +
    '0000000058 00000 n\n0000000115 00000 n\n' +
    'trailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF',
  );
}

test.describe('Resume upload → AI scoring pipeline', () => {
  test('uploading a PDF creates a scored candidate entry', async ({ page }) => {
    await mockApi(page);

    // Mock the upload endpoint to return our seeded candidate
    await page.route('/api/v1/candidates/upload', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: TEST_CANDIDATE }),
      }),
    );

    await loginAs(page);
    await page.goto('/candidates');

    // Open upload modal / click upload button
    await page.getByRole('button', { name: /upload|add candidate/i }).first().click();

    // Select the job
    const jobSelector = page.getByRole('combobox', { name: /job|position/i });
    if (await jobSelector.isVisible()) {
      await jobSelector.selectOption({ label: TEST_JOB.title });
    }

    // Attach the fake PDF
    const tmpPath = path.join('/tmp', `test-resume-${Date.now()}.pdf`);
    fs.writeFileSync(tmpPath, minimalPdfBuffer());

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tmpPath);
    fs.unlinkSync(tmpPath);

    // Submit
    await page.getByRole('button', { name: /upload|submit|add/i }).last().click();

    // Candidate should appear in the list
    await expect(page.getByText(TEST_CANDIDATE.name)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(String(TEST_CANDIDATE.overall_score))).toBeVisible();
  });

  test('non-PDF/DOCX file is rejected before upload', async ({ page }) => {
    await mockApi(page);
    await loginAs(page);
    await page.goto('/candidates');

    await page.getByRole('button', { name: /upload|add candidate/i }).first().click();

    const tmpPath = path.join('/tmp', `bad-file-${Date.now()}.exe`);
    fs.writeFileSync(tmpPath, Buffer.from('MZ\x90\x00'));

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tmpPath);
    fs.unlinkSync(tmpPath);

    // Should show a validation error — not navigate away
    await expect(page.getByText(/pdf|docx|invalid file type/i)).toBeVisible({ timeout: 4_000 });
  });

  test('uploaded candidate score appears on detail page', async ({ page }) => {
    await mockApi(page);
    await loginAs(page);

    await page.goto(`/candidates/${TEST_CANDIDATE.id}`);

    await expect(page.getByText(TEST_CANDIDATE.name)).toBeVisible();
    await expect(page.getByText(String(TEST_CANDIDATE.overall_score))).toBeVisible();
    await expect(page.getByText(TEST_CANDIDATE.ai_score.summary)).toBeVisible();
  });
});
