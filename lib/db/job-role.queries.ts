import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

/**
 * Get job role by ID with base questions (for adding candidates)
 */
export async function getJobRoleById(roleId: string) {
  return prisma.jobRole.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      recruiterId: true,
      baseQuestions: true,
      totalQuestions: true,
    },
  });
}

/**
 * Get job role details (for role detail page header/stats)
 */
export async function getJobRoleWithStats(roleId: string) {
  const role = await prisma.jobRole.findUnique({
    where: { id: roleId },
    select: {
      id: true,
      title: true,
      description: true,
      jd: true,
      _count: {
        select: { quizzes: true },
      },
    },
  });

  if (!role) return null;

  // Get completed count (SUBMITTED or TERMINATED status)
  const completedCount = await prisma.quiz.count({
    where: {
      jobRoleId: roleId,
      status: { in: ["SUBMITTED", "TERMINATED"] },
    },
  });

  // Get average score from QuizResult - compute from standardCorrect/standardTotal
  const results = await prisma.quizResult.findMany({
    where: { quiz: { jobRoleId: roleId } },
    select: { standardCorrect: true, standardTotal: true },
  });

  let avgScore: number | null = null;
  if (results.length > 0) {
    const totalScore = results.reduce((acc, r) => {
      if (r.standardTotal > 0) {
        return acc + (r.standardCorrect / r.standardTotal) * 100;
      }
      return acc;
    }, 0);
    avgScore = totalScore / results.length;
  }

  return {
    ...role,
    totalCandidates: role._count.quizzes,
    completedAssessments: completedCount,
    avgScore,
  };
}

/**
 * Filter options for getQuizzesByRole
 */
export interface QuizFilters {
  search?: string;
  quizStatus?: "pending" | "in_progress" | "completed";
  candidateStatus?: "PENDING" | "SHORTLISTED" | "REJECTED";
  verificationStatus?: "VERIFIED" | "QUESTIONABLE" | "DISCREPANCY";
  addedAfter?: Date;
  addedBefore?: Date;
  sortBy?: "score" | "createdAt" | "completedAt" | "name";
  sortOrder?: "asc" | "desc";
}

/**
 * Get paginated quizzes for a role with filters and sorting
 * Note: verificationStatus filter requires post-filtering since it's computed at runtime
 */
export async function getQuizzesByRole(
  roleId: string,
  page: number = 1,
  filters: QuizFilters = {}
) {
  const pageSize = 10;

  // Build where clause
  const where: Prisma.QuizWhereInput = { jobRoleId: roleId };

  // Search filter (name or email)
  if (filters.search) {
    where.OR = [
      { candidateName: { contains: filters.search, mode: "insensitive" } },
      { candidateEmail: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  // Quiz status filter - now using Quiz.status enum
  if (filters.quizStatus) {
    if (filters.quizStatus === "pending") {
      where.status = "PENDING";
    } else if (filters.quizStatus === "in_progress") {
      where.status = "IN_PROGRESS";
    } else if (filters.quizStatus === "completed") {
      where.status = { in: ["SUBMITTED", "TERMINATED"] };
    }
  }

  // Candidate status filter
  if (filters.candidateStatus) {
    where.candidateStatus = filters.candidateStatus;
  }

  // Note: verificationStatus filter is handled after fetching since it's computed

  // Date range filters
  if (filters.addedAfter || filters.addedBefore) {
    where.createdAt = {};
    if (filters.addedAfter) {
      where.createdAt.gte = filters.addedAfter;
    }
    if (filters.addedBefore) {
      where.createdAt.lte = filters.addedBefore;
    }
  }

  // Build orderBy clause
  let orderBy: Prisma.QuizOrderByWithRelationInput = { createdAt: "desc" };
  const sortOrder = filters.sortOrder || "desc";

  if (filters.sortBy) {
    switch (filters.sortBy) {
      case "score":
        // Sort by standardCorrect (descending by default shows highest first)
        orderBy = { result: { standardCorrect: sortOrder } };
        break;
      case "createdAt":
        orderBy = { createdAt: sortOrder };
        break;
      case "completedAt":
        orderBy = { endedAt: sortOrder };
        break;
      case "name":
        orderBy = { candidateName: sortOrder };
        break;
    }
  }

  const [quizzes, total] = await prisma.$transaction([
    prisma.quiz.findMany({
      where,
      select: {
        id: true,
        candidateName: true,
        candidateEmail: true,
        candidateStatus: true,
        token: true,
        status: true,
        expiresAt: true,
        startedAt: true,
        duration: true,
        endedAt: true,
        createdAt: true,
        result: {
          select: {
            standardCorrect: true,
            standardTotal: true,
            verificationCorrect: true,
            verificationTotal: true,
          },
        },
      },
      orderBy,
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.quiz.count({ where }),
  ]);

  return {
    data: quizzes,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get all job roles with quizzes (for dashboard stats)
 */
export async function getJobRolesWithQuizzes() {
  return prisma.jobRole.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      jd: true,
      quizzes: {
        select: {
          id: true,
          status: true,
          result: {
            select: {
              standardCorrect: true,
              standardTotal: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

/**
 * Filter options for getJobRolesPaginated
 */
export interface RoleFilters {
  search?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Get paginated job roles with search and sorting
 */
export async function getJobRolesPaginated(
  page: number = 1,
  filters: RoleFilters = {}
) {
  const pageSize = 10;

  // Build where clause
  const where: Prisma.JobRoleWhereInput = {};

  // Search filter (title only)
  if (filters.search) {
    where.title = { contains: filters.search, mode: "insensitive" };
  }

  // Sort by createdAt
  const sortOrder = filters.sortOrder || "desc";
  const orderBy: Prisma.JobRoleOrderByWithRelationInput = { createdAt: sortOrder };

  const [roles, total] = await prisma.$transaction([
    prisma.jobRole.findMany({
      where,
      select: {
        id: true,
        title: true,
        description: true,
        jd: true,
        createdAt: true,
        quizzes: {
          select: {
            id: true,
            status: true,
            result: {
              select: {
                standardCorrect: true,
                standardTotal: true,
              },
            },
          },
        },
      },
      orderBy,
      take: pageSize,
      skip: (page - 1) * pageSize,
    }),
    prisma.jobRole.count({ where }),
  ]);

  return {
    data: roles,
    total,
    page,
    totalPages: Math.ceil(total / pageSize),
  };
}

/**
 * Get dashboard stats (total roles, candidates, pending reviews)
 */
export async function getDashboardStats() {
  const [totalRoles, totalCandidates, pendingReviews] = await prisma.$transaction([
    prisma.jobRole.count(),
    prisma.quiz.count(),
    // Pending reviews: completed quizzes (SUBMITTED/TERMINATED) with PENDING candidateStatus
    prisma.quiz.count({
      where: {
        status: { in: ["SUBMITTED", "TERMINATED"] },
        candidateStatus: "PENDING",
      }
    })
  ]);

  return {
    totalRoles,
    totalCandidates,
    pendingReviews,
  };
}

/**
 * Create a new job role
 */
export async function insertJobRole(data: {
  title: string;
  description: string;
  recruiterId: string;
  jd: Prisma.InputJsonValue;
  baseQuestions: Prisma.InputJsonValue;
  totalQuestions: number;
}) {
  return prisma.jobRole.create({
    data,
  });
}
