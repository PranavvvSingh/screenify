import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

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
      completed: true,
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
          status: true,
          submittedAt: true,
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
      completed: true,
      questions: true,
      jobRole: {
        select: {
          title: true,
        },
      },
      result: {
        select: {
          id: true,
          status: true,
          startedAt: true,
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
      completed: true,
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
      completed: true,
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
          status: true,
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
    include: {
      jobRole: {
        select: {
          id: true,
          title: true,
          description: true,
          recruiterId: true,
        },
      },
      result: true,
      answers: {
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
 * Get all quizzes for a recruiter with filtering/sorting
 */
export async function getQuizzesByRecruiter(
  recruiterId: string,
  options?: {
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }
) {
  const { status, sortBy = "standardScore", sortOrder = "desc" } = options || {};

  return prisma.quiz.findMany({
    where: {
      jobRole: {
        recruiterId,
      },
      ...(status &&
        status !== "ALL" && {
          completed: status === "IN_PROGRESS" ? false : true,
        }),
    },
    include: {
      jobRole: {
        select: {
          id: true,
          title: true,
          description: true,
        },
      },
      result: true,
    },
    orderBy:
      sortBy === "candidateName"
        ? { candidateName: sortOrder }
        : sortBy === "submittedAt"
          ? { createdAt: sortOrder }
          : undefined,
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
}) {
  return prisma.quiz.create({
    data: {
      ...data,
      completed: false,
    },
  });
}

/**
 * Mark quiz as completed
 */
export async function updateQuizCompleted(quizId: string) {
  return prisma.quiz.update({
    where: { id: quizId },
    data: {
      completed: true,
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
 * Create quiz result when quiz starts
 */
export async function insertQuizResult(quizId: string) {
  return prisma.quizResult.create({
    data: {
      quizId,
      status: "IN_PROGRESS",
      startedAt: new Date(),
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
 * Update quiz result on submission
 */
export async function updateQuizResultSubmitted(resultId: string) {
  return prisma.quizResult.update({
    where: { id: resultId },
    data: {
      submittedAt: new Date(),
      status: "SUBMITTED",
      proctoringMetadata: {},
      confidenceScore: 100,
      anomalyIndicators: [],
    },
  });
}

/**
 * Update quiz result with evaluation scores
 */
export async function updateQuizResultEvaluated(
  resultId: string,
  data: {
    standardScore: number;
    standardCorrect: number;
    standardTotal: number;
    verificationStatus: "VERIFIED" | "QUESTIONABLE" | "DISCREPANCY" | null;
    verificationCorrect: number;
    verificationTotal: number;
    skillBreakdown: Record<string, number>;
  }
) {
  return prisma.quizResult.update({
    where: { id: resultId },
    data: {
      ...data,
      status: "EVALUATED",
    },
  });
}

// ============================================================================
// QUIZ ANSWER QUERIES
// ============================================================================

/**
 * Upsert (insert or update) a quiz answer
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
