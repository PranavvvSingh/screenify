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

---

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

#### Task 19: Timer Component with Auto-Submit

**Status**: Pending

**Actions**:
- NOTE: a dummy timer component already exists
- [ ] Create `components/quiz-timer.tsx` (Timer component exists, needs integration)
- [ ] Accept `timeAllocated` prop (in seconds)
- [ ] Display time in MM:SS format
- [ ] Show warning when < 5 minutes remaining (change color)
- [ ] Show critical warning when < 1 minute (red + pulse animation)
- [ ] Auto-submit quiz when time reaches 0
- [ ] Sync time with server on page load (prevent client manipulation)

**Files**:
- `components/quiz-timer.tsx` (integrate existing Timer)

---

#### Task 20: Response Submission Handler

**Status**: Pending

**Actions**:

- [ ] Create API route `app/api/quiz/[token]/submit/route.ts`
- [ ] Accept request body with responses and proctoring flags
- [ ] Validate quiz token
- [ ] Check if quiz already completed
- [ ] Create QuizAnswer records for each response
- [ ] Update QuizResult with:
  - startedAt, submittedAt
  - responses (JSONB)
  - proctoring_flags (JSONB)
  - status: 'SUBMITTED'
- [ ] Trigger evaluation engine
- [ ] Mark quiz as completed
- [ ] Return success response

**Files**:
- `app/api/quiz/[token]/submit/route.ts`
- `app/quiz/[token]/completed/page.tsx`

---

### **Phase 6: Evaluation Engine**

#### Task 21: Auto-Evaluation Engine with Two-Part Scoring

**Status**: Pending

**Actions**:

- [ ] Create `lib/evaluation-engine.ts`
- [ ] Create function `evaluateQuiz(quizId: string)`
- [ ] Fetch quiz with questions and answers
- [ ] **Part 1: Calculate Standard Score (70% questions only)**:
  - Filter questions where `type === 'STANDARD'`
  - Compare responses with correct answers
  - Calculate percentage: `(correct / standard_total) * 100`
  - **This is the ranking score** used for comparison
- [ ] **Part 2: Calculate Verification Flags (30% questions)**:
  - Filter questions where `type === 'RESUME_VERIFICATION'`
  - Check correctness of each verification question
  - Calculate verification rate: `correct / verification_total`
  - Assign status:
    - VERIFIED (>=80% correct)
    - QUESTIONABLE (50-79% correct)
    - DISCREPANCY (<50% correct)
- [ ] Calculate skill breakdown (from standard questions only)
- [ ] Update QuizResult record with all scores and status

**Files**:
- `lib/evaluation-engine.ts`

---

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

### **Phase 7: Recruiter Dashboard**

#### Task 23: Candidate List Dashboard with Two-Part Scoring Display

**Status**: Pending

**Actions**:

- [ ] Update `app/recruiter/page.tsx` or create dedicated candidates view
- [ ] Fetch all quizzes/candidates for recruiter's roles
- [ ] Create API route `app/api/recruiter/candidates/route.ts`
- [ ] Build table with shadcn Table component:
  - Columns: Name, Email, Role, **Ranking Score**, **Verification Status**, Confidence, Date
  - **Ranking Score**: Standard questions score (70%) - used for sorting
  - **Verification Status**: VERIFIED/QUESTIONABLE/DISCREPANCY indicator
- [ ] Add filters:
  - Status: All, Submitted, Shortlisted, Rejected
  - Ranking score range
  - Verification: All, Verified, Questionable, Discrepancy
- [ ] Add sorting (default: Ranking Score desc)
- [ ] Click row navigates to candidate detail page

**Files**:
- `app/recruiter/candidates/page.tsx`
- `app/api/recruiter/candidates/route.ts`
- `components/candidate-table.tsx`

---

#### Task 24: Candidate Detail View with Verification Details

**Status**: Pending

**Actions**:

- [ ] Update `app/recruiter/roles/[roleId]/candidates/[candidateId]/page.tsx`
- [ ] Fetch quiz with result and answers
- [ ] Build layout with shadcn Card components:
  - **Profile Section**: Name, email
  - **Assessment Summary**:
    - Ranking Score (standard questions only)
    - Verification Status with badge
    - Confidence score
    - Time taken
  - **Verification Details Section**:
    - List of verification questions
    - Show if candidate answered correctly
    - Highlight failed verifications
  - **Proctoring Events**: List of tab switches, fullscreen exits
- [ ] Add action buttons: Shortlist, Reject

**Files**:
- `app/recruiter/roles/[roleId]/candidates/[candidateId]/page.tsx`
- `components/candidate-profile.tsx`
- `components/assessment-summary.tsx`

---

#### Task 27: Shortlist and Reject Actions

**Status**: Pending

**Actions**:

- [ ] Create API routes:
  - `app/api/quiz/[id]/shortlist/route.ts`
  - `app/api/quiz/[id]/reject/route.ts`
- [ ] Update QuizResult.status to track shortlist/reject
- [ ] Add optimistic UI updates
- [ ] Show toast notification on success
- [ ] Add confirmation dialog for reject action

**Files**:
- `app/api/quiz/[id]/shortlist/route.ts`
- `app/api/quiz/[id]/reject/route.ts`

---

#### Task 28: Role Overview Dashboard

**Status**: Pending

**Actions**:

- [ ] Update `app/recruiter/roles/[id]/page.tsx`
- [ ] Fetch role with all related quizzes/candidates
- [ ] Display:
  - Total candidates invited
  - Completion rate (submitted / total)
  - Average score across submitted candidates
- [ ] Show candidate list for this role
- [ ] Add "Add Candidate" button

**Files**:
- Update `app/recruiter/roles/[id]/page.tsx`

---

### **Phase 8: Security & Polish**

#### Task 30: Single-Attempt and Immutability Enforcement

**Status**: Pending

**Actions**:

- [ ] Verify database constraints:
  - Quiz token is unique
  - Quiz.completed prevents re-submission
- [ ] Add API checks before quiz start:
  - Check if quiz already completed
  - Return error if completed: "Quiz already taken"
- [ ] Add UI checks:
  - Before showing quiz, verify not completed
  - Show "Already completed" message if done

**Files**:
- Update API routes with checks

---

#### Task 31: Error Boundaries and Loading States

**Status**: Pending

**Actions**:

- [ ] Create global error boundary `app/error.tsx`
- [ ] Create loading component `app/loading.tsx`
- [ ] Add error boundaries to key routes
- [ ] Add loading states to key routes
- [ ] Add error handling to all API routes:
  - Try-catch blocks
  - Descriptive error messages
  - Appropriate HTTP status codes
- [ ] Implement graceful degradation:
  - Ollama API failure -> show retry option
  - Database timeout -> show error message

**Files**:
- `app/error.tsx`
- `app/loading.tsx`
- `app/recruiter/error.tsx`
- `components/loading-spinner.tsx`

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
