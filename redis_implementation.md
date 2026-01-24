# Redis Implementation Plan

## Overview

Redis will be used for two primary purposes:
1. **Active Quiz Session State** - Fast validation layer for quiz operations
2. **Proctoring Events Buffer** - Accumulate events before batch-writing to DB

---

## 1. Active Quiz Session State

### Purpose
Reduce database load during active quizzes by caching session validation data in Redis.

### Key Structure
```
Key:   quiz:session:{token}
TTL:   quiz.duration + 300 seconds (5 min buffer)
Value: JSON
```

### Schema
```typescript
interface QuizSession {
  quizId: string;
  startedAt: number;        // Unix timestamp ms
  expiresAt: number;        // Unix timestamp ms
  questionIds: string[];    // Valid question IDs for this quiz
  completed: boolean;
}
```

### Lifecycle

| Event | Action |
|-------|--------|
| Quiz starts (`/api/quiz/[token]/start`) | `SET quiz:session:{token} {data} EX {ttl}` |
| Answer submitted (`/api/quiz/[token]/answer`) | `GET quiz:session:{token}` for validation |
| Quiz submitted (`/api/quiz/[token]/submit`) | `DEL quiz:session:{token}` |
| TTL expires | Auto-deleted by Redis |

### Validation Flow (Answer Submission)
```
1. GET quiz:session:{token}
2. If missing → Fall back to DB query
3. If exists:
   - Check: completed === false
   - Check: Date.now() < expiresAt
   - Check: questionId in questionIds[]
4. If all pass → Proceed to DB write
5. If any fail → Return error (no DB hit)
```

### Relationship with DB Locking
Redis and DB optimistic locking are **complementary layers**:

| Layer | Purpose | Guarantee |
|-------|---------|-----------|
| Redis | Fast validation, reduce DB load | Best-effort (may be stale by ms) |
| DB `completed` flag | Block answers after submission | Authoritative |
| DB `version` field | Handle concurrent submissions | Race condition safety |

Redis blocks 99% of invalid requests early. DB ensures correctness for edge cases.

---

## 2. Proctoring Events Buffer

### Purpose
Accumulate proctoring events (tab switches, fullscreen exits) in Redis during quiz, then batch-write to DB on submission.

### Key Structure
```
Key:   quiz:proctoring:{quizId}
TTL:   quiz.duration + 600 seconds (10 min buffer)
Type:  List (LPUSH)
```

### Event Schema
```typescript
interface ProctoringEvent {
  type: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'WINDOW_BLUR' | 'COPY_ATTEMPT' | 'MULTI_DISPLAY';
  timestamp: number;
  metadata?: Record<string, unknown>;
}
```

### Operations

| Event | Redis Command |
|-------|---------------|
| Proctoring violation detected | `LPUSH quiz:proctoring:{quizId} {event}` |
| Get all events (on submit) | `LRANGE quiz:proctoring:{quizId} 0 -1` |
| Cleanup after submit | `DEL quiz:proctoring:{quizId}` |

### Submission Flow
```typescript
// On quiz submit
const events = await redis.lrange(`quiz:proctoring:${quizId}`, 0, -1);
const proctoringMetadata = {
  events: events.map(JSON.parse),
  tabSwitches: events.filter(e => e.type === 'TAB_SWITCH').length,
  fullscreenExits: events.filter(e => e.type === 'FULLSCREEN_EXIT').length,
};

// Write to DB once
await prisma.quizResult.update({
  where: { id: resultId },
  data: { proctoringMetadata }
});

await redis.del(`quiz:proctoring:${quizId}`);
```

---

## Implementation Checklist

- [ ] Add Redis client (`ioredis` or `@upstash/redis`)
- [ ] Create `lib/redis.ts` with connection setup
- [ ] Modify `/api/quiz/[token]/start` - Create session in Redis
- [ ] Modify `/api/quiz/[token]/answer` - Validate against Redis first
- [ ] Modify `/api/quiz/[token]/submit` - Delete session, flush proctoring events
- [ ] Add proctoring event endpoint or modify existing
- [ ] Add Redis connection string to environment variables
- [ ] Add fallback to DB if Redis is unavailable

---

## Environment Variables

```env
REDIS_URL=redis://localhost:6379
# or for Upstash
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Failure Handling

If Redis is unavailable:
- **Session validation**: Fall back to existing DB queries (current behavior)
- **Proctoring events**: Write directly to DB or queue in memory

Redis is a performance optimization, not a hard dependency. The system must remain functional without it.
