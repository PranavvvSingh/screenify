# CLAUDE.md

## Project Overview
Screenify - AI-assisted candidate screening platform. Recruiters create roles from JDs, upload candidate resumes, and generate unique quiz links. Candidates take assessments without authentication.

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Better Auth (Google OAuth) - recruiters only
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Ollama Cloud API (`OLLAMA_CLOUD_MODEL` env var)
- **PDF**: pdf.js (client-side extraction, PDFs not stored)

## Key Concepts

### Two-Part Assessment (70/30 Split)
- **70% Standard Questions**: Generated from JD at role creation, same for all candidates, used for ranking score
- **30% Verification Questions**: Generated from candidate's resume projects, detects fraud, not scored

### Proctoring
- Time based quiz-environment
- Anti cheat measures: detect tab change, enforce full screen mode, window not focused, not allowing clipboard copy, detect multiple displays, etc.

### Core Flow
1. Recruiter creates role → uploads JD PDF → edits extracted requirements → base questions generated
2. Recruiter adds candidate → uploads resume → verification questions generated → unique quiz link created
3. Candidate opens link → takes proctored quiz → auto-evaluated → results to recruiter dashboard

## Database Schema
See `prisma/schema.prisma`. Key tables: User, Recruiter, JobRole (with baseQuestions), Quiz (with combined questions + token), QuizAnswer, QuizResult (standardScore + verificationStatus)

## Project Structure
```
app/
├─ api/
│  ├─ auth/[...all]/route.ts          # Better Auth handlers
│  ├─ auth-callback/route.ts          # Post-OAuth recruiter creation
│  ├─ role/
│  │  ├─ extract-jd/route.ts          # JD text → structured JSON
│  │  ├─ create/route.ts              # Create role + base questions
│  │  └─ [roleId]/add-candidate/route.ts  # Upload resume, generate quiz
│  ├─ quiz/[token]/
│  │  ├─ route.ts                     # Get quiz info
│  │  ├─ start/route.ts               # Start quiz attempt
│  │  ├─ answer/route.ts              # Submit single answer
│  │  └─ submit/route.ts              # Submit quiz + evaluate
│  └─ recruiter/
│     ├─ candidates/route.ts          # List all candidates
│     └─ quiz/[quizId]/
│        ├─ route.ts                  # Get quiz results
│        └─ status/route.ts           # Update candidate status
├─ recruiter/                         # Recruiter dashboard pages
│  ├─ page.tsx                        # Dashboard home
│  ├─ roles/new/page.tsx              # Create role
│  ├─ roles/[roleId]/page.tsx         # Role details
│  └─ candidates/page.tsx             # All candidates list
├─ quiz/[token]/                      # Candidate quiz pages
│  ├─ page.tsx                        # Quiz invite/start
│  ├─ take/page.tsx                   # Quiz taking interface
│  └─ completed/page.tsx              # Thank you page
lib/                                  # Utilities, AI, DB
components/                           # UI components
prisma/schema.prisma                  # Database schema
```

## Commands
```bash
npm run dev          # Start dev server
npx prisma studio    # DB GUI
npx prisma migrate dev  # Run migrations
```

## Important Notes
- No candidate authentication - unique token links only
- PDFs processed client-side, never stored
- Questions shuffled so candidates can't distinguish verification from standard
- Proctoring during quiz
