import { prisma } from "@/lib/prisma";

/**
 * Get recruiter by user ID
 */
export async function getRecruiterByUserId(userId: string) {
  return prisma.recruiter.findUnique({
    where: { userId },
  });
}

/**
 * Create a new recruiter record
 */
export async function insertRecruiter(userId: string) {
  return prisma.recruiter.create({
    data: {
      userId,
    },
  });
}
