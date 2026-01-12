import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/quiz/[token]/submit
 * Mark quiz as completed and trigger evaluation
 * Answers are already saved via individual answer API
 * No authentication required - public endpoint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    const { timedOut = false } = body; // Flag to indicate if submission was due to timeout

    // Validate token
    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Fetch quiz with answers and result
    const quiz = await prisma.quiz.findUnique({
      where: { token },
      select: {
        id: true,
        completed: true,
        questions: true,
        answers: {
          select: {
            id: true,
            questionId: true,
            answer: true,
            isCorrect: true,
            timeTaken: true,
          },
        },
        result: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    // Check if quiz is already completed
    if (quiz.completed) {
      return NextResponse.json(
        { error: "Quiz already submitted" },
        { status: 410 }
      );
    }

    // Check if quiz result exists
    if (!quiz.result) {
      return NextResponse.json(
        { error: "Quiz not started. Please start the quiz first." },
        { status: 400 }
      );
    }

    // Mark quiz as completed
    await prisma.quiz.update({
      where: { id: quiz.id },
      data: {
        completed: true,
      },
    });

    // Update quiz result with submission time and status
    const submittedAt = new Date();
    await prisma.quizResult.update({
      where: { id: quiz.result.id },
      data: {
        submittedAt,
        status: "SUBMITTED",
        // Set dummy proctoring values as per Task 18 deferral
        proctoringMetadata: {},
        confidenceScore: 100,
        anomalyIndicators: [],
      },
    });

    // Trigger evaluation asynchronously (don't wait for it)
    // This prevents timeout issues and allows immediate response to candidate
    triggerEvaluation(quiz.id, quiz.result.id).catch((error) => {
      console.error("Background evaluation failed:", error);
      // Don't throw - evaluation can be retried later
    });

    return NextResponse.json({
      success: true,
      message: "Quiz submitted successfully",
      quizId: quiz.id,
      submittedAt,
      timedOut, // Pass through the timeout flag
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
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        questions: true,
        answers: {
          select: {
            questionId: true,
            answer: true,
            isCorrect: true,
            timeTaken: true,
          },
        },
      },
    });

    if (!quiz) {
      throw new Error("Quiz not found during evaluation");
    }

    // Parse questions to separate STANDARD vs RESUME_VERIFICATION
    const questions = quiz.questions as Array<{
      id: string;
      type: "STANDARD" | "RESUME_VERIFICATION";
      skill?: string;
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
    const skillScores: Record<string, { correct: number; total: number }> = {};

    standardQuestions.forEach((question) => {
      const answer = quiz.answers.find((a) => a.questionId === question.id);
      if (answer?.isCorrect) {
        standardCorrect++;

        // Track skill breakdown
        if (question.skill) {
          if (!skillScores[question.skill]) {
            skillScores[question.skill] = { correct: 0, total: 0 };
          }
          skillScores[question.skill].correct++;
        }
      }

      // Count total per skill
      if (question.skill) {
        if (!skillScores[question.skill]) {
          skillScores[question.skill] = { correct: 0, total: 0 };
        }
        skillScores[question.skill].total++;
      }
    });

    const standardScore =
      standardTotal > 0 ? (standardCorrect / standardTotal) * 100 : 0;

    // Calculate skill breakdown percentages
    const skillBreakdown: Record<string, number> = {};
    Object.entries(skillScores).forEach(([skill, scores]) => {
      skillBreakdown[skill] =
        scores.total > 0 ? (scores.correct / scores.total) * 100 : 0;
    });

    // Calculate Verification Status (30% questions) - Fraud detection
    let verificationCorrect = 0;
    const verificationTotal = verificationQuestions.length;

    verificationQuestions.forEach((question) => {
      const answer = quiz.answers.find((a) => a.questionId === question.id);
      if (answer?.isCorrect) {
        verificationCorrect++;
      }
    });

    // Determine verification status
    let verificationStatus: "VERIFIED" | "QUESTIONABLE" | "DISCREPANCY" =
      "VERIFIED";
    if (verificationTotal > 0) {
      const verificationRate = verificationCorrect / verificationTotal;
      if (verificationRate >= 0.8) {
        verificationStatus = "VERIFIED"; // ≥80% correct
      } else if (verificationRate >= 0.5) {
        verificationStatus = "QUESTIONABLE"; // 50-79% correct
      } else {
        verificationStatus = "DISCREPANCY"; // <50% correct
      }
    }

    // Update QuizResult with evaluation scores
    await prisma.quizResult.update({
      where: { id: resultId },
      data: {
        standardScore,
        standardCorrect,
        standardTotal,
        verificationStatus: verificationTotal > 0 ? verificationStatus : null,
        verificationCorrect,
        verificationTotal,
        skillBreakdown,
        status: "EVALUATED",
      },
    });

    console.log(`Quiz ${quizId} evaluated successfully:`, {
      standardScore,
      verificationStatus,
    });
  } catch (error) {
    console.error("Error during evaluation:", error);
    throw error;
  }
}
