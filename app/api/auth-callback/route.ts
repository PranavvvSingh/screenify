import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getUserWithRecruiter, insertRecruiter } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    console.log("[AUTH CALLBACK] Processing auth callback for user:", session?.user?.email);

    if (!session) {
      // No session, redirect to landing page
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if user already has a recruiter record
    const user = await getUserWithRecruiter(session.user.id);

    // If user already has a recruiter role, redirect to recruiter dashboard
    if (user?.recruiter) {
      return NextResponse.redirect(new URL("/recruiter", request.url));
    }

    // User has no role yet - create recruiter record automatically
    // Note: Only recruiters have user accounts (candidates access via token links)
    await insertRecruiter(session.user.id);

    // Redirect to recruiter dashboard
    return NextResponse.redirect(new URL("/recruiter", request.url));
  } catch (error) {
    console.error("Error in auth callback:", error);
    // On error, redirect to landing page
    return NextResponse.redirect(new URL("/", request.url));
  }
}
