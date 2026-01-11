# Screenify → AI-Assisted Candidate Screening Platform

---

## Executive Summary

Create a quiz platform into a **recruiter-facing candidate screening system** that generates **standardized + resume-verified** technical assessments based on job requirements and resume analysis.

**Core Innovation**: Two-part assessment combining standardized role-based questions (70%) with resume verification questions (30%), ensuring fair comparison while catching resume fraud.

**Key Goal**: Generate challenging technical questions for fair candidate comparison while verifying claimed skills, helping recruiters identify truly skilled candidates.

---

## System Flows

### Recruiter Flow - Phase 1: Job Role Creation

```
Auth (Google OAuth)
  ↓
Create Role (title, description)
  ↓
Upload JD PDF
  ↓
[pdf.js]
Extract raw text from PDF
  ↓
[Ollama Cloud API]
Convert raw text to structured requirements
  ↓
Review & Edit Requirements
(Recruiter can modify skills, experience, etc.)
  ↓
[Ollama Cloud API]
Generate Base Questions (70% of configurable total)
  ↓
Save Role + Base Questions to DB
  ↓
Role Created ✓
```

**Key Point**: Base standardized questions generated from JD only. These are the same for ALL candidates applying to this role.

---

### Recruiter Flow - Phase 2: Per-Candidate Quiz Setup

```
Select Existing Role
  ↓
Upload Candidate Resume PDF
  ↓
[pdf.js]
Extract raw text from PDF
  ↓
[Ollama Cloud API]
Convert raw text to structured profile
  ↓
[Ollama Cloud API]
Generate Resume Verification Questions (30% of total)
(Based on projects and tech mentioned in projects)
  ↓
Combine: Base Questions (70%) + Verification Questions (30%)
  ↓
Shuffle All Questions (fully randomized)
  ↓
Generate Unique Quiz Link
  ↓
Share Link with Candidate (email, messaging, etc.)
```

**Key Point**: Each candidate gets a unique quiz link. Recruiter controls everything - no candidate login needed.

---

### Candidate Flow (No Authentication Required)

```
Receive Unique Quiz Link from Recruiter
  ↓
Open Link (shows role info)
  ↓
Click "Start Assessment"
  ↓
Take Quiz (timed, proctored, fullscreen)
  ↓
Questions appear randomized (candidate doesn't know which are verification)
  ↓
Submit Answers
  ↓
Auto-Evaluation:
  - Standard Questions (70%) → Ranking Score
  - Verification Questions (30%) → Fraud Flags
  ↓
Results sent to Recruiter Dashboard
  ↓
Candidate sees "Thank you" message
```

**Key Points**:
- No candidate account needed
- Candidate sees all questions the same way
- Single attempt per unique link
- 70% standard questions = fair comparison score
- 30% verification questions = resume fraud detection (not scored)

---

## Complete Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│              PHASE 1: JOB ROLE CREATION (Recruiter)             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  JD PDF ──────► pdf.js ──────► Raw Text ──────► Ollama Cloud    │
│                                                        ↓         │
│                                                requirements JSONB│
│                                                        ↓         │
│                                            Recruiter Reviews/    │
│                                            Edits                 │
│                                                        ↓         │
│                                             Ollama Cloud API     │
│                                             Generate Base        │
│                                             Questions (70%)      │
│                                                        ↓         │
│                                          Save role + questions   │
│                                          to DB (job_roles table) │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│        PHASE 2: PER-CANDIDATE QUIZ SETUP (Recruiter)            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Resume PDF ──► pdf.js ──────► Raw Text ──────► Ollama Cloud    │
│                                                        ↓         │
│                                                 profile JSONB    │
│                                          (skills from projects)  │
│                                                        ↓         │
│                                             Ollama Cloud API     │
│                                             Generate Verification│
│                                             Questions (30%)      │
│                                             (project-based)      │
│                                                        ↓         │
│                                    Combine 70% + 30% + Shuffle   │
│                                                        ↓         │
│                                    Store complete quiz in DB     │
│                                    Generate unique link          │
│                                                        ↓         │
│                                    Recruiter shares link         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│               PHASE 3: ASSESSMENT (Candidate)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Candidate clicks link ────► No login required                  │
│         ↓                                                        │
│  Start Quiz ────► Proctoring (fullscreen, tab detect)           │
│         ↓                                                        │
│  Answer Questions ────► All appear identical                     │
│  (Standard 70% + Verification 30% fully mixed)                   │
│         ↓                                                        │
│  Submit Responses ────► Auto-Evaluation Engine                   │
│         ↓                        ↓                               │
│  Store answers          Standard Q's → Ranking Score (0-100)    │
│  + proctoring flags     Verification Q's → Fraud Flags           │
│                                  ↓                               │
│                         Recruiter Dashboard                      │
│                         (compare scores + flags)                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Two-Part Assessment System

