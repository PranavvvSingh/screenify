import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// Type for proctoring events
export interface ProctoringEvent {
  type: "TAB_SWITCH" | "FULLSCREEN_EXIT" | "WINDOW_BLUR" | "MULTIPLE_DISPLAYS";
  timestamp: string;
}

// QUIZ QUERIES

/**
 * Get quiz by token for landing page (public)
 */
export async function getQuizByToken(token: string) {
  return prisma.quiz.findUnique({
    where: { token },
    select: {
      id: true,
      candidateName: true,
      candidateEmail: true,
      duration: true,
      status: true,
      expiresAt: true,
      startedAt: true,
      endedAt: true,
      createdAt: true,
      questions: true,
      jobRole: {
        select: {
          id: true,
          title: true,
          description: true,
          jd: true,
        },
      },
      result: {
        select: {
          id: true,
        },
      },
    },
  });
}

/**
 * Get quiz by token for starting quiz session
 */
export async function getQuizForStart(token: string) {
  return prisma.quiz.findUnique({
    where: { token },
    select: {
      id: true,
      candidateName: true,
      candidateEmail: true,
      duration: true,
      status: true,
      expiresAt: true,
      startedAt: true,
      questions: true,
      version: true,
      jobRole: {
        select: {
          title: true,
        },
      },
      result: {
        select: {
          id: true,
        },
      },
      answers: {
        select: {
          questionId: true,
          answer: true,
        },
      },
    },
  });
}

/**
 * Get quiz by token for saving answers
 */
export async function getQuizForAnswer(token: string) {
  return prisma.quiz.findUnique({
    where: { token },
    select: {
      id: true,
      status: true,
      startedAt: true,
      duration: true,
      version: true,
      questions: true,
    },
  });
}

/**
 * Get quiz by token for submission
 */
export async function getQuizForSubmit(token: string) {
  return prisma.quiz.findUnique({
    where: { token },
    select: {
      id: true,
      status: true,
      startedAt: true,
      duration: true,
      version: true,
      questions: true,
      answers: {
        select: {
          id: true,
          questionId: true,
          answer: true,
          isCorrect: true,
          timeTaken: true,
        },
      },
      result: {
        select: {
          id: true,
        },
      },
    },
  });
}

/**
 * Get quiz by ID for evaluation
 */
export async function getQuizForEvaluation(quizId: string) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      questions: true,
      answers: {
        select: {
          questionId: true,
          answer: true,
          isCorrect: true,
          timeTaken: true,
        },
      },
    },
  });
}

/**
 * Get quiz by ID with full details for recruiter view
 */
export async function getQuizById(quizId: string) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      id: true,
      candidateName: true,
      candidateEmail: true,
      candidateStatus: true,
      questions: true,
      duration: true,
      status: true,
      startedAt: true,
      endedAt: true,
      expiresAt: true,
      proctoringEvents: true,
      createdAt: true,
      jobRole: {
        select: {
          id: true,
          title: true,
          description: true,
          recruiterId: true,
        },
      },
      result: {
        select: {
          id: true,
          standardCorrect: true,
          standardTotal: true,
          verificationCorrect: true,
          verificationTotal: true,
          proctoringVerdict: true,
          proctoringViolationCount: true,
        },
      },
      answers: {
        select: {
          questionId: true,
          answer: true,
          timeTaken: true,
        },
        orderBy: {
          submittedAt: "asc",
        },
      },
    },
  });
}

/**
 * Get quiz with ownership info for status updates
 */
export async function getQuizWithOwnership(quizId: string) {
  return prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      jobRole: {
        select: {
          recruiterId: true,
        },
      },
    },
  });
}

/**
 * Check if candidate already exists for a role
 */
export async function getQuizByCandidate(roleId: string, candidateEmail: string) {
  return prisma.quiz.findFirst({
    where: {
      jobRoleId: roleId,
      candidateEmail,
    },
  });
}

/**
 * Create a new quiz for a candidate
 */
export async function insertQuiz(data: {
  jobRoleId: string;
  candidateName: string;
  candidateEmail: string;
  questions: Prisma.InputJsonValue[];
  duration: number;
  expiresAt?: Date;
}) {
  return prisma.quiz.create({
    data: {
      jobRoleId: data.jobRoleId,
      candidateName: data.candidateName,
      candidateEmail: data.candidateEmail,
      questions: data.questions,
      duration: data.duration,
      expiresAt: data.expiresAt,
      status: "PENDING",
    },
  });
}

/**
 * Start a quiz - update status to IN_PROGRESS and set startedAt
 */
