import { prisma } from "@/lib/prisma";

/**
 * Get user with recruiter relation
 */
export async function getUserWithRecruiter(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { recruiter: true },
  });
}