This is where the magic happens:

### Part 1: Standardized Questions (70% of total)

**Generated at:** Role creation (Phase 1)
**Input:** Job Description requirements only
**Purpose:** Fair comparison across all candidates

```
Inputs:
  - Role Requirements (from DB)
    • required_skills: ['React', 'Node.js', 'PostgreSQL']
    • experience: {min: 3, max: 5}
    • responsibilities: [...]

Process:
  1. Ollama generates N×0.7 tough technical questions
  2. Based ONLY on job requirements
  3. Tests depth in required skills
  4. These questions are reused for ALL candidates

Output:
  - Base questions stored in job_roles.baseQuestions
  - Same for every candidate applying to this role
```

### Part 2: Resume Verification Questions (30% of total)

**Generated at:** Per-candidate quiz setup (Phase 2)
**Input:** Candidate's resume (projects and tech stack)
**Purpose:** Verify claimed skills and catch resume fraud

```
Inputs:
  - Candidate Resume (parsed)
    • projects: [{name, tech_stack, description}, ...]
    • skills_mentioned: ['Kafka', 'Kubernetes', 'React']
    • claimed_experience: 4 years

Process:
  1. Ollama generates N×0.3 verification questions
  2. Based on projects and tech mentioned IN projects
  3. Focus on depth, not breadth
  4. Questions like: "You mentioned Kafka in Project X. Explain consumer groups."

Output:
  - Verification questions specific to this candidate
  - Mixed with base questions and shuffled
```

### Combined Quiz Structure

```
Total Questions: N (configurable, 5-25, default 10)
  ├─ Standard (70%): 7 questions (from JD)
  └─ Verification (30%): 3 questions (from resume projects)

Candidate sees: All 10 questions fully randomized, no visual distinction

Scoring:
  ├─ Standard questions → Ranking Score (0-100) ← Used for comparison
  └─ Verification questions → Fraud Flags (✅/⚠️/🚩) ← Not scored

Recruiter Dashboard:
  Candidate A: 87% ranking, ✅ Verified
  Candidate B: 92% ranking, ⚠️ Questionable (Kafka claim suspect)
  Candidate C: 79% ranking, 🚩 Discrepancy (Multiple failed verifications)
```

**Why This Approach?**
- **Fair Comparison**: All candidates judged on same 70% standard questions
- **Fraud Detection**: 30% verification catches resume inflation
- **Depth Testing**: Resume questions focus on projects, not just keywords
- **No Gaming**: Candidates don't know which questions are which
- **Actionable**: Recruiter can probe questionable claims in interviews

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Auth** | Better Auth (Google OAuth) - Recruiters only |
| **AI Provider** | Ollama Cloud API (model configurable via `OLLAMA_CLOUD_MODEL` env var) |
| **AI - Doc Parse** | Ollama Cloud (text → structured JSON) |
| **AI - Quiz Gen** | Ollama Cloud (same model, same API) |
| **Doc Processing** | pdf.js (client-side PDF text extraction, PDFs not stored) |
| **Database** | PostgreSQL with Prisma ORM |
| **Evaluation** | Auto-eval + Recruiter dashboard |

**Note**: Gemini Vision API documented as alternative (not implemented initially).

---

## Database Schema

See `prisma/schema.prisma` for the complete schema definition.

### Key Tables

| Table | Purpose |
|-------|---------|
| **User** | Better Auth users (recruiters only) |
| **Recruiter** | Links user to their created job roles |
| **JobRole** | Job positions with JD requirements + base questions (70%) |
| **Quiz** | Per-candidate quiz with candidate info, combined questions, and unique token |
| **QuizAnswer** | Individual answer submissions with timing |
| **QuizResult** | Two-part scoring: standardScore (ranking) + verificationStatus (fraud) |

