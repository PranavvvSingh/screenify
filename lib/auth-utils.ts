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
    redirect("/candidate");
  }

  return { session, recruiter: user.recruiter };
}

export async function requireCandidate() {
  const session = await requireAuth();

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { candidate: true },
  });

  if (!user?.candidate) {
    redirect("/recruiter");
  }

  return { session, candidate: user.candidate };
}

export async function getUserRole(userId: string): Promise<"recruiter" | "candidate" | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { recruiter: true, candidate: true },
  });

  if (!user) return null;
  if (user.recruiter) return "recruiter";
  if (user.candidate) return "candidate";
  return null;
}
