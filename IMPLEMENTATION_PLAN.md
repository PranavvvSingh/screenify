# Screenify Implementation Plan

## Project Overview

AI-powered candidate screening platform with **two-part assessment** (70% standardized + 30% resume verification) using Next.js 16, PostgreSQL, Ollama Cloud API, and shadcn/ui.

## Key Decisions Made

- ✅ **Frontend**: shadcn/ui for all UI components
- ✅ **Authentication**: Better Auth with Google OAuth **for recruiters ONLY**
- ✅ **No Candidate Auth**: Candidates access via unique quiz links (no login required)
- ✅ **Recruiter-Controlled Flow**: Recruiter uploads both JD and candidate resumes
- ✅ **Two-Part Quiz**: 70% standard questions (JD-based) + 30% verification questions (resume-based)
- ✅ **Configurable Questions**: 5-25 questions total (default 10), maintains 70/30 split
- ✅ **No Email Service**: Email notifications not implemented in MVP
- ✅ **No Testing**: Skip testing setup for now
- ✅ **Environment Variables**: Used throughout the application

---

## Implementation Tasks

### **Phase 1: Foundation Setup**

#### ✅ ~~Task 1: Initialize Next.js 16 Project~~

**Status**: ✅ Done

**Actions**:

- [ ] Run `npx create-next-app@latest screenify --typescript --tailwind --app`
- [ ] Install base dependencies:
  - `npm install @prisma/client`
  - `npm install prisma --save-dev`
  - `npm install better-auth` (authentication library)
  - `npm install zod` (validation)
  - `npm install date-fns` (date utilities)

**Verification Checklist**:

- [ ] `package.json` shows Next.js 16+
- [ ] TypeScript configured (`tsconfig.json` exists)
- [ ] Tailwind CSS working (`app/globals.css` has Tailwind directives)
- [ ] `npm run dev` starts development server on `http://localhost:3000`
- [ ] App directory structure created

**Files Created**:

- `package.json`
- `tsconfig.json`
- `tailwind.config.ts`
- `next.config.js`
- `app/layout.tsx`
- `app/page.tsx`

---

#### ✅ ~~Task 2: Set Up shadcn/ui~~

**Status**: ✅ Done

**Actions**:

- [ ] Run `npx shadcn@latest init`
- [ ] Configure shadcn (select options: TypeScript, App Router, Tailwind, etc.)
- [ ] Install initial components:
  - `npx shadcn@latest add button`
  - `npx shadcn@latest add input`
  - `npx shadcn@latest add card`
  - `npx shadcn@latest add select`
  - `npx shadcn@latest add table`
  - `npx shadcn@latest add dialog`
  - `npx shadcn@latest add toast`
  - `npx shadcn@latest add form`
  - `npx shadcn@latest add label`
  - `npx shadcn@latest add tabs`
  - `npx shadcn@latest add badge`
  - `npx shadcn@latest add separator`
  - `npx shadcn@latest add avatar`
  - `npx shadcn@latest add dropdown-menu`

**Verification Checklist**:

- [ ] `components/ui/` folder created with all components
- [ ] `lib/utils.ts` exists with `cn()` helper
- [ ] Test Button component renders correctly
- [ ] Tailwind variants working (hover, focus states)

**Files Created**:

- `components/ui/button.tsx`
- `components/ui/input.tsx`
- `components/ui/card.tsx`
- `components/ui/select.tsx`
- `components/ui/table.tsx`
- `components/ui/dialog.tsx`
- `components/ui/toast.tsx`
- `components/ui/form.tsx`
- `lib/utils.ts`
- `components.json` (shadcn config)

---

#### ✅ ~~Task 3: PostgreSQL Database Schema Setup~~

**Status**: ✅ Done

**Actions**:

- [ ] Choose database provider (Supabase/Neon/Vercel Postgres/Local PostgreSQL)
- [ ] Create database instance
- [ ] Get connection string (DATABASE_URL)
- [ ] Create SQL schema file with all 8 tables:
  - `users` (id, email, name, role, auth_provider, created_at)
  - `roles` (id, recruiter_id, title, jd_file_url, requirements JSONB, status, created_at)
  - `invitations` (id, role_id, token, status, max_uses, current_uses, expires_at, created_at)
  - `candidates` (id, invitation_id, role_id, user_id, email, resume_file_url, profile JSONB, status, created_at)
  - `quizzes` (id, candidate_id UNIQUE, role_id, questions JSONB, metadata JSONB, generated_at)
  - `attempts` (id, candidate_id UNIQUE, quiz_id, started_at, submitted_at, time_allocated, responses JSONB, proctoring_flags JSONB, status)
  - `evaluations` (id, attempt_id UNIQUE, candidate_id, score, skill_breakdown JSONB, confidence_score, anomaly_indicators JSONB, evaluated_at)
- [ ] Add UNIQUE constraints on `quizzes.candidate_id` and `attempts.candidate_id`
- [ ] Add foreign key constraints

**Verification Checklist**:

- [ ] Database accessible via connection string
- [ ] All 8 tables created successfully
- [ ] JSONB columns exist and functional
- [ ] UNIQUE constraints working
- [ ] Foreign keys enforced
- [ ] Can insert test data manually

**Files Created**:

- `schema.sql` (optional reference)
- Database tables in cloud/local instance

---

#### ✅ ~~Task 4: Configure Prisma ORM~~

**Status**: ✅ Done

**Actions**:

- [ ] Run `npx prisma init`
- [ ] Update `prisma/schema.prisma` with all models matching database schema
- [ ] Configure PostgreSQL datasource
- [ ] Add all models: User, Role, Invitation, Candidate, Quiz, Attempt, Evaluation
- [ ] Define relations between models
- [ ] Add JSONB fields with `Json` type
- [ ] Run `npx prisma db push` to sync schema
- [ ] Run `npx prisma generate` to generate Prisma Client

**Verification Checklist**:

- [ ] `prisma/schema.prisma` complete with all 8 models
- [ ] `npx prisma studio` opens and shows all tables
- [ ] Prisma Client types available in VS Code
- [ ] Can query database: `await prisma.user.findMany()`
- [ ] JSONB fields typed correctly

**Files Created**:

- `prisma/schema.prisma`
- `node_modules/.prisma/client/` (generated)

**Sample Schema Structure**:

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  name          String?
  role          UserRole
  authProvider  String?   @map("auth_provider")
  createdAt     DateTime  @default(now()) @map("created_at")

  roles         Role[]
  @@map("users")
}

