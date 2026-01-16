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

  // Get completed count
  const completedCount = await prisma.quiz.count({
    where: { jobRoleId: roleId, completed: true },
  });

  // Get average score from QuizResult table
  const avgScoreResult = await prisma.quizResult.aggregate({
    where: { quiz: { jobRoleId: roleId } },
    _avg: { standardScore: true },
  });

  return {
    ...role,
    totalCandidates: role._count.quizzes,
    completedAssessments: completedCount,
    avgScore: avgScoreResult._avg.standardScore,
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

  // Quiz status filter
  if (filters.quizStatus) {
    if (filters.quizStatus === "pending") {
      where.completed = false;
      where.result = { is: null };
    } else if (filters.quizStatus === "in_progress") {
      where.completed = false;
      where.result = { status: "IN_PROGRESS" };
    } else if (filters.quizStatus === "completed") {
      where.completed = true;
    }
  }

  // Candidate status filter
  if (filters.candidateStatus) {
    where.candidateStatus = filters.candidateStatus;
  }

  // Verification status filter
  if (filters.verificationStatus) {
    where.result = {
      ...((where.result as Prisma.QuizResultWhereInput) || {}),
      verificationStatus: filters.verificationStatus,
    };
  }

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
        orderBy = { result: { standardScore: sortOrder } };
        break;
      case "createdAt":
        orderBy = { createdAt: sortOrder };
        break;
      case "completedAt":
        orderBy = { result: { submittedAt: sortOrder } };
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
        completed: true,
        createdAt: true,
        result: {
          select: {
            standardScore: true,
            verificationStatus: true,
            status: true,
            submittedAt: true,
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
          completed: true,
          result: {
            select: {
              standardScore: true,
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
            completed: true,
            result: {
              select: {
                standardScore: true,
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
    prisma.quiz.count({
      where: {
        completed: true,
        OR: [
          { result: null },
          { result: { standardScore: null } }
        ]
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
