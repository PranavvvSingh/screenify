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
 * Get job role with quizzes (for role detail page)
 */
export async function getJobRoleWithQuizzes(roleId: string) {
  return prisma.jobRole.findUnique({
    where: { id: roleId },
    include: {
      quizzes: {
        include: {
          result: true,
        },
      },
    },
  });
}

/**
 * Get all job roles with quizzes (for dashboard)
 */
export async function getJobRolesWithQuizzes() {
  return prisma.jobRole.findMany({
    include: {
      quizzes: {
        include: {
          result: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
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
