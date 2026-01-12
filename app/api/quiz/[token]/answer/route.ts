import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/quiz/[token]/answer
 * Save individual answer as candidate progresses through quiz
 * Updates existing answer if question already answered (allows changing answers)
 * No authentication required - public endpoint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    const { questionId, answer, timeTaken } = body;

    // Validate input
    if (!questionId || answer === undefined || answer === null) {
      return NextResponse.json(
        { error: "Missing required fields: questionId, answer" },
        { status: 400 }
      );
    }

    // Validate token
    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Fetch quiz to validate and get question details
    const quiz = await prisma.quiz.findUnique({
      where: { token },
      select: {
        id: true,
        completed: true,
        questions: true,
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
        { error: "Quiz already completed. Cannot update answers." },
        { status: 410 }
      );
    }

    // Validate question exists in quiz
    const questions = quiz.questions as Array<{
      id: string;
      correctAnswer: number;
      [key: string]: unknown;
    }>;
    const question = questions.find((q) => q.id === questionId);

    if (!question) {
      return NextResponse.json(
        { error: "Question not found in quiz" },
        { status: 404 }
      );
    }

    // Check if answer is correct
    const isCorrect = question.correctAnswer === answer;

    // Upsert answer (create or update if already exists)
    const quizAnswer = await prisma.quizAnswer.upsert({
      where: {
        quizId_questionId: {
          quizId: quiz.id,
          questionId,
        },
      },
      update: {
        answer: answer.toString(),
        isCorrect,
        timeTaken: timeTaken || 0,
        submittedAt: new Date(),
      },
      create: {
        quizId: quiz.id,
        questionId,
        answer: answer.toString(),
        isCorrect,
        timeTaken: timeTaken || 0,
        submittedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      answerId: quizAnswer.id,
      isCorrect, // Optional: can be removed if you don't want to reveal correctness
    });
  } catch (error) {
    console.error("Error saving answer:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to save answer",
      },
      { status: 500 }
    );
  }
}
