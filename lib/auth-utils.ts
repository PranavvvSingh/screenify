import { auth } from "./auth";
import { prisma } from "./prisma";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getServerSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session;
}

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    redirect("/");
  }
  return session;
}

export async function requireRecruiter() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { recruiter: true },
  });

  if (!user?.recruiter) {
    // Don't redirect to candidate - user might not have that role either
    redirect("/");
  }

  return { session, recruiter: user.recruiter };
}

// Note: Candidate authentication removed - candidates access quizzes via unique token links (no user account)

/**
 * API Route version of requireRecruiter - throws error instead of redirecting
 * Use this in API routes (route handlers) instead of requireRecruiter()
 */
export async function requireRecruiterAPI() {
  const session = await getServerSession();

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { recruiter: true },
  });

  if (!user?.recruiter) {
    throw new Error("FORBIDDEN");
  }

  return { session, recruiter: user.recruiter };
}

export async function getUserRole(userId: string): Promise<"recruiter" | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { recruiter: true },
  });

  if (!user) return null;
  if (user.recruiter) return "recruiter";
  return null;
}
