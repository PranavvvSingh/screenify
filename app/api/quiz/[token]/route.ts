import { NextRequest, NextResponse } from "next/server";
import { getQuizByToken } from "@/lib/db";
import { getEffectiveQuizStatus } from "@/lib/quiz-helpers";

/**
 * GET /api/quiz/[token]
 * Validate quiz token and return quiz information for the landing page
 * No authentication required - public endpoint
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validate token format (basic check)
    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Fetch quiz with related role information
    const quiz = await getQuizByToken(token);

    // Check if quiz exists
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found. Please check your link." },
        { status: 404 }
      );
    }

    // Get effective status (includes computed EXPIRED state)
    const effectiveStatus = getEffectiveQuizStatus({
      status: quiz.status,
      expiresAt: quiz.expiresAt,
      startedAt: quiz.startedAt,
      duration: quiz.duration,
    });

    // Check if quiz is already completed or expired
    if (effectiveStatus === "SUBMITTED" || effectiveStatus === "TERMINATED") {
      return NextResponse.json(
        {
          error: "Quiz already completed",
          completed: true,
          endedAt: quiz.endedAt,
        },
        { status: 410 } // 410 Gone - resource no longer available
      );
    }

    if (effectiveStatus === "EXPIRED") {
      return NextResponse.json(
        {
          error: "Quiz link has expired",
          expired: true,
        },
        { status: 410 }
      );
    }

    if (effectiveStatus === "TIMED_OUT") {
      return NextResponse.json(
        {
          error: "Quiz has timed out",
          timedOut: true,
        },
        { status: 410 }
      );
    }

    // Calculate question count from stored questions
    const questions = quiz.questions as Array<{ id: string; question: string }>;
    const questionCount = questions?.length || 0;

    // Duration is stored in seconds, convert to minutes for display
    const estimatedTimeMinutes = Math.ceil(quiz.duration / 60);

    // Extract skills from JD
    const jd = quiz.jobRole.jd as { required_skills?: string[]; preferred_skills?: string[] };
    const requiredSkills = jd.required_skills || [];
    const preferredSkills = jd.preferred_skills || [];

    // Return quiz information
    return NextResponse.json({
      success: true,
      quiz: {
        id: quiz.id,
        candidateName: quiz.candidateName,
        status: effectiveStatus,
        expiresAt: quiz.expiresAt?.toISOString() || null,
        role: {
          title: quiz.jobRole.title,
          description: quiz.jobRole.description,
          requiredSkills,
          preferredSkills,
        },
        questionCount,
        estimatedTimeMinutes,
      },
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch quiz information",
      },
      { status: 500 }
    );
  }
}