### Key Schema Decisions

1. **No Separate Candidate Table**: Candidate info (name, email) stored inline in Quiz
2. **No Invitation Table**: Recruiter creates quiz directly, gets unique token link
3. **Base Questions in JobRole**: 70% standard questions stored in `JobRole.baseQuestions`, reused for all candidates
4. **Combined Questions in Quiz**: `Quiz.questions` contains shuffled 70% + 30% with type field
5. **Two-Part Scoring**: QuizResult has `standardScore` for ranking + `verificationStatus` for fraud flags
6. **JSONB for Flexibility**: JD, questions, answers, and metrics stored as JSON

---

## Implementation Components

### 1. Document Processing Pipeline

**Architecture**: pdf.js → Raw Text → Ollama Cloud → Structured JSON

**JD Extraction Flow**:
```
1. Upload JD PDF (client-side, not stored)
2. Extract raw text using pdf.js (browser)
3. Send raw text to Ollama Cloud API
4. Prompt: "Convert this unstructured JD text into structured JSON"
5. Parse response into requirements JSONB
6. Show editable UI to recruiter
7. Recruiter reviews and modifies if needed
8. Save final requirements to roles.requirements (PostgreSQL)
```

**Resume Extraction Flow**:
```
1. Upload resume PDF (client-side, not stored)
2. Extract raw text using pdf.js (browser)
3. Send raw text to Ollama Cloud API
4. Prompt: "Convert this unstructured resume text into structured JSON"
5. Parse response into profile JSONB
6. Store directly in candidates.profile (PostgreSQL)
7. No candidate review (direct to quiz generation)
```

**Note**: PDFs are processed client-side and discarded. Only structured JSON data is persisted in the database.

**Ollama Cloud Prompt Structure**:

For JD:
```json
{
  "model": "gpt-oss:120b-cloud",
  "prompt": "Extract the following from this job description text and return as JSON:
    - required_skills: array of technical skills (explicit requirements)
    - preferred_skills: array of nice-to-have skills
    - experience: {min: number, max: number, unit: 'years'}
    - responsibilities: array of key duties
    - qualifications: array of required qualifications

    JD Text:
    [raw_text_here]",
  "format": "json"
}
```

For Resume:
```json
{
  "model": "gpt-oss:120b-cloud",
  "prompt": "Extract the following from this resume text and return as JSON:
    - name, email, phone
    - skills: array of technical skills mentioned
    - experience: array of {company, role, duration, description}
    - education: array of {degree, institution, year}
    - total_experience_years: calculated total

    Resume Text:
    [raw_text_here]",
  "format": "json"
}
```

**Why pdf.js + Ollama Cloud?**
- **Simple pipeline**: pdf.js (client-side extraction) → Ollama Cloud (structuring)
- **Cost-effective**: Single AI provider for all operations
- **Fast**: pdf.js extraction is instant, Ollama Cloud is fast
- **MVP-friendly**: Start with PDF only, defer OCR/images to later
- **Consistent API**: Same Ollama Cloud API for extraction + quiz generation

**Alternative (Documented, Not Implemented)**:
- **Gemini Vision API**: Can directly process images/scanned PDFs
- Use case: When OCR or image-based resumes are needed
- Deferred to post-MVP phase

---

### 2. Tough Quiz Generation (Ollama Cloud)

**Trigger**: After candidate profile is extracted and stored

**Inputs**:
- Role requirements (from `roles.requirements`)
- Candidate profile (from `candidates.profile`)

**Process**:
1. Fetch requirements and profile from DB
2. Build context-aware prompt for Ollama Cloud
3. Emphasize tough, rigorous technical questions
4. Request JSON output with validation schema
5. Store generated quiz immutably

