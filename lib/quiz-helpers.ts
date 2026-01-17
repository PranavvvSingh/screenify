import type { QuizStatus } from "@prisma/client";

/**
 * Verification status thresholds and types
 */
export type VerificationStatus = "VERIFIED" | "QUESTIONABLE" | "DISCREPANCY";

/**
 * Effective quiz status (includes computed EXPIRED state)
 */
export type EffectiveQuizStatus = QuizStatus | "EXPIRED";

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
 * Get the effective quiz status, including computed EXPIRED state
 *
 * Logic:
 * - If status === PENDING && expiresAt && now > expiresAt → EXPIRED (link expired before start)
 * - If status === IN_PROGRESS && now > startedAt + duration → EXPIRED (time ran out)
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

  // Check if quiz timed out while in progress
  if (quiz.status === "IN_PROGRESS" && quiz.startedAt) {
    const endTime = new Date(quiz.startedAt.getTime() + quiz.duration * 1000);
    if (now > endTime) {
      return "EXPIRED";
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
 * Proctoring status thresholds
 */
const PROCTORING_THRESHOLDS = {
  SUSPICIOUS: { tabSwitches: 3, fullscreenExits: 2 },
  FLAGGED: { tabSwitches: 5, fullscreenExits: 4 },
} as const;

/**
 * Calculate proctoring status from metadata
 * CLEAN: Below suspicious thresholds
 * SUSPICIOUS: Exceeds suspicious but not flagged thresholds
 * FLAGGED: Exceeds flagged thresholds
 */
export function getProctoringStatus(metadata: {
  tabSwitches?: number;
  fullscreenExits?: number;
} | null): "CLEAN" | "SUSPICIOUS" | "FLAGGED" {
  if (!metadata) return "CLEAN";

  const tabSwitches = metadata.tabSwitches || 0;
  const fullscreenExits = metadata.fullscreenExits || 0;

  // Check for FLAGGED first
  if (
    tabSwitches >= PROCTORING_THRESHOLDS.FLAGGED.tabSwitches ||
    fullscreenExits >= PROCTORING_THRESHOLDS.FLAGGED.fullscreenExits
  ) {
    return "FLAGGED";
  }

  // Check for SUSPICIOUS
  if (
    tabSwitches >= PROCTORING_THRESHOLDS.SUSPICIOUS.tabSwitches ||
    fullscreenExits >= PROCTORING_THRESHOLDS.SUSPICIOUS.fullscreenExits
  ) {
    return "SUSPICIOUS";
  }

  return "CLEAN";
}