enum UserRole {
  RECRUITER
  CANDIDATE
}

// ... other models
```

---

#### ✅ ~~Task 5: Implement Better Auth with OAuth (Recruiters Only)~~

**Status**: ✅ Done

**Actions**:

- [ ] Create `lib/auth.ts` with Better Auth configuration
- [ ] Install Better Auth adapter: `npm install better-auth-prisma`
- [ ] Configure Better Auth with:
  - Google OAuth Provider
  - Prisma adapter for database
  - **Recruiter role only** (no candidate authentication)
- [ ] Create API route handler `app/api/auth/[...all]/route.ts`
- [ ] Create Google OAuth App (get CLIENT_ID and CLIENT_SECRET)
- [ ] Create auth client `lib/auth-client.ts` for frontend hooks
- [ ] Create custom sign-in page at `app/auth/signin/page.tsx`
- [ ] All new users automatically assigned RECRUITER role
- [ ] Create middleware for recruiter route protection

**Verification Checklist**:

- [ ] Navigate to `/auth/signin` shows Google OAuth option
- [ ] Google OAuth login works and creates user in database
- [ ] User created with RECRUITER role automatically
- [ ] Session includes user data
- [ ] `useSession()` hook from auth-client returns user data
- [ ] Sign out works correctly
- [ ] Recruiter routes protected, redirect to sign-in if not authenticated

**Files Created**:

- `lib/auth.ts` (Better Auth server config)
- `lib/auth-client.ts` (Better Auth client hooks)
- `app/api/auth/[...all]/route.ts` (API route handler)
- `app/auth/signin/page.tsx` (custom sign-in page)
- `app/auth/role-selection/page.tsx` (role selection for new users)
- `middleware.ts` (route protection)

**Environment Variables Added**:

- `BETTER_AUTH_SECRET` (generate with `openssl rand -base64 32`)
- `BETTER_AUTH_URL` (http://localhost:3000 for dev)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**Sample Better Auth Config** (`lib/auth.ts`):

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./db";

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql"
	}),
	emailAndPassword: {
		enabled: false // OAuth only
	},
	socialProviders: {
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!
		}
	},
	user: {
		additionalFields: {
			role: {
				type: "string",
				required: true,
				defaultValue: "CANDIDATE"
			}
		}
	}
});
```

---

#### ✅ ~~Task 6: Create Environment Variables Structure~~

**Status**: ✅ Done

**Actions**:

- [ ] Create `.env.example` with all required variables (empty values)
- [ ] Create `.env.local` with actual values (gitignored)
- [ ] Add `.env.local` to `.gitignore`
- [ ] Document each variable in `.env.example`

**Verification Checklist**:

- [ ] `.env.example` committed to repo
- [ ] `.env.local` in `.gitignore`
- [ ] All variables accessible via `process.env.VARIABLE_NAME`
- [ ] No hardcoded secrets in codebase

**Environment Variables**:

```bash
# Database
DATABASE_URL="postgresql://..."

# Better Auth
BETTER_AUTH_SECRET="generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"

# OAuth Provider - Google
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Ollama Cloud API
OLLAMA_CLOUD_API_KEY=""
OLLAMA_CLOUD_API_URL="https://cloud.ollama.ai/api"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Files Created**:

- `.env.example`
- `.env.local` (not committed)

---

#### ✅ ~~Task 7: Build App Router Structure~~

**Status**: ✅ Done

**Actions**:

- [ ] Create folder structure:
  ```
  app/
  ├── (auth)/
  │   ├── signin/
  │   │   └── page.tsx
  │   └── role-selection/
  │       └── page.tsx
  ├── (recruiter)/
  │   ├── layout.tsx (with auth check)
  │   ├── dashboard/
  │   │   └── page.tsx
  │   ├── roles/
  │   │   ├── page.tsx (list roles)
  │   │   ├── create/
  │   │   │   └── page.tsx
  │   │   └── [id]/
  │   │       ├── page.tsx (role overview)
  │   │       ├── edit/
  │   │       │   └── page.tsx
  │   │       └── candidates/
  │   │           └── page.tsx
  │   └── candidates/
  │       ├── [id]/
  │       │   └── page.tsx (candidate detail)
  │       └── compare/
  │           └── page.tsx
  ├── (candidate)/
  │   ├── layout.tsx (with auth check)
  │   ├── invite/
  │   │   └── [token]/
  │   │       └── page.tsx
  │   └── quiz/
  │       └── [id]/
  │           └── page.tsx
  ├── api/
  │   ├── auth/[...all]/
  │   ├── role/
  │   ├── candidate/
  │   ├── quiz/
  │   └── ollama/
  └── layout.tsx (root layout)
  ```
- [ ] Create middleware for route protection based on role
- [ ] Add redirects: unauthenticated → `/auth/signin`, wrong role → dashboard

**Verification Checklist**:

- [ ] All folders created
- [ ] Layouts enforce authentication
- [ ] Middleware redirects work correctly
- [ ] Recruiter cannot access candidate routes
- [ ] Candidate cannot access recruiter routes
- [ ] Navigation between routes works

**Files Created**:

- All route files listed above
- `middleware.ts` (role-based protection)

---

### **Phase 2: Document Processing**

#### ~~✅ Task 8: Client-Side PDF.js Integration~~

**Status**: ✅ Done

**Actions**:

- [ ] Install pdf.js: `npm install pdfjs-dist`
- [ ] Create `lib/pdf-extractor.ts` utility
- [ ] Create client component `components/pdf-upload.tsx`
- [ ] Configure PDF.js worker
- [ ] Implement text extraction from PDF
- [ ] Handle multi-page PDFs
- [ ] Add loading state during extraction
- [ ] Add error handling for invalid PDFs

**Verification Checklist**:

- [ ] Upload JD PDF → text extracted successfully
- [ ] Upload Resume PDF → text extracted successfully
- [ ] Multi-page PDFs fully extracted
- [ ] Loading spinner shows during extraction
- [ ] Error message for non-PDF files
- [ ] Extracted text displayed in textarea for verification
- [ ] No server upload (client-side only)

**Files Created**:

- `lib/pdf-extractor.ts`
- `components/pdf-upload.tsx`

**Sample Code Structure**:

```typescript
// lib/pdf-extractor.ts
import * as pdfjsLib from "pdfjs-dist";