**Ollama Cloud API Call**:
```json
{
  "model": "gpt-oss:120b-cloud",
  "prompt": "You are a technical interviewer creating a RIGOROUS screening assessment.

ROLE: Senior Frontend Developer
REQUIRED SKILLS: React, TypeScript, Node.js, PostgreSQL
EXPERIENCE REQUIREMENT: 3-5 years

CANDIDATE BACKGROUND:
- Skills: React, JavaScript, MongoDB, Vue.js
- Total Experience: 4 years
- Recent Role: Frontend Developer at TechCorp (2 years)

Generate 20 TOUGH multiple-choice technical questions:
- Focus on deep technical knowledge of required skills
- Include scenario-based questions that test real-world problem-solving
- Make questions challenging (avoid basic/trivial questions)
- Test understanding, not memorization
- Include edge cases and best practices

Output as JSON:
[
  {
    \"id\": \"q1\",
    \"question\": \"...\",
    \"options\": [\"A\", \"B\", \"C\", \"D\"],
    \"correct_index\": 0,
    \"skill\": \"React\",
    \"difficulty\": \"hard\"
  }
]

Make this assessment challenging. The job market is competitive and we need to identify truly skilled candidates.",
  "format": "json"
}
```

**Key Prompt Elements**:
- **"RIGOROUS"** and **"TOUGH"** keywords to set tone
- Role + candidate context for adaptive questions
- Explicit instruction to avoid trivial questions
- Request for scenario-based, real-world questions
- JSON output format for parsing

**Output**: Quiz stored in `quizzes.questions` JSONB. Immutable after creation.

---

### 3. Candidate Assessment (Reuse Existing Proctoring)

**Components to Reuse**:
- Timer component (`components/timer.tsx`)
- Question display (`components/question.tsx`)
- Full-screen enforcement
- Tab-switch detection
- Visibility API listeners

**Modifications**:
- Remove quiz selection UI (quiz is pre-generated)
- Add candidate context (name, role, company)
- Store proctoring flags in `attempts.proctoring_flags`
- Single attempt enforcement (check `attempts.candidate_id` uniqueness)

**Flow**:
1. Candidate opens invite link → sees role title and description
2. Uploads resume PDF → pdf.js extracts text → Ollama Cloud structures profile → generates quiz
3. "Start Assessment" button → enters full-screen mode
4. Questions displayed one-by-one
5. Timer counts down (20s per question default)
6. On submit: store responses, proctoring flags, trigger evaluation

---

### 4. Auto-Evaluation Engine

**Trigger**: Attempt submitted

**Process**:
1. **MCQ Scoring**:
   - Compare `responses[].selected_index` with `questions[].correct_index`
   - Calculate raw score (correct / total)
2. **Skill Breakdown**:
   - Group questions by skill
   - Calculate percentage per skill
3. **Confidence Scoring**:
   - Base: 100
   - Penalize: -5 per tab switch, -10 per full-screen exit
   - Cap at 0 minimum
4. **Anomaly Detection**:
   - Time anomaly: avg time < 10s per question
   - Pattern anomaly: all correct answers in last 20% of time
   - Consistency: sudden accuracy spike
5. **Store Evaluation**:
   - Insert into `evaluations` table
   - Update `candidates.status` to 'SUBMITTED'

**Evaluation Output**:
```json
{
  score: 75.5,
  skill_breakdown: {
    "React": 80,
    "TypeScript": 70,
    "Node.js": 60
  },
  confidence_score: 85,
  anomaly_indicators: [
    {type: "time_anomaly", severity: "low", details: "Avg 8s/question"}
  ]
}
```

---

### 5. Recruiter Dashboard

**Views**:

**A. Candidate List**:
- Table with: name, email, status, score, confidence, applied date
- Filters: status, score range, skills
- Sort: score, date, confidence
- Actions: view details, shortlist, reject

**B. Candidate Detail**:
- Profile overview (resume fields)
- Quiz attempt summary (score, time taken, proctoring events)
- Skill breakdown (radar chart)
- Question-by-question review (optional)
- Actions: shortlist, reject, add notes

**C. Comparison View**:
- Side-by-side (max 3 candidates)
- Normalized scores
- Skill overlay (which candidate is stronger where)
- Recommendation: auto-suggest top N based on criteria

**D. Role Overview**:
- Total candidates invited
- Completion rate
- Average score
- Skill gap heatmap (required skills vs candidate pool performance)

**Auto-Shortlist Criteria** (configurable):
- Min score: 70
- Min confidence: 75
- Max proctoring flags: 3
- Required skills threshold: 80% of skills scored >60%

---

## Implementation Phases

### Phase 1: Core Infrastructure ✅
- PostgreSQL database schema setup
- Better Auth with Google OAuth (recruiters only)
- Basic UI scaffolding with shadcn/ui
- Client-side file upload UI (PDFs not persisted)

