# Screenify → AI-Assisted Candidate Screening Platform

---

## Executive Summary

Create a quiz platform into a **recruiter-facing candidate screening system** that generates **tough, candidate-specific** technical assessments based on job requirements and resume analysis.

**Core Innovation**: Quiz generation happens at the **conjunction point** of Role Requirements + Candidate Profile, creating rigorous, adaptive assessments that test technical depth.

**Key Goal**: Generate challenging technical questions to identify truly skilled candidates in a competitive job market.

---

## System Flows

### Recruiter Flow (Primary)

```
Auth
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
Save Requirements to DB
  ↓
Generate Invite Link (role-bound)
  ↓
Share with Candidates
  ↓
[Wait for candidate submissions]
  ↓
View Dashboard (compare, shortlist)
```

**Key Point**: No quiz exists yet. Quiz is generated per candidate, not per role.

---

### Candidate Flow (Secondary)

```
Open Invite Link (no auth required initially)
  ↓
Upload Resume PDF
  ↓
[pdf.js]
Extract raw text from PDF
  ↓
[Ollama Cloud API]
Convert raw text to structured profile
  ↓
Store Profile to DB (no candidate review)
  ↓
[CONJUNCTION POINT]
Role Requirements + Candidate Profile
  ↓
[Ollama Cloud API - gpt-oss:120b-cloud]
Generate Tough Candidate-Specific Quiz
  ↓
Take Quiz (timed, proctored - reuse existing)
  ↓
Submit Answers
  ↓
Auto-Evaluation
  ↓
Results sent to Recruiter Dashboard
```

**Key Point**: Quiz is **immutable** and **candidate-specific**. Single attempt only. No profile review by candidate.
**Implementation**: Start with PDF only. Image support (OCR) can be added later.

---

## Complete Pipeline Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     DOCUMENT PROCESSING                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  JD PDF ──────► pdf.js ──────► Raw Text ──────► Ollama Cloud    │
│                                                        ↓         │
│                                                requirements JSONB│
│                                                        ↓         │
│                                            Recruiter Reviews/    │
│                                            Edits                 │
│                                                        ↓         │
│                                                 Save to roles    │
│                                                 table            │
│                                                                  │
│  Resume PDF ──► pdf.js ──────► Raw Text ──────► Ollama Cloud    │
│                                                        ↓         │
│                                                 profile JSONB    │
│                                                        ↓         │
│                                            Direct to candidates  │
│                                            table (no review)     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      QUIZ GENERATION                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  requirements (DB) + profile (DB) ────► Build Context Prompt    │
│                                                 ↓                │
│                                    Ollama Cloud API              │
│                                    (gpt-oss:120b-cloud)          │
│                                    ("Generate TOUGH questions")  │
│                                                 ↓                │
│                                    questions JSONB               │
│                                                 ↓                │
│                                    Store in quizzes table        │
│                                    (immutable)                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                   ASSESSMENT & EVALUATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Candidate Takes Quiz ────► Proctoring (fullscreen, tab detect) │
│         ↓                                                        │
│  Submit Responses ────► Auto-Evaluation Engine                   │
│         ↓                        ↓                               │
│  Store in attempts        Store in evaluations                   │
│  (responses, flags)       (score, skill_breakdown, confidence)   │
│                                  ↓                               │
│                         Recruiter Dashboard                      │
│                         (compare, shortlist)                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## The Conjunction Point

This is where the magic happens:

```
Inputs:
  - Role Requirements (from DB)
    • required_skills: ['React', 'Node.js', 'PostgreSQL']
    • experience: {min: 3, max: 5}
    • responsibilities: [...]
    • qualifications: [...]

  - Candidate Profile (from DB)
    • skills: ['React', 'TypeScript', 'MongoDB']
    • experience: [{company, role, duration, description}, ...]
    • education: [...]
    • total_experience_years: 4

Process:
  1. Build context-aware prompt for Ollama
  2. Request tough technical questions
  3. Include role requirements + candidate background
  4. Generate 15-20 questions

Output:
  - Candidate-specific quiz (JSON)
  - Stored immutably in quizzes table
  - Bound to single attempt
```

