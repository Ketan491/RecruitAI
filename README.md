# 🤖 RecruitAI — AI Smart Recruitment Platform

A full-stack AI-powered recruitment platform built with **React + FastAPI + MongoDB**.  
Designed to look and feel like a real startup product — portfolio-worthy, internship-interview-ready.

---

## ✨ Features

| Feature | Description |
|--------|-------------|
| 🔐 JWT Auth | Secure signup/login with role-based access (User / HR) |
| 📄 Resume Analyzer | Upload PDF → AI extracts skills, education, experience, keywords |
| 🎯 ATS Scorer | Compare resume vs job description using NLP (TF-IDF + cosine similarity) |
| 🤖 Recommendations | AI suggests job roles, missing skills, and free online courses |
| 🎤 Interview Simulator | Webcam + speech-to-text → filler word detection + confidence score |
| 👥 HR Dashboard | View all candidates, search/filter/rank by ATS score |
| 📊 Analytics | Charts for skills, ATS distribution, monthly trends (Recharts) |

---

## 🛠️ Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Recharts, Lucide Icons  
**Backend:** Python FastAPI, Motor (async MongoDB driver), JWT auth  
**AI/NLP:** PyPDF2, scikit-learn (TF-IDF), spaCy, nltk  
**Database:** MongoDB (local or MongoDB Atlas)  
**Deployment:** Vercel (frontend) + Render (backend) + MongoDB Atlas

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB (local) OR MongoDB Atlas account (free tier)

---

### Step 1 — Clone & Setup

```bash
git clone https://github.com/yourusername/AI-Smart-Recruitment.git
cd AI-Smart-Recruitment
```

---

### Step 2 — Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy English model
python -m spacy download en_core_web_sm

# Copy env file and configure it
cp .env.example .env
# Edit .env — add your MongoDB URL and a SECRET_KEY

# Seed demo accounts (optional)
python seed_data.py

# Start the backend server
python run.py
# → Running at http://localhost:8000
# → API docs at http://localhost:8000/docs
```

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Copy and configure env
cp .env.example .env
# Edit .env if your backend runs on a different port

# Start dev server
npm run dev
# → Running at http://localhost:5173
```

---

### Step 4 — Open in Browser

Navigate to **http://localhost:5173**

**Demo accounts (after running seed_data.py):**
- HR Dashboard: `hr@demo.com` / `password123`  
- Candidate: `user@demo.com` / `password123`

---

## 📁 Project Structure

```
AI-Smart-Recruitment/
├── frontend/                    # React + Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── cursor/          # Custom cursor
│   │   │   ├── layout/          # Sidebar, AppLayout
│   │   │   └── ui/              # Reusable components
│   │   ├── pages/               # All route pages
│   │   ├── context/             # AuthContext
│   │   └── utils/               # Axios API client
│   └── package.json
│
├── backend/                     # FastAPI app
│   ├── app/
│   │   ├── ai/                  # AI modules (parser, ATS, recommender, interview)
│   │   ├── core/                # Config, DB, security
│   │   ├── middleware/          # JWT auth dependency
│   │   ├── models/              # Pydantic schemas
│   │   └── routes/              # API endpoints
│   ├── requirements.txt
│   └── run.py
│
├── docs/
│   └── database_schema.md       # MongoDB collection designs
└── README.md
```

---

## 🌐 Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build

# Push to GitHub, then import repo on vercel.com
# Set VITE_API_URL=https://your-backend.onrender.com in Vercel env vars
```

### Backend → Render

1. Push code to GitHub
2. Create new **Web Service** on render.com
3. Set root directory: `backend`
4. Build command: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
5. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables (MONGODB_URL, SECRET_KEY, CORS_ORIGINS)

### Database → MongoDB Atlas (Free)

1. Create account at mongodb.com/cloud/atlas
2. Create free M0 cluster
3. Add connection string to backend `.env` as `MONGODB_URL`
4. Whitelist all IPs (0.0.0.0/0) for Render deployment

---

## 🔑 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|---------|-------------|------|
| POST | `/api/auth/signup` | Register user | — |
| POST | `/api/auth/login` | Login | — |
| GET | `/api/auth/me` | Get current user | ✅ |
| POST | `/api/resume/upload` | Upload PDF resume | ✅ |
| GET | `/api/resume/my` | Get latest resume | ✅ |
| POST | `/api/ats/score` | Calculate ATS score | ✅ |
| GET | `/api/ats/history` | Score history | ✅ |
| GET | `/api/recommendations/` | AI recommendations | ✅ |
| POST | `/api/interview/analyze` | Analyze interview | ✅ |
| GET | `/api/hr/candidates` | All candidates | HR only |
| GET | `/api/hr/analytics` | Analytics data | HR only |
| PUT | `/api/users/profile` | Update profile | ✅ |
| GET | `/api/users/stats` | Dashboard stats | ✅ |

---

## 🎨 UI Highlights

- Dark glassmorphism design with animated gradient blobs
- Custom trailing cursor with hover effects
- Framer Motion page transitions and stagger animations
- Animated score rings, progress bars, and skill badges
- Drag-and-drop resume upload with live analysis display
- Webcam + speech-to-text interview simulator
- Recharts-powered analytics dashboard

---

## 🤝 Contributing

Pull requests welcome! This is a portfolio project — feel free to fork and customize.

---

## 📄 License

MIT License — free to use for portfolio, internship demos, and academic projects.
