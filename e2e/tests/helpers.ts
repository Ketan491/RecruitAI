// e2e/tests/helpers.ts
// Shared fixtures, mock API intercepts, and seed data for Playwright tests.
import { type Page, type Route } from '@playwright/test';

// ── Seed data ─────────────────────────────────────────────────────────────────

export const TEST_USER = {
  id: 'user-001',
  name: 'Test Recruiter',
  email: 'recruiter@acme.com',
  password: 'TestPass123!',
  company_name: 'Acme Corp',
  role: 'recruiter' as const,
};

export const TEST_JOB = {
  id: 'job-001',
  title: 'Senior Frontend Engineer',
  department: 'Engineering',
  location: 'Remote',
  employment_type: 'Full-time',
  status: 'Active',
  description: 'Build great UIs with React and TypeScript.',
  required_skills: ['React', 'TypeScript', 'CSS'],
  required_experience_years: 3,
  applicant_count: 2,
  avg_ai_score: 81.5,
};

export const TEST_CANDIDATE = {
  id: 'cand-001',
  name: 'Alice Sharma',
  email: 'alice@example.com',
  phone: '+91-9000000001',
  job_id: 'job-001',
  job_title: 'Senior Frontend Engineer',
  company_id: 'user-001',
  stage: 'Applied',
  status: 'active',
  source: 'LinkedIn',
  overall_score: 87,
  ats_score: 79,
  resume_url: 'https://s3.example.com/resumes/cand-001/resume.pdf',
  ai_score: {
    summary: 'Strong React engineer with 5 years of experience.',
    strengths: ['React', 'TypeScript', 'Performance optimisation'],
    weaknesses: ['Limited backend exposure'],
    breakdown: {
      skill_match: { score: 36, matched_skills: ['React', 'TypeScript'], missing_skills: [], bonus_skills: [] },
      experience: { score: 28, years_detected: 5, relevance: 'high', highlights: [] },
      education: { score: 12, degree: 'B.Tech', field: 'CS' },
      communication: { score: 11, clarity: 'good', issues: [] },
    },
    interview_questions: {
      technical: ['Explain React reconciliation', 'How does useCallback work?'],
      behavioral: ['Describe a challenging project'],
      culture_fit: ['What motivates you?'],
    },
  },
  notes: [],
  timeline: [],
  interviews: [],
  days_in_stage: 3,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ── Mock API intercepts ───────────────────────────────────────────────────────

/**
 * Wire up all API mocks for a page. Call this at the start of every test
 * that doesn't need a real backend.
 */
export async function mockApi(page: Page): Promise<void> {
  const API = '/api/v1';

  // Auth
  await page.route(`${API}/auth/login`, async (route: Route) => {
    const body = JSON.parse((await route.request().postData()) ?? '{}');
    if (body.email === TEST_USER.email && body.password === TEST_USER.password) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            access_token: 'mock-access-token',
            user: { ...TEST_USER, created_at: new Date().toISOString() },
          },
        }),
      });
    } else {
      await route.fulfill({ status: 401, body: JSON.stringify({ success: false, message: 'Invalid credentials' }) });
    }
  });

  await page.route(`${API}/auth/logout`, route =>
    route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: null }) }),
  );

  await page.route(`${API}/auth/refresh`, route =>
    route.fulfill({ status: 200, body: JSON.stringify({ success: true, data: { access_token: 'mock-access-token' } }) }),
  );

  // Dashboard
  await page.route(`${API}/dashboard/stats`, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: {
          total_applicants: 24, shortlisted: 10, in_interview: 6,
          offers_sent: 2, hired: 1, rejected: 3,
          deltas: { total_applicants: 4, shortlisted: 2, in_interview: 1, offers_sent: 0, hired: 1, rejected: -1 },
        },
      }),
    }),
  );

  await page.route(`${API}/dashboard/funnel**`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }),
  );

  await page.route(`${API}/dashboard/score-trend**`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }),
  );

  // Jobs
  await page.route(`${API}/jobs**`, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { items: [TEST_JOB], total: 1, page: 1, pages: 1 } }),
    }),
  );

  // Candidates list
  await page.route(`${API}/candidates**`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: { items: [TEST_CANDIDATE], total: 1, page: 1, pages: 1 } }),
      });
    } else {
      await route.continue();
    }
  });

  // Candidate detail
  await page.route(`${API}/candidates/${TEST_CANDIDATE.id}`, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: TEST_CANDIDATE }),
    }),
  );

  // AI rescore
  await page.route(`${API}/ai/rescore/**`, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { status: 'completed', candidate_id: TEST_CANDIDATE.id } }),
    }),
  );

  // Pipeline
  await page.route(`${API}/pipeline**`, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { Applied: [TEST_CANDIDATE], Screened: [], 'Phone Screen': [], Technical: [], 'Final Round': [], Offer: [], Hired: [], Rejected: [] } }),
    }),
  );

  // Stage update (PATCH candidates/:id/stage)
  await page.route(`${API}/candidates/*/stage`, route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { ...TEST_CANDIDATE, stage: 'Screened' } }),
    }),
  );

  // Reports
  await page.route(`${API}/reports**`, route =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: [] }) }),
  );
}

/**
 * Log in via the UI and land on the dashboard.
 * Assumes mockApi() has already been called for this page.
 */
export async function loginAs(page: Page, user = TEST_USER): Promise<void> {
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(user.email);
  await page.getByLabel(/password/i).fill(user.password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
  await page.waitForURL('**/dashboard**');
}
