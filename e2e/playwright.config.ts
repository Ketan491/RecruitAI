import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:5173',
    // All requests route to the mock server defined in global-setup
    // In CI, set API_BASE_URL=http://localhost:8000 for a real backend
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Spin up Vite dev server before tests run
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    cwd: '../frontend',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