**Why Candidate-Specific?**
- Adaptive difficulty (based on candidate's experience level)
- Tests required skills in context of candidate's background
- Prevents question leakage (each candidate gets unique quiz)
- Tougher assessment (no preparation possible)

---

## Tech Stack

| Component | Current | New |
|-----------|---------|-----|
| **Auth** | GitHub OAuth | Google OAuth (Better Auth) |
| **User Model** | Single type | RBAC: Recruiter / Candidate |
| **AI Provider** | N/A | **Ollama Cloud API (gpt-oss:120b-cloud)** with API key |
| **AI - Doc Parse** | N/A | Ollama Cloud (text → structured JSON) |
| **AI - Quiz Gen** | N/A | Ollama Cloud (same model, same API) |
| **Doc Processing** | N/A | **pdf.js** (client-side PDF text extraction, PDFs not stored) |
| **Database** | N/A | PostgreSQL (structured data only: requirements, profiles, quizzes) |
| **Quiz Scope** | User-generated topics | Tough, role + candidate adaptive |
| **Evaluation** | Self-scoring | Auto-eval + Recruiter dashboard |

**Note**: Gemini Vision API documented as alternative (not implemented initially).

---

## Database Schema (From Scratch)

### Core Tables

```sql
-- Users (extend existing or create)
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT CHECK (role IN ('RECRUITER', 'CANDIDATE')),
  auth_provider TEXT,
  created_at TIMESTAMP
)

-- Roles (Job Positions)
roles (
  id UUID PRIMARY KEY,
  recruiter_id UUID → users(id),
  title TEXT NOT NULL,
  jd_file_url TEXT,
  requirements JSONB, -- extracted/edited by recruiter
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, CLOSED
  created_at TIMESTAMP
)

-- Requirements JSONB Structure:
{
  required_skills: ['React', 'Node.js'],
  preferred_skills: ['GraphQL'],
  experience: {min: 3, max: 5, unit: 'years'},
  responsibilities: ['Build APIs', 'Write tests'],
  qualifications: ['CS Degree or equivalent']
}

-- Invitations (Role-bound links)
invitations (
  id UUID PRIMARY KEY,
  role_id UUID → roles(id),
  token TEXT UNIQUE NOT NULL, -- unique invite link token
  status TEXT DEFAULT 'ACTIVE', -- ACTIVE, USED, EXPIRED
  max_uses INTEGER DEFAULT NULL, -- null = unlimited
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP DEFAULT NULL,
  created_at TIMESTAMP
)

-- Candidates
candidates (
  id UUID PRIMARY KEY,
  invitation_id UUID → invitations(id),
  role_id UUID → roles(id),
  email TEXT NOT NULL,
  resume_file_url TEXT,
  profile JSONB, -- extracted from resume
  status TEXT DEFAULT 'INVITED', -- INVITED, IN_PROGRESS, SUBMITTED, SHORTLISTED, REJECTED
  created_at TIMESTAMP,
  UNIQUE(email, role_id)
)

-- Profile JSONB Structure:
{
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  skills: ['React', 'TypeScript'],
  experience: [
    {company: 'TechCorp', role: 'Frontend Dev', duration: '2020-2023', description: '...'}
  ],
  education: [{degree: 'BS CS', institution: 'MIT', year: '2020'}],
  total_experience_years: 4
}

-- Quizzes (Candidate-specific, immutable)
quizzes (
  id UUID PRIMARY KEY,
  candidate_id UUID → candidates(id) UNIQUE, -- one quiz per candidate
  role_id UUID → roles(id),
  questions JSONB NOT NULL,
  metadata JSONB, -- generation context, difficulty, skill distribution
  generated_at TIMESTAMP,
  UNIQUE(candidate_id) -- enforce one quiz per candidate
)

-- Questions JSONB Structure:
[
  {
    id: 'q1',
    question: 'What is React Fiber?',
    options: ['A', 'B', 'C', 'D'],
    correct_index: 0,
    skill: 'React',
    difficulty: 'medium',
    type: 'mcq' -- mcq, subjective (future), code (future)
  }
]

-- Attempts (single per candidate)
attempts (
  id UUID PRIMARY KEY,
  candidate_id UUID → candidates(id) UNIQUE, -- single attempt
  quiz_id UUID → quizzes(id),
  started_at TIMESTAMP,
  submitted_at TIMESTAMP,
  time_allocated INTEGER, -- seconds
  responses JSONB,
  proctoring_flags JSONB DEFAULT '[]',
  status TEXT DEFAULT 'IN_PROGRESS' -- IN_PROGRESS, SUBMITTED, TERMINATED
)

-- Responses JSONB Structure:
[
  {
    question_id: 'q1',
    selected_index: 0,
    time_spent: 45 -- seconds
  }
]

-- Proctoring Flags:
[
  {type: 'tab_switch', timestamp: '2024-01-15T10:23:45Z', duration: 12},
  {type: 'fullscreen_exit', timestamp: '2024-01-15T10:25:10Z'}
]

-- Evaluations (auto-generated after submission)
evaluations (
  id UUID PRIMARY KEY,
  attempt_id UUID → attempts(id) UNIQUE,
  candidate_id UUID → candidates(id),
  score DECIMAL(5,2) NOT NULL, -- 0-100
  skill_breakdown JSONB, -- {React: 80, Node.js: 70}
  confidence_score DECIMAL(5,2), -- based on proctoring flags
  anomaly_indicators JSONB DEFAULT '[]',
  evaluated_at TIMESTAMP
)

-- Anomaly Indicators:
[
  {type: 'suspiciously_fast', question_ids: ['q3', 'q7'], severity: 'low'},
  {type: 'pattern_anomaly', description: 'all correct in last 30s', severity: 'high'}
]
```

### Key Schema Decisions

1. **No Organizations (for now)**: Simplify to recruiter → roles → candidates. Multi-tenancy can be added later.
2. **Invitation-based**: No candidate accounts until they accept invite.
3. **One Quiz per Candidate**: Enforced via UNIQUE constraint on `quizzes.candidate_id`.
4. **Single Attempt**: Enforced via UNIQUE constraint on `attempts.candidate_id`.
5. **Immutability**: Quizzes and attempts are never updated after creation.
6. **JSONB for Flexibility**: Requirements, profiles, questions stored as JSON for easy iteration.

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

### Phase 1: Core Infrastructure (Week 1)
- PostgreSQL database schema setup
- Auth with RBAC (recruiter/candidate roles)
- Basic UI scaffolding (recruiter/candidate dashboards)
- Client-side file upload UI (PDFs not persisted)

### Phase 2: Document Intelligence (Week 2)
- pdf.js integration (client-side PDF text extraction)
- Ollama Cloud API integration
- JD extraction (pdf.js → raw text → Ollama → structured JSON)
- Editable review UI for recruiters
- Resume extraction (pdf.js → raw text → Ollama → structured JSON, direct to DB)
- JSON response parsing and validation

### Phase 3: Quiz Generation (Week 3)
- Context-aware prompt engineering for tough questions
- Quiz generation via Ollama Cloud (same API as extraction)
- Quiz JSON parsing and validation
- Quiz storage and immutability enforcement

### Phase 4: Assessment & Proctoring (Week 4)
- Adapt existing quiz UI for candidate flow
- Invitation link system
- Single-attempt enforcement
- Proctoring flag collection

### Phase 5: Evaluation & Dashboard (Week 5)
- Auto-evaluation engine (MCQ scoring)
- Skill breakdown calculation
- Confidence scoring + anomaly detection
- Recruiter dashboard (list, detail, comparison)

### Phase 6: Polish & Launch (Week 6)
- Email notifications (invite, submission)
- Onboarding flows
- Error handling and edge cases
- Security audit (RLS policies, file access controls)

---

## API Endpoints

### Recruiter APIs
```
POST   /api/role                          Create role
POST   /api/role/:id/jd-upload            Upload & extract JD
PUT    /api/role/:id/requirements         Update requirements (manual edit)
POST   /api/role/:id/invite               Generate invite link
GET    /api/role/:id/candidates           List candidates
GET    /api/candidate/:id                 Candidate details
POST   /api/candidate/:id/shortlist       Shortlist action
POST   /api/candidate/:id/reject          Reject action
GET    /api/dashboard/:roleId             Dashboard data
```

### Candidate APIs
```
GET    /api/invite/:token                 Validate invite, get role details
POST   /api/invite/:token/resume          Upload resume & extract profile
GET    /api/candidate/quiz                Get generated quiz (after resume)
POST   /api/quiz/start                    Start attempt (log start time)
POST   /api/quiz/submit                   Submit responses + proctoring flags
```

### Shared
```
POST   /api/auth/[...all]                 OAuth (Google)
GET    /api/user/me                       Current user profile
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

### Data Storage
- PostgreSQL with row-level security (RLS)
- Only structured JSON persisted (no PDF files stored)
- Data scoped to user/role (RLS policies)

### Data Privacy
- Encrypt PII in JSONB fields (email, phone) at rest
- No persistent storage of raw uploaded files (only parsed data)
- GDPR-compliant deletion (cascade delete on user)

### RLS Policies
```sql
-- Recruiters see only their roles and candidates
CREATE POLICY recruiter_access ON candidates
  FOR SELECT USING (
    role_id IN (SELECT id FROM roles WHERE recruiter_id = auth.uid())
  );

-- Candidates see only their own data
CREATE POLICY candidate_self_access ON candidates
  FOR SELECT USING (email = auth.email());
```

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

### Why Candidate-Specific Quizzes?
- **Fairness**: Adaptive difficulty based on experience
- **Security**: No question leakage between candidates
- **Relevance**: Tests claimed skills vs role needs
- **Comparison**: All assessed against same requirements, different execution

### Why pdf.js + Ollama Cloud?
- **Zero Extraction Cost**: pdf.js runs in browser, no server costs
- **No File Storage**: Client-side processing, PDFs never persisted
- **Single AI Provider**: Ollama Cloud for all LLM operations (simpler)
- **Privacy**: Raw documents never leave client or stored on server
- **Fast**: pdf.js is instant, Ollama Cloud responses are quick
- **MVP-Friendly**: Start with PDFs, add OCR later if needed

### Why Prompt Engineering Over Algorithmic Distribution?
- **Simplicity**: Let the LLM (Ollama) handle question difficulty naturally
- **Flexibility**: Easy to adjust toughness by tweaking prompt keywords
- **Quality**: LLMs understand "tough" and "rigorous" semantically
- **Less Code**: No complex skill-matching or gap-analysis algorithms
- **Maintainable**: Prompt iteration is faster than code changes

### Why No Organizations in MVP?
- **Simplicity**: Single recruiter workflow first
- **Faster MVP**: Reduce schema complexity
- **Easy Addition**: Can add later without migration pain

### Why PostgreSQL?
- **JSONB Support**: Flexible schema for requirements, profiles, questions
- **RLS (Row-Level Security)**: Built-in multi-tenant data isolation
- **Performance**: Efficient indexing for skill matching and filtering
- **Ecosystem**: Works with any client library (Prisma, Drizzle, etc.)

---

## Success Metrics

### Technical
- JD/Resume extraction accuracy: >85%
- Quiz generation time: <30s
- Evaluation processing: <5s
- Dashboard load time: <2s

### Business
- Recruiter time saved: 50% reduction in initial screening
- Candidate completion rate: >70%
- False positive rate: <20% (shortlisted but rejected post-interview)

---

## Next Steps

1. **Finalize Database Schema**: Review and approve table structures (PostgreSQL)
2. **Set up Ollama Cloud API**: Configure API key for gpt-oss:120b-cloud model
3. **Test pdf.js Integration**: Verify client-side PDF text extraction works
4. **Design UI Mockups**: Recruiter dashboard, candidate flow screens
5. **Phase 1 Kickoff**: Auth + DB + PDF Upload UI implementation

---

## Summary

This repurposing transforms QuizMe into a **recruiter-centric hiring pipeline** with:

✅ **Candidate-Specific Tough Quizzes** at the conjunction of Role + Resume
✅ **Single AI Provider** (Ollama Cloud for all LLM operations)
✅ **Client-Side PDF Processing** (pdf.js, no file storage costs)
✅ **Recruiter-Editable Requirements** (manual review after extraction)
✅ **Immutable, Auditable Assessments** (single attempt per candidate)
✅ **Reused Proctoring Infrastructure** (full-screen, tab detection)
✅ **Auto-Evaluation with Skill Breakdown**
✅ **Actionable Recruiter Dashboard** (compare, shortlist, insights)
✅ **PostgreSQL with JSONB** (flexible schema, RLS for security)
✅ **Rigorous Assessment via Prompt Engineering** (tough technical questions)
✅ **Scalable Schema** (ready for subjective/code questions)
✅ **No File Storage** (PDFs processed and discarded, only structured data persisted)

**The Core Innovation**: Quiz generation happens AFTER candidate applies, creating truly adaptive, rigorous assessments that test technical depth. Questions are tailored to be challenging based on role requirements and candidate background.

**Technical Simplicity**: pdf.js (browser) → raw text → Ollama Cloud → structured JSON → PostgreSQL. Single AI provider, no file storage, client-side processing.
