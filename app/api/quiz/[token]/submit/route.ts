import { NextRequest, NextResponse } from "next/server";
import {
  getQuizForSubmit,
  getQuizForEvaluation,
  submitQuiz,
  insertQuizResult,
  getQuizResultByQuizId,
  updateQuizResultEvaluated,
  getQuizProctoringEvents,
} from "@/lib/db";
import { getProctoringVerdict } from "@/lib/quiz-helpers";

/**
 * POST /api/quiz/[token]/submit
 * Mark quiz as completed and trigger evaluation
 * Answers are already saved via individual answer API
 * Uses optimistic locking to prevent race conditions
 * No authentication required - public endpoint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    const { timedOut = false, version } = body as {
      timedOut?: boolean;
      version: number;
    };

    // Validate token
    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Validate version for optimistic locking
    if (version === undefined || version === null) {
      return NextResponse.json(
        { error: "Missing required field: version" },
        { status: 400 }
      );
    }

    // Fetch quiz with answers
    const quiz = await getQuizForSubmit(token);

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Check if quiz is already completed
    if (quiz.status === "SUBMITTED" || quiz.status === "TERMINATED") {
      return NextResponse.json(
        { error: "Quiz already submitted" },
        { status: 410 }
      );
    }

    // Check if quiz is in progress
    if (quiz.status !== "IN_PROGRESS") {
      return NextResponse.json(
        { error: "Quiz not started. Please start the quiz first." },
        { status: 400 }
      );
    }

    // Submit quiz with optimistic locking
    const updateResult = await submitQuiz(quiz.id, version);

    // If no rows updated, version mismatch - concurrent modification
    if (updateResult.count === 0) {
      // Check current state
      const currentQuiz = await getQuizForSubmit(token);
      if (currentQuiz?.status === "SUBMITTED" || currentQuiz?.status === "TERMINATED") {
        return NextResponse.json(
          { error: "Quiz already submitted" },
          { status: 410 }
        );
      }
      return NextResponse.json(
        { error: "Concurrent modification detected. Please try again." },
        { status: 409 }
      );
    }

    // Create QuizResult record
    let quizResult;
    try {
      quizResult = await insertQuizResult(quiz.id);
    } catch (error: unknown) {
      // Handle race condition - result might already exist
      if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
        quizResult = await getQuizResultByQuizId(quiz.id);
        if (!quizResult) {
          throw new Error("Failed to create or retrieve quiz result");
        }
      } else {
        throw error;
      }
    }

    // Trigger evaluation asynchronously (don't wait for it)
    triggerEvaluation(quiz.id, quizResult.id).catch((error) => {
      console.error("Background evaluation failed:", error);
    });

    return NextResponse.json({
      success: true,
      message: "Quiz submitted successfully",
      quizId: quiz.id,
      submittedAt: new Date(),
      timedOut,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to submit quiz",
      },
      { status: 500 }
    );
  }
}

/**
 * Trigger evaluation engine asynchronously
 * This function runs in the background and doesn't block the response
 */
async function triggerEvaluation(quizId: string, resultId: string) {
  try {
    // Fetch quiz with all data needed for evaluation
    const quiz = await getQuizForEvaluation(quizId);

    if (!quiz) {
      throw new Error("Quiz not found during evaluation");
    }

    // Parse questions to separate STANDARD vs RESUME_VERIFICATION
    const questions = quiz.questions as Array<{
      id: string;
      type: "STANDARD" | "RESUME_VERIFICATION";
      correctAnswer: number;
      [key: string]: unknown;
    }>;

    const standardQuestions = questions.filter((q) => q.type === "STANDARD");
    const verificationQuestions = questions.filter(
      (q) => q.type === "RESUME_VERIFICATION"
    );

    // Calculate Standard Score (70% questions) - Used for ranking
    let standardCorrect = 0;
    const standardTotal = standardQuestions.length;

    standardQuestions.forEach((question) => {
      const answer = quiz.answers.find((a) => a.questionId === question.id);
      if (answer?.isCorrect) {
        standardCorrect++;
      }
    });

    // Calculate Verification (30% questions) - Fraud detection
    let verificationCorrect = 0;
    const verificationTotal = verificationQuestions.length;

    verificationQuestions.forEach((question) => {
      const answer = quiz.answers.find((a) => a.questionId === question.id);
      if (answer?.isCorrect) {
        verificationCorrect++;
      }
    });

    // Get proctoring events and compute verdict
    const proctoringEvents = await getQuizProctoringEvents(quizId);
    const { verdict: proctoringVerdict, violationCount: proctoringViolationCount } =
      getProctoringVerdict(proctoringEvents);

    // Update QuizResult with evaluation scores and proctoring verdict
    await updateQuizResultEvaluated(resultId, {
      standardCorrect,
      standardTotal,
      verificationCorrect,
      verificationTotal,
      proctoringVerdict,
      proctoringViolationCount,
    });

    console.log(`Quiz ${quizId} evaluated successfully:`, {
      standardCorrect,
      standardTotal,
      verificationCorrect,
      verificationTotal,
      proctoringVerdict,
      proctoringViolationCount,
    });
  } catch (error) {
    console.error("Error during evaluation:", error);
    throw error;
  }
}
