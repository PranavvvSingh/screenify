import type { QuizStatus } from "@prisma/client";
import { PROCTORING_SESSION_GAP_MS } from "./constants";

/**
 * Verification status thresholds and types
 */
export type VerificationStatus = "VERIFIED" | "QUESTIONABLE" | "DISCREPANCY";

/**
 * Effective quiz status (includes runtime-computed states)
 * - EXPIRED: Link expired before candidate started (PENDING + expiresAt < now)
 * - TIMED_OUT: Started but ran out of time without submitting (IN_PROGRESS + startedAt + duration < now)
 */
export type EffectiveQuizStatus = QuizStatus | "EXPIRED" | "TIMED_OUT";

/**
 * Calculate verification status from correct/total counts
 * >= 80% → VERIFIED
 * 50-79% → QUESTIONABLE
 * < 50% → DISCREPANCY
 */
export function getVerificationStatus(
  correct: number,
  total: number
): VerificationStatus | null {
  if (total === 0) return null;

  const rate = correct / total;

  if (rate >= 0.8) return "VERIFIED";
  if (rate >= 0.5) return "QUESTIONABLE";
  return "DISCREPANCY";
}

/**
 * Calculate standard score as percentage
 * Returns (correct / total) * 100
 */
export function getStandardScore(correct: number, total: number): number {
  if (total === 0) return 0;
  return (correct / total) * 100;
}

/**
 * Get the effective quiz status, including runtime-computed states
 *
 * Logic:
 * - If status === PENDING && expiresAt && now > expiresAt → EXPIRED (link expired before start)
 * - If status === IN_PROGRESS && now > startedAt + duration → TIMED_OUT (started but ran out of time)
 * - Otherwise return stored status
 */
export function getEffectiveQuizStatus(quiz: {
  status: QuizStatus;
  expiresAt: Date | null;
  startedAt: Date | null;
  duration: number; // in seconds
}): EffectiveQuizStatus {
  const now = new Date();

  // Check if link expired before candidate started
  if (quiz.status === "PENDING" && quiz.expiresAt && now > quiz.expiresAt) {
    return "EXPIRED";
  }

  // Check if quiz timed out while in progress (started but didn't submit before time ran out)
  if (quiz.status === "IN_PROGRESS" && quiz.startedAt) {
    const endTime = new Date(quiz.startedAt.getTime() + quiz.duration * 1000);
    if (now > endTime) {
      return "TIMED_OUT";
    }
  }

  return quiz.status;
}

/**
 * Check if a quiz can still accept answers
 * Returns true if quiz is IN_PROGRESS and not expired
 */
export function canAcceptAnswers(quiz: {
  status: QuizStatus;
  expiresAt: Date | null;
  startedAt: Date | null;
  duration: number;
}): boolean {
  const effectiveStatus = getEffectiveQuizStatus(quiz);
  return effectiveStatus === "IN_PROGRESS";
}

/**
 * Check if a quiz can be started
 * Returns true if quiz is PENDING and not expired
 */
export function canStartQuiz(quiz: {
  status: QuizStatus;
  expiresAt: Date | null;
  startedAt: Date | null;
  duration: number;
}): boolean {
  const effectiveStatus = getEffectiveQuizStatus(quiz);
  return effectiveStatus === "PENDING";
}

/**
 * Calculate remaining time for an in-progress quiz
 * Returns remaining seconds, or 0 if expired/not started
 */
export function getRemainingTime(quiz: {
  status: QuizStatus;
  startedAt: Date | null;
  duration: number;
}): number {
  if (quiz.status !== "IN_PROGRESS" || !quiz.startedAt) {
    return 0;
  }

  const now = new Date();
  const endTime = new Date(quiz.startedAt.getTime() + quiz.duration * 1000);
  const remaining = Math.floor((endTime.getTime() - now.getTime()) / 1000);

  return Math.max(0, remaining);
}

/**
 * Proctoring verdict type
 */
export type ProctoringVerdictType = "CLEAN" | "SUSPICIOUS" | "CHEATING";

/**
 * Proctoring verdict thresholds (evaluated at submission)
 * CLEAN: 0-2 total violations
 * SUSPICIOUS: 3-5 total violations
 * CHEATING: >5 total violations
 */
const PROCTORING_THRESHOLDS = {
  SUSPICIOUS: 3,
  CHEATING: 6,
} as const;

/**
 * Calculate proctoring verdict from events array
 *
 * Uses session-based scoring:
 * - Events within PROCTORING_SESSION_GAP_MS of each other are grouped into one "away session"
 * - Each away session counts as 1 violation (not N raw events)
 * - MULTIPLE_DISPLAYS events always count individually (not session-grouped)
 *
 * This prevents inflated violation counts when a single "leave and return"
 * action triggers multiple rapid events (e.g., WINDOW_BLUR + TAB_SWITCH + FULLSCREEN_EXIT)
 */
export function getProctoringVerdict(events: { type: string; timestamp: string }[]): {
  verdict: ProctoringVerdictType;
  violationCount: number;
} {
  if (!events || events.length === 0) {
    return { verdict: "CLEAN", violationCount: 0 };
  }

  // MULTIPLE_DISPLAYS is a persistent state detection, not a "leave and return" pattern
  // Count these separately and don't group them into sessions
  const displayEvents = events.filter((e) => e.type === "MULTIPLE_DISPLAYS");
  const otherEvents = events.filter((e) => e.type !== "MULTIPLE_DISPLAYS");

  // Sort non-display events by timestamp
  const sorted = [...otherEvents].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Count "away sessions" - groups of events within SESSION_GAP_MS of each other
  let sessionCount = 0;
  let lastEventTime: number | null = null;

  for (const event of sorted) {
    const eventTime = new Date(event.timestamp).getTime();

    // If this is the first event OR gap since last event exceeds threshold, it's a new session
    if (lastEventTime === null || eventTime - lastEventTime > PROCTORING_SESSION_GAP_MS) {
      sessionCount++;
    }

    lastEventTime = eventTime;
  }

  // Total violations = away sessions + display detections
  const violationCount = sessionCount + displayEvents.length;

  if (violationCount >= PROCTORING_THRESHOLDS.CHEATING) {
    return { verdict: "CHEATING", violationCount };
  }

  if (violationCount >= PROCTORING_THRESHOLDS.SUSPICIOUS) {
    return { verdict: "SUSPICIOUS", violationCount };
  }

  return { verdict: "CLEAN", violationCount };
}
