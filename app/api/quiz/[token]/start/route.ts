import { NextRequest, NextResponse } from "next/server";
import { getQuizForStart, insertQuizResult, getQuizResultByQuizId } from "@/lib/db";

/**
 * POST /api/quiz/[token]/start
 * Initialize quiz session and return quiz questions
 * Creates QuizResult record with startedAt timestamp
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

    // Check if quiz is already completed
    if (quiz.completed) {
      return NextResponse.json(
        { error: "Quiz already completed" },
        { status: 410 }
      );
    }

    // Check if quiz has already been started
    if (quiz.result) {
      // Quiz already started, return existing session
      return NextResponse.json({
        success: true,
        quizId: quiz.id,
        resultId: quiz.result.id,
        questions: quiz.questions,
        duration: quiz.duration,
        startedAt: quiz.result.startedAt,
        alreadyStarted: true,
      });
    }

    // Create or get existing QuizResult to mark quiz as started
    // Handle race conditions by catching unique constraint violations
    let quizResult;
    try {
      quizResult = await insertQuizResult(quiz.id);
    } catch (error: unknown) {
      // If unique constraint failed, fetch the existing result
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        quizResult = await getQuizResultByQuizId(quiz.id);

        if (!quizResult) {
          throw new Error("Failed to create or retrieve quiz result");
        }
      } else {
        throw error;
      }
    }

    // Return quiz data with questions
    // Note: Questions are shuffled during quiz creation, so we return them as-is
    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      resultId: quizResult.id,
      questions: quiz.questions,
      duration: quiz.duration,
      startedAt: quizResult.startedAt,
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