export async function startQuiz(quizId: string) {
  return prisma.quiz.update({
    where: { id: quizId },
    data: {
      status: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });
}

/**
 * Submit a quiz - update status to SUBMITTED and set endedAt
 * Uses optimistic locking with version check
 */
export async function submitQuiz(quizId: string, currentVersion: number) {
  return prisma.quiz.updateMany({
    where: {
      id: quizId,
      status: "IN_PROGRESS",
      version: currentVersion
    },
    data: {
      status: "SUBMITTED",
      endedAt: new Date(),
      version: { increment: 1 },
    },
  });
}

/**
 * Append a proctoring event to a quiz's event log
 * Only works if quiz is in progress
 */
export async function appendProctoringEvent(
  token: string,
  event: ProctoringEvent
) {
  // First get the quiz to check status and get current events
  const quiz = await prisma.quiz.findUnique({
    where: { token },
    select: {
      id: true,
      status: true,
      proctoringEvents: true,
    },
  });

  if (!quiz || quiz.status !== "IN_PROGRESS") {
    return null;
  }

  // Append event to existing array
  const currentEvents = (quiz.proctoringEvents as unknown as ProctoringEvent[]) || [];
  const updatedEvents = [...currentEvents, event];

  return prisma.quiz.update({
    where: { id: quiz.id },
    data: {
      proctoringEvents: updatedEvents as unknown as Prisma.InputJsonValue,
    },
  });
}

/**
 * Update candidate status (PENDING, SHORTLISTED, REJECTED)
 */
export async function updateQuizCandidateStatus(
  quizId: string,
  status: "PENDING" | "SHORTLISTED" | "REJECTED"
) {
  return prisma.quiz.update({
    where: { id: quizId },
    data: {
      candidateStatus: status,
    },
  });
}

// QUIZ RESULT QUERIES

/**
 * Create quiz result with initial values (all zeros)
 * Called when quiz is submitted, before evaluation
 */
export async function insertQuizResult(quizId: string) {
  return prisma.quizResult.create({
    data: {
      quizId,
      standardCorrect: 0,
      standardTotal: 0,
      verificationCorrect: 0,
      verificationTotal: 0,
    },
  });
}

/**
 * Get quiz result by quiz ID (for race condition handling)
 */
export async function getQuizResultByQuizId(quizId: string) {
  return prisma.quizResult.findUnique({
    where: { quizId },
  });
}

/**
 * Update quiz result with evaluation scores and proctoring verdict
 */
export async function updateQuizResultEvaluated(
  resultId: string,
  data: {
    standardCorrect: number;
    standardTotal: number;
    verificationCorrect: number;
    verificationTotal: number;
    proctoringVerdict: "CLEAN" | "SUSPICIOUS" | "CHEATING";
    proctoringViolationCount: number;
  }
) {
  return prisma.quizResult.update({
    where: { id: resultId },
    data,
  });
}

// ============================================================================
// QUIZ ANSWER QUERIES
// ============================================================================

/**
 * Upsert (insert or update) a quiz answer with optimistic locking
 * Uses a transaction to increment quiz version and upsert the answer atomically
 * Returns null if version mismatch (quiz already ended)
 */
export async function upsertQuizAnswerWithLock(data: {
  quizId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeTaken: number;
  currentVersion: number;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // First, try to increment version (fails if version doesn't match or quiz not IN_PROGRESS)
      const updateResult = await tx.quiz.updateMany({
        where: {
          id: data.quizId,
          status: "IN_PROGRESS",
          version: data.currentVersion,
        },
        data: {
          version: { increment: 1 },
        },
      });

      // If no rows updated, version mismatch or quiz ended
      if (updateResult.count === 0) {
        return null;
      }

      // Version matched, upsert the answer
      const answer = await tx.quizAnswer.upsert({
        where: {
          quizId_questionId: {
            quizId: data.quizId,
            questionId: data.questionId,
          },
        },
        update: {
          answer: data.answer,
          isCorrect: data.isCorrect,
          timeTaken: data.timeTaken,
          submittedAt: new Date(),
        },
        create: {
          quizId: data.quizId,
          questionId: data.questionId,
          answer: data.answer,
          isCorrect: data.isCorrect,
          timeTaken: data.timeTaken,
          submittedAt: new Date(),
        },
      });

      return { answer, newVersion: data.currentVersion + 1 };
    });

    return result;
  } catch {
    // Transaction failed
    return null;
  }
}

/**
 * Simple upsert without locking (for backward compatibility or testing)
 */
export async function upsertQuizAnswer(data: {
  quizId: string;
  questionId: string;
  answer: string;
  isCorrect: boolean;
  timeTaken: number;
}) {
  return prisma.quizAnswer.upsert({
    where: {
      quizId_questionId: {
        quizId: data.quizId,
        questionId: data.questionId,
      },
    },
    update: {
      answer: data.answer,
      isCorrect: data.isCorrect,
      timeTaken: data.timeTaken,
      submittedAt: new Date(),
    },
    create: {
      quizId: data.quizId,
      questionId: data.questionId,
      answer: data.answer,
      isCorrect: data.isCorrect,
      timeTaken: data.timeTaken,
      submittedAt: new Date(),
    },
  });
}

/**
 * Get proctoring events for a quiz
 */
export async function getQuizProctoringEvents(quizId: string) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    select: {
      proctoringEvents: true,
    },
  });
  return (quiz?.proctoringEvents as unknown as ProctoringEvent[]) || [];
}
