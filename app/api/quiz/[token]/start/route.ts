import { NextRequest, NextResponse } from "next/server";
import { getQuizForStart, startQuiz } from "@/lib/db";
import { getEffectiveQuizStatus, getRemainingTime } from "@/lib/quiz-helpers";

/**
 * POST /api/quiz/[token]/start
 * Initialize quiz session and return quiz questions
 * Updates Quiz status to IN_PROGRESS and sets startedAt timestamp
 * No authentication required - public endpoint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    // Validate token format
    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Fetch quiz with questions
    const quiz = await getQuizForStart(token);

    // Check if quiz exists
    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
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

    // Check if quiz is already completed
    if (effectiveStatus === "SUBMITTED" || effectiveStatus === "TERMINATED") {
      return NextResponse.json(
        { error: "Quiz already completed" },
        { status: 410 }
      );
    }

    // Check if quiz link has expired before starting
    if (effectiveStatus === "EXPIRED") {
      return NextResponse.json(
        { error: "Quiz link has expired" },
        { status: 410 }
      );
    }

    // Check if quiz has already been started (IN_PROGRESS)
    if (quiz.status === "IN_PROGRESS" && quiz.startedAt) {
      // Quiz already started, return existing session with remaining time
      const remainingTime = getRemainingTime({
        status: quiz.status,
        startedAt: quiz.startedAt,
        duration: quiz.duration,
      });

      return NextResponse.json({
        success: true,
        quizId: quiz.id,
        questions: quiz.questions,
        duration: quiz.duration,
        startedAt: quiz.startedAt,
        remainingTime,
        version: quiz.version,
        alreadyStarted: true,
      });
    }

    // Start the quiz - update status to IN_PROGRESS
    const updatedQuiz = await startQuiz(quiz.id);

    // Return quiz data with questions
    // Note: Questions are shuffled during quiz creation, so we return them as-is
    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      questions: quiz.questions,
      duration: quiz.duration,
      startedAt: updatedQuiz.startedAt,
      remainingTime: quiz.duration, // Full duration since just started
      version: updatedQuiz.version,
      alreadyStarted: false,
    });
  } catch (error) {
    console.error("Error starting quiz:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to start quiz",
      },
      { status: 500 }
    );
  }
}
