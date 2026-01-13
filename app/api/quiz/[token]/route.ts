import { NextRequest, NextResponse } from "next/server";
import { getQuizByToken } from "@/lib/db";

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

    // Check if quiz is already completed
    if (quiz.completed) {
      return NextResponse.json(
        {
          error: "Quiz already completed",
          completed: true,
          submittedAt: quiz.result?.submittedAt,
        },
        { status: 410 } // 410 Gone - resource no longer available
      );
    }

    // Calculate question count from stored questions
    const questions = quiz.questions as Array<{ id: string; question: string }>;
    const questionCount = questions?.length || 0;

    // Calculate estimated time (duration is in minutes)
    const estimatedTimeMinutes = quiz.duration;

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
