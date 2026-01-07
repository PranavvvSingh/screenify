import { auth } from "./auth";
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
  if ((session.user as any).role !== "RECRUITER") {
    redirect("/candidate");
  }
  return session;
}

export async function requireCandidate() {
  const session = await requireAuth();
  if ((session.user as any).role !== "CANDIDATE") {
    redirect("/recruiter");
  }
  return session;
}
