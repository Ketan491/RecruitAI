// e2e/tests/auth.spec.ts
// Critical path: login, bad credentials, logout.
import { test, expect } from '@playwright/test';
import { mockApi, loginAs, TEST_USER } from './helpers';

test.describe('Authentication', () => {
  test('valid credentials navigate to dashboard', async ({ page }) => {
    await mockApi(page);
    await loginAs(page);
    await expect(page).toHaveURL(/dashboard/);
    // Dashboard KPI cards should be visible
    await expect(page.getByText(/total applicants/i)).toBeVisible();
  });

  test('invalid credentials show an error toast', async ({ page }) => {
    await mockApi(page);
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('badpassword');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
    await expect(page).toHaveURL(/login/);
  });

  test('empty form shows validation errors', async ({ page }) => {
    await mockApi(page);
    await page.goto('/login');
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page.getByText(/email is required/i)).toBeVisible();
  });

  test('logout clears session and redirects to login', async ({ page }) => {
    await mockApi(page);
    await loginAs(page);
    // Trigger logout (button in nav or settings)
    await page.getByRole('button', { name: /logout|sign out/i }).click();
    await expect(page).toHaveURL(/login/);
    // Navigating to a protected route should redirect back to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('unauthenticated access to protected route redirects to login', async ({ page }) => {
    await mockApi(page);
    await page.goto('/candidates');
    await expect(page).toHaveURL(/login/);
  });
});
