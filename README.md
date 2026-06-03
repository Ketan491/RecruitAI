# RecruitAI — AI-Powered Recruitment SaaS

Full-stack recruitment platform with Claude AI-powered resume scoring, kanban pipeline, and analytics dashboard.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 + Vite + TypeScript + Tailwind CSS |
| State | Zustand + TanStack Query |
| Charts | Recharts |
| Backend | FastAPI + Python 3.12.10 |
| Database | MongoDB Atlas (via Beanie ODM) |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| File Storage | AWS S3 |
| Auth | JWT (httpOnly cookies for refresh) |
| Deploy | Vercel (frontend) + Render (backend) |

## Quick Start (Local Dev)

### Prerequisites
- Node.js 20+
- Python 3.12.10+
- MongoDB (local or Atlas)
- Anthropic API key

---

### 1. Clone & set up environment

```bash
cd frontend && cp .env.example .env
cd ../backend && cp .env.example .env
```

Edit both `.env` files with your credentials.

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

### 3. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
# → http://localhost:8000
# → http://localhost:8000/docs  (Swagger UI)
```

---

## Project Structure

```
recruitai/
├── frontend/
│   ├── src/
│   │   ├── components/        # UI, layout, charts, candidate, dashboard
│   │   ├── hooks/             # useAuth, useCandidates, useJobs, useAI, etc.
│   │   ├── pages/             # DashboardPage, CandidatesPage, PipelinePage, etc.
│   │   ├── services/          # Axios API service layer
│   │   ├── store/             # Zustand stores (auth, candidate, ui)
│   │   ├── types/             # TypeScript interfaces
│   │   └── utils/             # formatters, validators, constants
│   ├── tailwind.config.ts
│   └── vite.config.ts
│
└── backend/
    ├── main.py                # FastAPI app + CORS + middleware
    ├── config.py              # pydantic-settings
    ├── api/v1/routes/         # auth, candidates, jobs, pipeline, dashboard, ai
    ├── models/                # Beanie documents (User, JobDoc, CandidateDoc)
    ├── schemas/               # Pydantic request/response schemas
    ├── services/              # ai_service, resume_parser, storage
    ├── auth/                  # JWT helpers + FastAPI deps
    └── database/              # MongoDB connection
```

---

## Key Features

- **AI Resume Scoring** — Claude scores each resume against job requirements (skill match 40pts, experience 30pts, education 15pts, communication 15pts) with retry logic and fallback
- **Kanban Pipeline** — Drag-and-drop candidate board with stage history
- **Multi-job Support** — Create and manage multiple open positions
- **ATS Score** — Keyword matching score alongside AI score
- **Interview Questions** — AI-generated technical, behavioral, and culture-fit questions per candidate
- **Timeline & Notes** — Full audit trail per candidate
- **Role-based Access** — Admin / Recruiter / Viewer RBAC
- **CSV Export** — Export filtered candidate lists
- **PDF Report Download** — Per-candidate AI report

---

## Environment Variables

### Frontend (`frontend/.env`)
```
VITE_API_BASE_URL=http://localhost:8000
```

### Backend (`backend/.env`)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=min-32-char-secret
JWT_REFRESH_SECRET=another-32-char-secret
ANTHROPIC_API_KEY=sk-ant-...
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=recruitai-resumes
AWS_REGION=ap-south-1
CORS_ORIGINS=http://localhost:5173
ENV=development
```

---

## Deployment

### Frontend → Vercel
```bash
cd frontend
npx vercel --prod
```
Set `VITE_API_BASE_URL` to your Render backend URL in Vercel environment variables.

### Backend → Render
Push to GitHub → connect repo in Render → use `render.yaml` → add env vars.

---

## VS Code Recommended Extensions

Install the workspace extension recommendations by opening the Command Palette → `Extensions: Show Recommended Extensions`.

Extensions included:
- ESLint, Prettier, Tailwind CSS IntelliSense, TypeScript Hero (frontend)
- Python, Pylance, Ruff, Even Better TOML (backend)

---

## Code Quality & Tooling

### Frontend
| Tool | Purpose | Config |
|---|---|---|
| Prettier | Code formatting | `frontend/.prettierrc` |
| ESLint | Linting (flat config) | `frontend/eslint.config.js` |
| TypeScript | Type checking | `frontend/tsconfig.json` |
| Husky | Git hooks | `frontend/.husky/` |
| lint-staged | Run tools on changed files only | `frontend/package.json` |
| commitlint | Enforce Conventional Commits | `frontend/commitlint.config.js` |

### Backend
| Tool | Purpose | Config |
|---|---|---|
| Ruff | Linting + formatting (replaces black/isort/flake8) | `backend/pyproject.toml` |
| pytest | Test runner with async + coverage | `backend/pyproject.toml` |

### Repo-wide
| File | Purpose |
|---|---|
| `.editorconfig` | Editor-level indent, line endings, charset |
| `.gitignore` | Excludes build artifacts, secrets, OS files |
| `.vscode/extensions.json` | Recommended extensions for team |
| `.vscode/launch.json` | Debug configs (FastAPI, Vite, Playwright) |

### Running quality checks

```bash
# Frontend — from frontend/
npm run validate          # type-check + lint + format check (use in CI)
npm run lint:fix          # auto-fix ESLint issues
npm run format            # auto-format all files

# Backend — from backend/
ruff check .              # lint
ruff format .             # format
pytest                    # run all tests with coverage

# E2E — from e2e/
npx playwright test       # run all specs headless
npx playwright test --ui  # run with Playwright UI explorer
```

### First-time setup (after cloning)

```bash
# Frontend
cd frontend
npm install               # installs husky + all dev deps automatically
# husky hooks activate via the "prepare" script

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Commit message format

Commits must follow [Conventional Commits](https://www.conventionalcommits.org):

```
feat(auth): add refresh token rotation
fix(candidates): correct timezone import crash
docs: update setup instructions
chore: upgrade dependencies
```

Types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore` `revert`
