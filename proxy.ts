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
  // Note: /candidate routes are also public (token-based access, no auth required)
  const publicRoutes = ["/", "/api/auth", "/api/auth-callback", "/invite", "/candidate"];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If not authenticated and trying to access protected route
  if (!session && !isPublicRoute) {
    const url = new URL("/", request.url);
    return NextResponse.redirect(url);
  }

  // Role-based routing (only for authenticated users)
  // Note: Only recruiters have user accounts; candidates access via token links
  if (session) {
    // Check if user is recruiter
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        recruiter: { select: { id: true } },
      },
    });

    const isRecruiter = !!user?.recruiter;

    // If user has no role yet and not on auth callback, redirect to auth callback
    if (!isRecruiter && pathname !== "/api/auth-callback" && !isPublicRoute) {
      const url = new URL("/api/auth-callback", request.url);
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