export async function extractTextFromPDF(file: File): Promise<string> {
	// Configure worker
	// Load PDF
	// Extract text from all pages
	// Return concatenated text
}
```

---

#### ✅ ~~Task 9: Ollama Cloud API Integration Service~~

**Status**: ✅ Done

**Actions**:

- [x] Create `lib/ollama.ts` service file
- [x] Implement API call function with Ollama npm package
- [x] Add request/response TypeScript types
- [x] Implement retry logic (exponential backoff)
- [x] Add timeout handling (30s timeout)
- [x] Create specific functions:
  - `extractJDRequirements(text: string)` - Extracts JD requirements with snake_case JSON schema
  - `extractResumeProfile(text: string)` - Extracts resume profile with focus on projects
  - `generateStandardQuestions(requirements, count)` - Generates role-based questions
  - `generateVerificationQuestions(profile, count)` - Generates indirect resume verification questions
  - `generateQuiz(standardQuestions, verificationQuestions)` - Pure function to combine and shuffle
- [x] Add error handling and logging
- [x] Validate JSON responses with parseJSONResponse utility

**Verification Checklist**:

- [x] Test API call with sample text succeeds
- [x] Returns structured JSON as expected
- [x] Retry logic works on failure
- [x] Timeout handled gracefully
- [x] Environment variable `OLLAMA_CLOUD_API_KEY` used
- [x] Error messages are descriptive

**Files Created**:

- `lib/ollama.ts`
- `types/ollama.ts` (request/response types)

**Sample API Call**:

```typescript
// lib/ollama.ts
export async function extractJDRequirements(rawText: string) {
	const response = await fetch(process.env.OLLAMA_CLOUD_API_URL!, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.OLLAMA_CLOUD_API_KEY}`
		},
		body: JSON.stringify({
			model: "gpt-oss:120b-cloud",
			prompt: `Extract job requirements from this JD...`,
			format: "json"
		})
	});
	return response.json();
}
```

---

### **Phase 3: Recruiter Flow**

#### ✅ Task 10: Role Creation + JD Upload + Base Question Generation

**Status**: Pending

**Actions**:

- [ ] Create `app/(recruiter)/roles/create/page.tsx`
- [ ] Build form with shadcn Form + Input components:
  - Role title (required)
  - Role description (optional)
  - JD PDF upload
  - **Total questions count** (slider: 5-25, default 10)
- [ ] Integrate PDF upload component
- [ ] Extract text from uploaded JD PDF
- [ ] Send extracted text to Ollama Cloud API for requirements extraction
- [ ] Display loading state during extraction
- [ ] Show extracted requirements in next step (editable)
- [ ] After requirements approved, generate **base questions (70% of total)**
- [ ] Call Ollama API to generate standardized questions from JD only
- [ ] Create API route `app/api/role/create/route.ts`
- [ ] Save role to database with:
  - requirements JSONB
  - baseQuestions JSONB (70% of total count)
  - totalQuestions number

**Verification Checklist**:

- [ ] Form validates required fields
- [ ] PDF upload triggers extraction
- [ ] Extracted requirements shown (required_skills, experience, etc.)
- [ ] Can configure total question count
- [ ] Base questions generated (e.g., 7 out of 10 total)
- [ ] Base questions stored in database
- [ ] Role saved to database with recruiter_id
- [ ] Redirect to role overview page after creation
- [ ] Role appears in roles list

**Files Created**:

- `app/(recruiter)/roles/create/page.tsx`
- `app/api/role/create/route.ts`
- `components/role-form.tsx`

---

#### ✅ Task 11: Requirements Review and Edit UI

**Status**: Pending

**Actions**:

- [ ] Create `app/(recruiter)/roles/[id]/edit/page.tsx`
- [ ] Fetch role with requirements from database
- [ ] Build editable form for requirements:
  - Required skills (array input, add/remove chips)
  - Preferred skills (array input)
  - Experience range (min/max number inputs)
  - Responsibilities (array textarea)
  - Qualifications (array textarea)
- [ ] Add "Save Changes" button
- [ ] Create API route `app/api/role/[id]/requirements/route.ts`
- [ ] Update requirements JSONB in database
- [ ] Show success toast on save

**Verification Checklist**:

- [ ] Extracted requirements pre-filled in form
- [ ] Can add/remove skills
- [ ] Can edit experience range
- [ ] Can modify responsibilities and qualifications
- [ ] Changes saved to database
- [ ] Updated data reflected on reload

**Files Created**:

- `app/(recruiter)/roles/[id]/edit/page.tsx`
- `app/api/role/[id]/requirements/route.ts`
- `components/requirements-editor.tsx`

---

#### ✅ Task 12: Per-Candidate Quiz Setup (Resume Upload + Verification Questions)

**Status**: Pending

**Actions**:

- [ ] Create `app/(recruiter)/roles/[id]/add-candidate/page.tsx`
- [ ] Build form with:
  - Candidate name (required)
  - Candidate email (required)
  - Resume PDF upload (required)
- [ ] Extract text from uploaded resume PDF
- [ ] Send extracted text to Ollama Cloud API for profile extraction
- [ ] Focus on **projects and tech mentioned in projects**
- [ ] Generate **verification questions (30% of total)** from resume projects
- [ ] Combine base questions (70%) + verification questions (30%)
- [ ] Shuffle all questions fully (no visual distinction)
- [ ] Create API route `app/api/role/[id]/add-candidate/route.ts`
- [ ] Generate unique quiz token (UUID)
- [ ] Store in database:
  - Candidate profile (name, email, resume data)
  - Complete quiz (base + verification, shuffled)
  - Unique quiz token
- [ ] Return quiz URL: `{APP_URL}/quiz/{token}`
- [ ] Add copy-to-clipboard button
- [ ] Show list of candidates for this role with their quiz links

**Verification Checklist**:

- [ ] Upload resume triggers extraction
- [ ] Profile extracted with project-based tech skills
- [ ] Verification questions generated (e.g., 3 out of 10 total)
- [ ] Questions focus on projects mentioned in resume
- [ ] Base + verification questions combined and shuffled
- [ ] Unique quiz token created
- [ ] Quiz URL displayed with copy button
- [ ] Can add multiple candidates per role
- [ ] Each candidate gets unique quiz link
- [ ] Candidate appears in role's candidate list

**Files Created**:

- `app/(recruiter)/roles/[id]/add-candidate/page.tsx`
- `app/api/role/[id]/add-candidate/route.ts`
- `components/candidate-form.tsx`

---

### **Phase 4: Candidate Flow (No Authentication)**

#### ✅ Task 13: Quiz Landing Page (Public Access)

**Status**: Pending

**Actions**:

- [ ] Create `app/quiz/[token]/page.tsx` (public route, no auth)
- [ ] Create API route `app/api/quiz/[token]/validate/route.ts`
- [ ] Validate quiz token exists and quiz not completed
- [ ] Fetch associated role details and candidate name
- [ ] Display:
  - Welcome message with candidate name
  - Role title
  - Quiz instructions
  - Question count and estimated time
  - "Start Assessment" button
- [ ] Handle invalid/expired/completed token with error message
- [ ] Track quiz start time when button clicked

**Verification Checklist**:

- [ ] Navigate to `/quiz/{valid-token}` shows quiz landing page
- [ ] Navigate to `/quiz/{invalid-token}` shows error
- [ ] Navigate to `/quiz/{completed-token}` shows "Already completed" message
- [ ] No authentication required
- [ ] Candidate name displayed correctly
- [ ] "Start Assessment" button navigates to quiz interface

**Files Created**:

- `app/quiz/[token]/page.tsx`
- `app/api/quiz/[token]/validate/route.ts`

---

#### ✅ Task 14: Question Structure with Type Tracking

**Status**: Pending (Design Task)

**Actions**:

- [ ] Define question structure in TypeScript:
  ```typescript
  interface Question {
    id: string
    type: 'STANDARD' | 'RESUME_VERIFICATION'
    question: string
    options: string[]
    correctAnswer: string
    skill: string
    difficulty?: 'Easy' | 'Medium' | 'Hard'
  }
  ```
- [ ] Ensure all questions stored with type field
- [ ] Standard questions (70%): type = 'STANDARD'
- [ ] Verification questions (30%): type = 'RESUME_VERIFICATION'
- [ ] Questions fully shuffled before storage (candidate sees no distinction)

**Verification Checklist**:

- [ ] Question type tracked in database
- [ ] Standard questions marked correctly
- [ ] Verification questions marked correctly
- [ ] Questions shuffled before storage
- [ ] Type information available for evaluation (but not shown to candidate)

**Files Created**:

- Update `types/quiz.ts`

---

#### ✅ Task 15: Base Question Generation (During Role Creation)

**Status**: Pending (Part of Task 10)

**Actions**:

- [ ] Called during role creation (Task 10)
- [ ] Build prompt for Ollama API:
  - Role requirements only
  - Generate N×0.7 questions (e.g., 7 out of 10)
  - Focus on technical depth
  - Test required skills only
- [ ] Mark all questions as type: 'STANDARD'
- [ ] Store in `jobRoles.baseQuestions` JSONB
- [ ] These questions reused for ALL candidates for this role

**Verification Checklist**:

- [ ] Base questions generated during role creation
- [ ] Correct count (70% of total)
- [ ] All marked as STANDARD type
- [ ] Questions test required skills from JD
- [ ] Stored in jobRoles table
- [ ] Reused for all candidates

**Integrated into Task 10** (no separate files)

---

#### ✅ Task 16: Verification Question Generation (Per Candidate)

**Status**: Pending (Part of Task 12)

**Actions**:

- [ ] Called during per-candidate quiz setup (Task 12)
- [ ] Build prompt for Ollama API:
  - Candidate resume (focus on projects)
  - Generate N×0.3 questions (e.g., 3 out of 10)
  - Base questions on tech mentioned IN projects
  - Test depth, not breadth
  - Example: "You mentioned Kafka in Project X. Explain consumer groups."
- [ ] Mark all questions as type: 'RESUME_VERIFICATION'
- [ ] Combine with base questions + shuffle
- [ ] Store complete quiz in `quizzes` table

**Verification Checklist**:

- [ ] Verification questions generated per candidate
- [ ] Correct count (30% of total)
- [ ] All marked as RESUME_VERIFICATION type
- [ ] Questions focus on projects from resume
- [ ] Combined with base questions and shuffled
- [ ] Stored in quizzes table

**Integrated into Task 12** (no separate files)

---

### **Phase 5: Assessment System**

#### ✅ Task 17: Quiz Taking Interface (Token-Based Access)

**Status**: Pending

**Actions**:

- [ ] Update `app/quiz/[token]/page.tsx` to include quiz interface
- [ ] Fetch quiz from database using token (no auth required)
- [ ] Create `components/quiz-interface.tsx`
- [ ] Display all questions (candidate sees them identically)
- [ ] **No visual distinction** between standard and verification questions
- [ ] Render MCQ options as radio buttons (shadcn RadioGroup)
- [ ] Add "Next" / "Previous" navigation buttons
- [ ] Track current question index
- [ ] Store answers in component state
- [ ] Add "Submit Quiz" button (disabled until all answered)
- [ ] Show progress indicator (e.g., "Question 5 of 10")
- [ ] Add confirmation dialog before submission
- [ ] Track time spent per question

**Verification Checklist**:

- [ ] Quiz page loads with all questions
- [ ] All questions appear identical (no type indication)
- [ ] Can select answer for each question
- [ ] Navigation between questions works
- [ ] Progress indicator accurate
- [ ] Can change answers before submission
- [ ] Submit button shows confirmation dialog
- [ ] Cannot access quiz after submission (token invalidated)
- [ ] Time per question tracked

**Files Created**:

- Update `app/quiz/[token]/page.tsx`
- `components/quiz-interface.tsx`
- `components/question-card.tsx`

---

#### ✅ Task 18: Proctoring System Implementation

**Status**: Pending

**Actions**:

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
- [ ] Track proctoring events in state:
  ```typescript
  {
    type: 'tab_switch' | 'fullscreen_exit',
    timestamp: string,
    duration?: number
  }
  ```
- [ ] Display proctoring warning banner
- [ ] Pass proctoring flags to submission handler

**Verification Checklist**:

- [ ] Quiz starts in fullscreen mode
- [ ] Alert shown when exiting fullscreen
- [ ] Tab switch detected and logged
- [ ] Proctoring events stored in component state
- [ ] Warning banner visible after violations
- [ ] Events submitted with quiz responses

**Files Created**:

- `hooks/use-proctoring.ts`
- `components/proctoring-warning.tsx`

---

#### ✅ Task 19: Timer Component with Auto-Submit

**Status**: Pending

**Actions**:

- [ ] Create `components/quiz-timer.tsx`
- [ ] Accept `timeAllocated` prop (in seconds)
- [ ] Calculate end time: `startTime + timeAllocated`
- [ ] Use `setInterval` to update countdown every second
- [ ] Display time in MM:SS format
- [ ] Show warning when < 5 minutes remaining (change color)
- [ ] Show critical warning when < 1 minute (red + pulse animation)
- [ ] Auto-submit quiz when time reaches 0
- [ ] Sync time with server on page load (prevent client manipulation)
- [ ] Store time allocated in `attempts.time_allocated`

**Verification Checklist**:

- [ ] Timer counts down from allocated time
- [ ] Time displayed prominently
- [ ] Warning shown at 5 minutes
- [ ] Critical warning at 1 minute
- [ ] Auto-submit triggers at 0:00
- [ ] Timer persists on page refresh (resume from elapsed time)
- [ ] Time allocated stored in database

**Files Created**:

- `components/quiz-timer.tsx`

---

#### ✅ Task 20: Response Submission Handler

**Status**: Pending

**Actions**:

- [ ] Create API route `app/api/quiz/submit/route.ts`
- [ ] Accept request body:
  ```typescript
  {
    quizId: string,
    responses: {question_id: string, selected_index: number, time_spent: number}[],
    proctoringFlags: {type: string, timestamp: string, duration?: number}[]
  }
  ```
- [ ] Validate candidate owns this quiz
- [ ] Check if attempt already exists (UNIQUE constraint)
- [ ] Create attempt record:
  - candidate_id
  - quiz_id
  - started_at (from client or infer from first interaction)
  - submitted_at: NOW()
  - time_allocated
  - responses (JSONB)
  - proctoring_flags (JSONB)
  - status: 'SUBMITTED'
- [ ] Trigger evaluation engine (next task)
- [ ] Update candidate status to 'SUBMITTED'
- [ ] Return success response

**Verification Checklist**:

- [ ] Submit quiz creates attempt record
- [ ] All responses stored in JSONB
- [ ] Proctoring flags stored in JSONB
- [ ] Cannot submit quiz twice (UNIQUE constraint)
- [ ] Evaluation triggered after submission
- [ ] Candidate redirected to completion page

**Files Created**:

- `app/api/quiz/submit/route.ts`
- `app/(candidate)/quiz/[id]/completed/page.tsx`

---

### **Phase 6: Evaluation Engine**

#### ✅ Task 21: Auto-Evaluation Engine with Two-Part Scoring

**Status**: Pending

**Actions**:

- [ ] Create `lib/evaluation-engine.ts`
- [ ] Create function `evaluateAttempt(attemptId: string)`
- [ ] Fetch attempt with responses
- [ ] Fetch quiz with questions (including type field)
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
    - ✅ VERIFIED (≥80% correct)
    - ⚠️ QUESTIONABLE (50-79% correct)
    - 🚩 DISCREPANCY (<50% correct)
  - Store individual verification results with resume claims
- [ ] Calculate skill breakdown (from standard questions only)
- [ ] Create evaluation record:
  - attempt_id
  - candidate_id
  - **standardScore** (0-100, for ranking)
  - **verificationStatus** ('VERIFIED' | 'QUESTIONABLE' | 'DISCREPANCY')
  - **verificationResults** (JSONB array with claim details)
  - skill_breakdown (JSONB, from standard questions only)
  - evaluated_at: NOW()
- [ ] Call from submission handler (Task 20)

**Verification Checklist**:

- [ ] After submission, evaluation created automatically
- [ ] Standard score calculated correctly (70% questions only)
- [ ] Verification status assigned correctly
- [ ] Verification results include resume claims
- [ ] Skill breakdown based on standard questions only
- [ ] Evaluation stored in database
- [ ] Recruiter can see ranking score + verification flags separately

**Files Created**:

- `lib/evaluation-engine.ts`
- `app/api/quiz/evaluate/route.ts` (if needed)

**Sample Calculation**:

```typescript
// Part 1: Standard Score (Ranking)
const standardQuestions = questions.filter(q => q.type === 'STANDARD');
const standardResponses = responses.filter((_, i) => questions[i].type === 'STANDARD');
const standardCorrect = standardResponses.filter((r, i) =>
  r.selected_index === standardQuestions[i].correct_index
).length;
const standardScore = (standardCorrect / standardQuestions.length) * 100;

// Part 2: Verification Flags
const verificationQuestions = questions.filter(q => q.type === 'RESUME_VERIFICATION');
const verificationResponses = responses.filter((_, i) => questions[i].type === 'RESUME_VERIFICATION');
const verificationCorrect = verificationResponses.filter((r, i) =>
  r.selected_index === verificationQuestions[i].correct_index
).length;
const verificationRate = verificationCorrect / verificationQuestions.length;

let verificationStatus;
if (verificationRate >= 0.8) verificationStatus = 'VERIFIED';
else if (verificationRate >= 0.5) verificationStatus = 'QUESTIONABLE';
else verificationStatus = 'DISCREPANCY';

// Store verification results
const verificationResults = verificationQuestions.map((q, i) => ({
  question: q.question,
  correct: verificationResponses[i].selected_index === q.correct_index
}));
```

---

#### ✅ Task 22: Confidence Scoring with Anomaly Detection

**Status**: Pending

**Actions**:

- [ ] Extend evaluation engine from Task 20
- [ ] Calculate confidence score:
  - Start: 100
  - Penalty: -5 per tab switch
  - Penalty: -10 per fullscreen exit
  - Minimum: 0
- [ ] Implement anomaly detection:
  - **Time anomaly**: avg time per question < 10 seconds
  - **Pattern anomaly**: All correct answers in last 20% of time
  - **Consistency anomaly**: Sudden accuracy spike
- [ ] Store anomalies in JSONB:
  ```typescript
  {
    type: 'time_anomaly' | 'pattern_anomaly' | 'consistency_anomaly',
    severity: 'low' | 'medium' | 'high',
    details: string
  }
  ```
- [ ] Update evaluation record with:
  - confidence_score
  - anomaly_indicators (JSONB array)

**Verification Checklist**:

- [ ] Confidence score calculated based on proctoring flags
- [ ] Tab switches reduce confidence
- [ ] Anomalies detected correctly
- [ ] Anomaly severity assigned appropriately
- [ ] All data stored in evaluations table
- [ ] Confidence and anomalies visible in recruiter dashboard

**Files Created**:

- Update `lib/evaluation-engine.ts`

**Sample Anomaly Detection**:

```typescript
// Time Anomaly
const avgTimePerQuestion = totalTime / questionCount;
if (avgTimePerQuestion < 10) {
	anomalies.push({
		type: "time_anomaly",
		severity: "medium",
		details: `Average ${avgTimePerQuestion}s per question`
	});
}

// Pattern Anomaly
const last20PercentIndex = Math.floor(questionCount * 0.8);
const last20PercentCorrect = responses
	.slice(last20PercentIndex)
	.filter((r, i) => r.selected_index === questions[last20PercentIndex + i].correct_index).length;
if (last20PercentCorrect === questionCount - last20PercentIndex) {
	anomalies.push({
		type: "pattern_anomaly",
		severity: "high",
		details: "All correct in last 20% of time"
	});
}
```

---

### **Phase 7: Recruiter Dashboard**

#### ✅ Task 23: Candidate List Dashboard with Two-Part Scoring Display

**Status**: Pending

**Actions**:

- [ ] Create `app/(recruiter)/dashboard/page.tsx`
- [ ] Fetch all candidates for recruiter's roles
- [ ] Create API route `app/api/dashboard/candidates/route.ts`
- [ ] Include JOIN with evaluations for scores
- [ ] Build table with shadcn Table component:
  - Columns: Name, Email, Role, **Ranking Score**, **Verification Status**, Confidence, Date Applied
  - **Ranking Score**: Standard questions score (70%) - used for sorting
  - **Verification Status**: ✅/⚠️/🚩 indicator
- [ ] Add filters (shadcn Select):
  - Status: All, Invited, Submitted, Shortlisted, Rejected
  - Ranking score range: Slider (0-100)
  - Verification: All, Verified, Questionable, Discrepancy
- [ ] Add sorting:
  - **Default: Ranking Score (desc)** - fair comparison
  - Also: Date (desc), Confidence (desc)
- [ ] Add pagination (10 per page)
- [ ] Click row navigates to candidate detail page
- [ ] Add "Compare Selected" button (multi-select rows)
- [ ] Add tooltip to verification indicator showing details

**Verification Checklist**:

- [ ] All candidates displayed in table
- [ ] Ranking score column shows standard questions score only
- [ ] Verification status shows icon (✅/⚠️/🚩)
- [ ] Can sort by ranking score for fair comparison
- [ ] Can filter by verification status
- [ ] Filters work correctly
- [ ] Sorting works
- [ ] Pagination works
- [ ] Click row navigates to detail
- [ ] Multi-select for comparison works
- [ ] Verification tooltip shows which claims failed

**Files Created**:

- `app/(recruiter)/dashboard/page.tsx`
- `app/api/dashboard/candidates/route.ts`
- `components/candidate-table.tsx`
- `components/candidate-filters.tsx`
- `components/verification-badge.tsx`

---

#### ✅ Task 24: Candidate Detail View with Verification Details

**Status**: Pending

**Actions**:

- [ ] Create `app/(recruiter)/candidates/[id]/page.tsx`
- [ ] Fetch candidate with profile, attempt, evaluation
- [ ] Create API route `app/api/candidate/[id]/route.ts`
- [ ] Verify recruiter owns this candidate's role
- [ ] Build layout with shadcn Card components:
  - **Profile Section**: Name, email, resume data
  - **Assessment Summary**:
    - **Ranking Score** (standard questions only) - large, prominent
    - **Verification Status** with badge (✅/⚠️/🚩)
    - Confidence score
    - Time taken
  - **Verification Details Section**:
    - List of verification questions
    - Show resume claim for each
    - Show if candidate answered correctly
    - Highlight failed verifications
  - **Proctoring Events**: List of tab switches, fullscreen exits
  - **Skill Breakdown**: Visual chart from standard questions only
  - **Question Review** (optional): Show all questions with answers
- [ ] Add action buttons:
  - Shortlist (green button)
  - Reject (red button)
  - Add Notes (textarea + save)

**Verification Checklist**:

- [ ] Navigate to candidate detail shows all information
- [ ] Profile data displayed correctly
- [ ] Assessment summary accurate
- [ ] Proctoring events listed
- [ ] Action buttons functional
- [ ] Only accessible by role owner (RLS)

**Files Created**:

- `app/(recruiter)/candidates/[id]/page.tsx`
- `app/api/candidate/[id]/route.ts`
- `components/candidate-profile.tsx`
- `components/assessment-summary.tsx`

---

#### ✅ Task 25: Skill Breakdown Visualization

**Status**: Pending

**Actions**:

- [ ] Install chart library: `npm install recharts` (recommended for shadcn ecosystem)
- [ ] Create `components/skill-breakdown-chart.tsx`
- [ ] Accept `skillBreakdown` prop: `{skill: percentage}`
- [ ] Choose chart type:
  - **Option 1**: Radar chart (good for multi-skill comparison)
  - **Option 2**: Bar chart (simpler, clearer percentages)
- [ ] Configure chart:
  - Skills on X-axis (or radial)
  - Percentage (0-100) on Y-axis
  - Color code: Green (>80), Yellow (60-80), Red (<60)
- [ ] Display on candidate detail page
- [ ] Add legend and tooltips

**Verification Checklist**:

- [ ] Chart renders with skill breakdown data
- [ ] Skills labeled clearly
- [ ] Percentages accurate
- [ ] Color coding applied
- [ ] Responsive design
- [ ] Tooltips show exact values

**Files Created**:

- `components/skill-breakdown-chart.tsx`

**Sample Chart (Recharts Bar)**:

```typescript
<BarChart data={skillData}>
	<XAxis dataKey='skill' />
	<YAxis domain={[0, 100]} />
	<Tooltip />
	<Bar dataKey='percentage' fill='#8884d8' />
</BarChart>
```

---

#### ✅ Task 26: Candidate Comparison View

**Status**: Pending

**Actions**:

- [ ] Create `app/(recruiter)/candidates/compare/page.tsx`
- [ ] Accept query params: `?ids=id1,id2,id3` (max 3)
- [ ] Fetch all selected candidates with profiles and evaluations
- [ ] Create API route `app/api/candidate/compare/route.ts`
- [ ] Build side-by-side comparison layout:
  - **Row 1**: Names and emails
  - **Row 2**: Profile summaries (skills, experience)
  - **Row 3**: Scores (visual bars for easy comparison)
  - **Row 4**: Confidence scores
  - **Row 5**: Overlayed skill breakdown charts
  - **Row 6**: Proctoring event counts
- [ ] Add "Select Winner" buttons below each candidate
- [ ] Add multi-select checkbox on candidate list (Task 22)
- [ ] Add "Compare Selected" button on dashboard

**Verification Checklist**:

- [ ] Select up to 3 candidates from list
- [ ] Click "Compare" navigates to comparison page
- [ ] All candidate data displayed side-by-side
- [ ] Skill charts overlayed for easy comparison
- [ ] Can identify strongest candidate visually
- [ ] Action buttons work

**Files Created**:

- `app/(recruiter)/candidates/compare/page.tsx`
- `app/api/candidate/compare/route.ts`
- `components/candidate-comparison.tsx`

---

#### ✅ Task 27: Shortlist and Reject Actions

**Status**: Pending

**Actions**:

- [ ] Create API routes:
  - `app/api/candidate/[id]/shortlist/route.ts`
  - `app/api/candidate/[id]/reject/route.ts`
- [ ] Shortlist handler:
  - Update `candidates.status` to 'SHORTLISTED'
  - Return success
- [ ] Reject handler:
  - Update `candidates.status` to 'REJECTED'
  - Return success
- [ ] Add optimistic UI updates (update state before API response)
- [ ] Show toast notification on success
- [ ] Disable button after action
- [ ] Add confirmation dialog for reject action
- [ ] Log action in database (optional: create `candidate_actions` table)

**Verification Checklist**:

- [ ] Click "Shortlist" updates status to SHORTLISTED
- [ ] Click "Reject" shows confirmation dialog
- [ ] Confirm reject updates status to REJECTED
- [ ] Status change reflected in dashboard immediately
- [ ] Button disabled after action
- [ ] Toast notification shown
- [ ] Cannot undo action (or add undo feature)

**Files Created**:

- `app/api/candidate/[id]/shortlist/route.ts`
- `app/api/candidate/[id]/reject/route.ts`

---

#### ✅ Task 28: Role Overview Dashboard

**Status**: Pending

**Actions**:

- [ ] Create `app/(recruiter)/roles/[id]/page.tsx`
- [ ] Fetch role with all related data:
  - Total candidates invited
  - Completion rate (submitted / invited)
  - Average score across submitted candidates
  - Skill gap heatmap data
- [ ] Create API route `app/api/role/[id]/overview/route.ts`
- [ ] Build overview layout with shadcn Cards:
  - **Stats Cards**: Total invited, completion rate, avg score
  - **Skill Gap Heatmap**: Required skills vs candidate pool avg performance
    - Green: Pool avg > 70% for required skill
    - Yellow: Pool avg 50-70%
    - Red: Pool avg < 50% (skill gap)
  - **Candidate List**: Table of candidates for this role
  - **Actions**: Generate new invite, edit role, close role
- [ ] Add charts for analytics:
  - Score distribution (histogram)
  - Status breakdown (pie chart)

**Verification Checklist**:

- [ ] Navigate to role overview shows all stats
- [ ] Completion rate calculated correctly
- [ ] Average score accurate
- [ ] Skill gap heatmap identifies weak skills
- [ ] Candidate list filtered to this role
- [ ] Actions work (invite, edit)

**Files Created**:

- `app/(recruiter)/roles/[id]/page.tsx`
- `app/api/role/[id]/overview/route.ts`
- `components/role-stats.tsx`
- `components/skill-gap-heatmap.tsx`

---

### **Phase 8: Security & Polish**

#### ✅ Task 29: PostgreSQL Row-Level Security (RLS) Policies

**Status**: Pending

**Actions**:

- [ ] Enable RLS on all tables (if using Supabase or PostgreSQL with RLS support)
- [ ] Create policies:
  - **Roles table**: Recruiters see only their own roles
    ```sql
    CREATE POLICY recruiter_roles ON roles
      FOR SELECT USING (recruiter_id = auth.uid());
    ```
  - **Candidates table**: Recruiters see candidates for their roles only
    ```sql
    CREATE POLICY recruiter_candidates ON candidates
      FOR SELECT USING (
        role_id IN (SELECT id FROM roles WHERE recruiter_id = auth.uid())
      );
    ```
  - **Candidates table**: Candidates see only their own data
    ```sql
    CREATE POLICY candidate_self_access ON candidates
      FOR SELECT USING (user_id = auth.uid());
    ```
  - Apply similar policies to quizzes, attempts, evaluations
- [ ] Test policies by attempting cross-user access
- [ ] Ensure API routes respect RLS (queries run as authenticated user)

**Verification Checklist**:

- [ ] RLS enabled on all sensitive tables
- [ ] Recruiter A cannot see Recruiter B's roles
- [ ] Candidate A cannot see Candidate B's quiz
- [ ] Direct database queries respect RLS
- [ ] API routes enforce access control
- [ ] Prisma queries work with RLS (configure connection)

**Files Created/Modified**:

- `migrations/add_rls_policies.sql` (if using migrations)
- Database policies

**Note**: RLS implementation depends on database provider. Supabase has built-in support. For other providers, may need application-level checks.

---

#### ✅ Task 30: Single-Attempt and Immutability Enforcement

**Status**: Pending

**Actions**:

- [ ] Verify database UNIQUE constraints:
  - `quizzes.candidate_id` (one quiz per candidate)
  - `attempts.candidate_id` (one attempt per candidate)
- [ ] Add API checks before quiz start:
  - Check if attempt already exists
  - Return error if exists: "Quiz already taken"
- [ ] Add UI checks:
  - Before showing quiz, verify no attempt exists
  - Show "Already completed" message if attempt found
- [ ] Prevent quiz editing after generation:
  - No UPDATE operations on quizzes table
  - No UPDATE operations on attempts table after submission
- [ ] Add database triggers (optional) to prevent updates
- [ ] Test constraint violations

**Verification Checklist**:

- [ ] Cannot generate duplicate quiz for same candidate
- [ ] Cannot create duplicate attempt for same candidate
- [ ] API returns appropriate error on duplicate attempt
- [ ] UI shows clear message when quiz already taken
- [ ] Quiz questions cannot be edited after generation
- [ ] Attempt responses cannot be edited after submission

**Files Created**:

- Update API routes with checks
- `migrations/enforce_immutability.sql` (optional triggers)

---

#### ✅ Task 31: Error Boundaries and Loading States

**Status**: Pending

**Actions**:

- [ ] Create global error boundary `app/error.tsx`
- [ ] Create loading component `app/loading.tsx`
- [ ] Add error boundaries to key routes:
  - `app/(recruiter)/error.tsx`
  - `app/(candidate)/error.tsx`
  - Route-specific error pages
- [ ] Add loading states to key routes:
  - `app/(recruiter)/dashboard/loading.tsx`
  - `app/(candidate)/quiz/[id]/loading.tsx`
- [ ] Install toast library: `npm install sonner` (recommended with shadcn)
- [ ] Create toast notifications utility `lib/toast.ts`
- [ ] Add error handling to all API routes:
  - Try-catch blocks
  - Descriptive error messages
  - Appropriate HTTP status codes
- [ ] Add client-side error handling:
  - Form validation errors
  - Network errors
  - Timeout errors
- [ ] Implement graceful degradation:
  - Ollama API failure → show retry option
  - Database timeout → show error message

**Verification Checklist**:

- [ ] Errors caught and displayed in error boundaries
- [ ] Loading spinners shown during data fetch
- [ ] Toast notifications work for success/error
- [ ] API errors return proper status codes
- [ ] Form validation shows clear messages
- [ ] Network failures handled gracefully
- [ ] User never sees blank screen or crash

**Files Created**:

- `app/error.tsx`
- `app/loading.tsx`
- `app/(recruiter)/error.tsx`
- `app/(candidate)/error.tsx`
- `lib/toast.ts`
- `components/loading-spinner.tsx`

---

## Environment Variables Checklist

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Better Auth
BETTER_AUTH_SECRET="your-secret-key-generate-with-openssl-rand-base64-32"
BETTER_AUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Ollama Cloud API
OLLAMA_CLOUD_API_KEY="your-ollama-api-key"
OLLAMA_CLOUD_API_URL="https://cloud.ollama.ai/api"

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
| **Database**       | PostgreSQL (Supabase/Neon/Vercel)     |
| **ORM**            | Prisma                                |
| **Authentication** | Better Auth (Google OAuth)            |
| **AI Provider**    | Ollama Cloud API (gpt-oss:120b-cloud) |
| **PDF Processing** | pdf.js (client-side)                  |
| **Charts**         | Recharts                              |
| **Notifications**  | Sonner (toast library)                |
| **Deployment**     | Vercel (recommended)                  |

---

## Testing Checkpoints

After completing each phase, verify:

### Phase 1: Foundation

- [ ] App runs locally
- [ ] Database connected
- [ ] OAuth login works for both roles
- [ ] Environment variables loaded

### Phase 2: Document Processing

- [ ] PDF text extraction works
- [ ] Ollama API calls successful
- [ ] Structured JSON responses parsed

### Phase 3: Recruiter Flow

- [ ] Create role with JD upload
- [ ] Edit requirements
- [ ] Generate invite link
- [ ] Copy link works

### Phase 4: Candidate Flow

- [ ] Open invite link
- [ ] OAuth sign-in as candidate
- [ ] Upload resume
- [ ] Quiz auto-generated

### Phase 5: Assessment

- [ ] Take quiz in fullscreen
- [ ] Timer counts down
- [ ] Proctoring detects violations
- [ ] Submit responses

### Phase 6: Evaluation

- [ ] Score calculated correctly
- [ ] Skill breakdown accurate
- [ ] Confidence score computed
- [ ] Anomalies detected

### Phase 7: Dashboard

- [ ] View all candidates
- [ ] Filter and sort work
- [ ] View candidate details
- [ ] Skill chart displays
- [ ] Compare candidates
- [ ] Shortlist/reject actions
- [ ] Role overview analytics

### Phase 8: Security

- [ ] RLS policies enforced
- [ ] Single attempt works
- [ ] Errors handled gracefully
- [ ] Loading states shown

---

## Key Architectural Changes from Original Plan

### ✅ **No Candidate Authentication**
- **Previous**: Candidates login via Google OAuth, upload their own resume
- **New**: Candidates access via unique quiz links (no authentication needed)
- **Impact**: Simpler flow, higher completion rate, less code

### ✅ **Recruiter-Controlled Flow**
- **Previous**: Candidates self-serve (click invite → upload resume → take quiz)
- **New**: Recruiter uploads both JD and candidate resumes
- **Impact**: Recruiter has full control, prevents candidate gaming

### ✅ **Two-Part Assessment System (70/30 Split)**
- **Previous**: All questions candidate-specific, single score
- **New**: 70% standard (JD-based) + 30% verification (resume-based)
- **Impact**: Fair comparison across candidates, resume fraud detection

### ✅ **Standard Questions Generated at Role Creation**
- **Previous**: Quiz generated per candidate
- **New**: Base questions (70%) generated when role created, reused for all candidates
- **Impact**: Ensures fair comparison, all candidates get same standard questions

### ✅ **Verification Questions Per Candidate**
- **New**: 30% of questions generated from candidate's resume projects
- **Focus**: Tech mentioned IN projects, tests depth not breadth
- **Impact**: Catches resume inflation without affecting ranking

### ✅ **Two-Part Scoring**
- **Previous**: Single score used for ranking
- **New**:
  - Ranking Score (70% questions only) - used for comparison
  - Verification Flags (30% questions) - qualitative, not scored
- **Impact**: Fair ranking + fraud detection

### ✅ **Question Structure**
- Questions have `type` field: 'STANDARD' or 'RESUME_VERIFICATION'
- Fully shuffled before storage
- Candidate sees no visual distinction
- Recruiter sees which questions flagged resume discrepancies

### ✅ **Configurable Question Count**
- Total questions: 5-25 (default 10)
- Always maintains 70/30 split
- Set during role creation

### ✅ **Database Schema Changes Required**
- JobRole needs: `baseQuestions`, `totalQuestions` fields
- Quiz question structure needs: `type` field
- Evaluation needs: `standardScore`, `verificationStatus`, `verificationResults` fields
- Candidate auth-related fields may be simplified (no User relation needed)

### ✅ **UI Changes**
- Dashboard shows two columns: Ranking Score + Verification Status
- Candidate detail shows verification section with failed claims
- Verification badge component (✅/⚠️/🚩)
- Questions configured during role creation

---

## Next Steps

Ready to begin implementation!

**Current Status**: All 31 tasks defined and ready to execute with updated architecture.

**Start with Task 1**: Initialize Next.js 16 project with all dependencies.

**Next: Task 3 (Database Schema)** - Critical to update schema for two-part assessment system.

Let me know when you're ready to proceed!
