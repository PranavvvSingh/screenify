# CLAUDE.md

## Project Overview
Screenify - AI-assisted candidate screening platform. Recruiters create roles from JDs, upload candidate resumes, and generate unique quiz links. Candidates take proctored assessments without authentication.

## Tech Stack
- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Auth**: Better Auth (Google OAuth) - recruiters only
- **Database**: PostgreSQL + Prisma ORM
- **AI**: Ollama Cloud API (`OLLAMA_CLOUD_MODEL` env var)
- **PDF**: pdf.js (client-side extraction, PDFs not stored)

## Key Concepts

### Two-Part Assessment (70/30 Split)
- **70% Standard Questions**: Generated from JD, same for all candidates, used for ranking
- **30% Verification Questions**: Generated from resume projects, detects fraud, not scored

### Quiz Status Lifecycle
- **DB States**: `PENDING` → `IN_PROGRESS` → `SUBMITTED` | `TERMINATED`
- **Runtime-computed** (see `lib/quiz-helpers.ts`): `EXPIRED` (link expired before start), `TIMED_OUT` (exceeded duration)
- Links expire after 48 hours (configurable in `lib/constants.ts`)

### Proctoring System
Events tracked via `useProctoring` hook: `TAB_SWITCH`, `FULLSCREEN_EXIT`, `WINDOW_BLUR`, `MULTIPLE_DISPLAYS`
- Verdict thresholds: CLEAN (0-2), SUSPICIOUS (3-5), CHEATING (6+)
- Fullscreen enforced with non-dismissible modal on exit
- Events logged to `proctoringEvents` JSON field on Quiz

### Optimistic Locking
Quiz uses `version` field to prevent race conditions on concurrent submissions (409 Conflict on mismatch)

## Database Schema
See `prisma/schema.prisma`. Key enums: `QuizStatus`, `ProctoringVerdict`, `CandidateStatus`
Key tables: User, Recruiter, JobRole (baseQuestions), Quiz (questions + token + proctoringEvents + version), QuizResult (standardScore + proctoringVerdict)

## Project Structure
```
app/
├─ api/
│  ├─ auth/                           # Better Auth + callback
│  ├─ role/                           # extract-jd, create, add-candidate
│  ├─ quiz/[token]/                   # route, start, answer, submit, proctoring
│  └─ recruiter/                      # candidates list, quiz results/status
├─ recruiter/                         # Dashboard pages
├─ quiz/[token]/                      # Candidate quiz pages (start, take, completed)
lib/
├─ db/                                # Prisma client + query functions
├─ quiz-helpers.ts                    # Status computation, scoring, verdict helpers
├─ constants.ts                       # Quiz expiry, thresholds
hooks/
├─ use-proctoring.ts                  # Real-time proctoring monitoring hook
components/
├─ proctoring-warning.tsx             # Fullscreen enforcement modal
```

## Commands
```bash
npm run dev              # Start dev server
npx prisma studio        # DB GUI
npx prisma migrate dev   # Run migrations
```

## Important Notes
- No candidate authentication - unique token links only
- PDFs processed client-side, never stored
- Questions shuffled so candidates can't distinguish verification from standard