### Phase 2: Document Intelligence ✅
- pdf.js integration (client-side PDF text extraction)
- Ollama Cloud API integration
- JD extraction (pdf.js → raw text → Ollama → structured JSON)
- Editable review UI for recruiters (inline editing during role creation)
- Resume extraction function ready (Ollama API call implemented)

### Phase 3: Role + Base Questions ✅
- Role creation form with PDF import
- Base question generation (70%) via Ollama Cloud
- Questions stored in JobRole.baseQuestions

### Phase 4: Per-Candidate Quiz Setup (Pending)
- Resume upload and profile extraction
- Verification question generation (30%) from resume projects
- Combine 70% + 30% questions, shuffle, create Quiz
- Generate unique token link

### Phase 5: Candidate Assessment (Pending)
- Token-based quiz access (no auth)
- Quiz taking interface
- Proctoring (fullscreen, tab detection)
- Answer submission with timing

### Phase 6: Evaluation & Dashboard (Pending)
- Auto-evaluation engine with two-part scoring
- Standard score (ranking) from 70% questions
- Verification status (fraud flags) from 30% questions
- Recruiter dashboard (list, detail, comparison)

---

## API Endpoints

### Implemented ✅
```
POST   /api/auth/[...all]                 Better Auth (Google OAuth)
GET    /api/auth-callback                 Post-OAuth auto-creates recruiter
POST   /api/role/extract-jd               Extract JD requirements from text
POST   /api/role/create                   Create role + generate base questions
```

### Pending (Recruiter APIs)
```
POST   /api/role/:id/add-candidate        Upload resume, generate quiz, return token
GET    /api/role/:id/candidates           List candidates for a role
GET    /api/quiz/:id/results              Get quiz results for recruiter
POST   /api/quiz/:id/shortlist            Shortlist candidate
POST   /api/quiz/:id/reject               Reject candidate
```

### Pending (Candidate APIs)
```
GET    /api/quiz/token/:token             Validate token, get quiz info
POST   /api/quiz/token/:token/start       Start quiz attempt
POST   /api/quiz/token/:token/answer      Submit single answer
POST   /api/quiz/token/:token/submit      Submit quiz + trigger evaluation
```

---

## Cost Analysis

### AI Usage (Ollama Cloud API with gpt-oss:120b-cloud)

| Operation | Frequency | Estimated Cost |
|-----------|-----------|----------------|
| JD Extraction | Per role | Depends on Ollama Cloud pricing |
| Resume Extraction | Per candidate | Depends on Ollama Cloud pricing |
| Quiz Generation | Per candidate | Depends on Ollama Cloud pricing |

**Strategy**:
- **Single AI Provider**: Ollama Cloud for all operations (extraction + generation)
- **Consistent API**: Same model and endpoint for all LLM calls
- **Token Optimization**: pdf.js extracts text locally, only structured data sent to API
- **Caching**: Never re-parse documents (store structured JSON in DB)

**Cost Optimization**:
- pdf.js runs client-side (browser) → zero cost for text extraction
- Only text → JSON structuring uses Ollama Cloud tokens
- Quiz generation uses Ollama Cloud (paid, but predictable per candidate)
- No file storage costs (PDFs processed and discarded)

---

## Security & Data Protection

### Authentication
- OAuth (Google) via Better Auth
- Role-based access control (RBAC)
- Invitation tokens (UUID, single-use or time-limited)
---

## Future Enhancements (Post-MVP)

### Phase 2 Features
1. **Organizations**: Multi-recruiter teams, shared candidate pools
2. **Subjective Questions**: Free-text answers, LLM rubric scoring
3. **Code Challenges**: Monaco editor, test case validation, LLM code review
4. **Face Monitoring**: face-api.js for optional presence detection (browser-based)
5. **Collaborative Hiring**: Notes, ratings, interview scheduling
6. **Advanced Analytics**: Benchmarking, skill trends, time-to-hire metrics

### Schema Extensions Ready
- `questions.type`: Already supports 'mcq', 'subjective', 'code'
- `evaluations.subjective_scores`: JSONB for future LLM-scored answers
- `organizations` table: Can be added without breaking existing schema

---

## Key Decisions & Rationale

### Architecture Choice: pdf.js + Ollama Cloud

We chose a **client-side extraction + single AI provider** approach:

