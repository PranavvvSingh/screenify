# Screenify Implementation Plan

## Project Overview

AI-powered candidate screening platform with **two-part assessment** (70% standardized + 30% resume verification) using Next.js 16, PostgreSQL, Ollama Cloud API, and shadcn/ui.

## Key Decisions Made

- **Frontend**: shadcn/ui for all UI components
- **Authentication**: Better Auth with Google OAuth **for recruiters ONLY**
- **No Candidate Auth**: Candidates access via unique quiz links (no login required)
- **Recruiter-Controlled Flow**: Recruiter uploads both JD and candidate resumes
- **Two-Part Quiz**: 70% standard questions (JD-based) + 30% verification questions (resume-based)
- **Configurable Questions**: 5-25 questions total (default 10), maintains 70/30 split
- **No Email Service**: Email notifications not implemented in MVP
- **Environment Variables**: Used throughout the application

---

## Completed Tasks

The following have been implemented:

- **Phase 1: Foundation** - Next.js 16, shadcn/ui, PostgreSQL schema, Prisma ORM, Better Auth with Google OAuth, environment variables, app router structure
- **Phase 2: Document Processing** - PDF.js client-side extraction, Ollama Cloud API integration (JD extraction, resume extraction, question generation functions)
- **Phase 3: Role Creation & Candidate Setup** - Role creation form with PDF import, inline requirements editing, base question generation (70%), role overview page, per-candidate quiz setup with resume upload and verification questions (30%)


### **Phase 5: Assessment System**

#### Task 18: Proctoring System Implementation

**Status**: DEFERRED (Post-MVP)

**Note**: This task will be implemented after the core MVP flow is complete and working smoothly. Until then, proctoring-related fields will use dummy/empty values:
- `proctoring_flags`: Empty object `{}`
- `confidence_score`: Default value `100`
- `anomalyIndicators`: Empty array `[]`

**Actions** (for later implementation):

- [ ] Create `hooks/use-proctoring.ts` custom hook
- [ ] Implement fullscreen enforcement:
  - Request fullscreen on quiz start
  - Detect fullscreen exit via `fullscreenchange` event
  - Show warning modal on exit
  - Log event to proctoring flags
- [ ] Implement tab switch detection:
  - Listen to `visibilitychange` event
  - Track when tab becomes hidden
  - Log timestamp and duration
  - Show warning on return
- [ ] Track proctoring events in state
- [ ] Display proctoring warning banner
- [ ] Pass proctoring flags to submission handler

**Files**:
- `hooks/use-proctoring.ts`
- `components/proctoring-warning.tsx`

---

### **Phase 6: Evaluation Engine**

#### Task 22: Confidence Scoring with Anomaly Detection

**Status**: DEFERRED (Post-MVP)

**Note**: This task depends on Task 18 (Proctoring). Until proctoring is implemented, confidence scoring will use default values:
- `confidence_score`: Always `100`
- `anomalyIndicators`: Empty array `[]`

**Actions** (for later implementation):

- [ ] Extend evaluation engine
- [ ] Calculate confidence score:
  - Start: 100
  - Penalty: -5 per tab switch
  - Penalty: -10 per fullscreen exit
  - Minimum: 0
- [ ] Implement anomaly detection:
  - **Time anomaly**: avg time per question < 10 seconds
  - **Pattern anomaly**: All correct answers in last 20% of time
  - **Consistency anomaly**: Sudden accuracy spike
- [ ] Store anomalies in QuizResult.anomalyIndicators

**Files**:
- Update `lib/evaluation-engine.ts`

---

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key"
BETTER_AUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Ollama Cloud API
OLLAMA_CLOUD_API_KEY="your-ollama-api-key"
OLLAMA_CLOUD_API_URL="https://api.ollama.ai"
OLLAMA_CLOUD_MODEL="qwen3:32b"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## Tech Stack Summary

| Category           | Technology                            |
| ------------------ | ------------------------------------- |
| **Framework**      | Next.js 16 (App Router)               |
| **Language**       | TypeScript                            |
| **Styling**        | Tailwind CSS + shadcn/ui              |
| **Database**       | PostgreSQL                            |
| **ORM**            | Prisma                                |
| **Authentication** | Better Auth (Google OAuth)            |
| **AI Provider**    | Ollama Cloud API                      |
| **PDF Processing** | pdf.js (client-side)                  |
