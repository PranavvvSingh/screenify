import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/auth";
import { prisma } from "./lib/prisma";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/api/auth", "/invite"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // Role-based routing
  if (session) {
    // Check if user is recruiter or candidate
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        recruiter: { select: { id: true } },
        candidate: { select: { id: true } },
      },
    });

    const isRecruiter = !!user?.recruiter;
    const isCandidate = !!user?.candidate;

    // Recruiter trying to access candidate routes
    if (isRecruiter && pathname.startsWith("/candidate")) {
      const url = new URL("/recruiter", request.url);
      return NextResponse.redirect(url);
    }

    // Candidate trying to access recruiter routes
    if (isCandidate && pathname.startsWith("/recruiter")) {
      const url = new URL("/candidate", request.url);
      return NextResponse.redirect(url);
    }

    // If user has no role yet, redirect to landing page
    if (!isRecruiter && !isCandidate && !isPublicRoute) {
      const url = new URL("/", request.url);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