**Key Decisions**:
1. **pdf.js for Text Extraction**:
   - Client-side processing (browser) → zero server costs
   - No file storage needed → privacy-friendly
   - Fast and reliable for PDF text extraction
   - Start with PDFs only, defer OCR/images to later

2. **Ollama Cloud for All LLM Operations**:
   - Single AI provider for extraction + quiz generation
   - Consistent API and model (gpt-oss:120b-cloud)
   - Simplifies integration and debugging
   - Predictable token costs

3. **No File Storage**:
   - PDFs processed client-side and discarded
   - Only structured JSON persisted in PostgreSQL
   - Reduces storage costs and security surface
   - GDPR-friendly (no raw documents retained)

**Alternative (Documented, Not Implemented)**:
- **Gemini Vision API**: Can process images/scanned PDFs directly
- Use case: When OCR or image-based resumes are needed
- Deferred to post-MVP phase

### Why 70/30 Split (Standard vs Verification)?
- **Fair Comparison**: 70% standard questions = apples-to-apples ranking
- **Fraud Detection**: 30% verification catches resume inflation without affecting score
- **No Gaming**: Candidates can't optimize resumes for easier questions
- **Actionable**: Flags give recruiters specific talking points for interviews
- **Legally Safe**: Ranking based on objective, consistent criteria

### Why pdf.js + Ollama Cloud?
- **Zero Extraction Cost**: pdf.js runs in browser, no server costs
- **No File Storage**: Client-side processing, PDFs never persisted
- **Single AI Provider**: Ollama Cloud for all LLM operations (simpler)
- **Privacy**: Raw documents never leave client or stored on server
- **Fast**: pdf.js is instant, Ollama Cloud responses are quick
- **MVP-Friendly**: Start with PDFs, add OCR later if needed

### Why Prompt Engineering Over Algorithmic Distribution?
- simplicity, flexibility, quality
### Why No Candidate Authentication?
- zero friction, simpler flow, less code, master mvp

---

## Success Metrics

### Technical
- JD/Resume extraction accuracy: >85%
- Quiz generation time: <30s
- Evaluation processing: <5s
- Dashboard load time: <2s

---

## Current Progress

### Completed ✅
- Database schema (Prisma) with all tables
- Better Auth with Google OAuth
- Ollama Cloud API integration (all 4 functions)
- PDF.js client-side extraction
- Role creation with JD upload and base question generation
- Recruiter dashboard showing roles

### Next Steps
1. **Per-Candidate Quiz Setup**: Build resume upload API, generate verification questions, create quiz with token
2. **Candidate Quiz Flow**: Token-based access, quiz interface, answer submission
3. **Proctoring**: Fullscreen enforcement, tab switch detection
4. **Evaluation Engine**: Two-part scoring, skill breakdown, anomaly detection
5. **Recruiter Results Dashboard**: View scores, verification flags, compare candidates

---

## Summary

Screenify is a **recruiter-centric hiring pipeline** with:

### Implemented
- Two-Part Assessment System (70% standard + 30% verification for fair comparison)
- No Candidate Authentication (unique quiz links, no login required)
- Recruiter-Controlled Flow (recruiter uploads both JD and resumes)
- Single AI Provider (Ollama Cloud for all LLM operations)
- Client-Side PDF Processing (pdf.js, no file storage costs)
- Configurable Question Count (5-25 questions, maintains 70/30 split)
- PostgreSQL with Prisma ORM

### Planned
- Standardized Scoring (70% questions ensure fair candidate comparison)
- Resume Fraud Detection (30% verification questions flag suspicious claims)
- Project-Based Verification (questions derived from tech in actual projects)
- Proctoring (full-screen, tab detection)
- Qualitative Fraud Flags (VERIFIED/QUESTIONABLE/DISCREPANCY indicators)
- Actionable Recruiter Dashboard (compare scores + review flags)

**The Core Innovation**: Combines the fairness of standardized assessment (70%) with the intelligence of resume verification (30%), ensuring candidates are ranked objectively while catching resume fraud. Verification questions don't affect ranking but flag suspicious claims for interview follow-up.

**Technical Simplicity**: pdf.js (browser) → raw text → Ollama Cloud → structured JSON → PostgreSQL. Single AI provider, no file storage, client-side processing. No candidate authentication needed.
