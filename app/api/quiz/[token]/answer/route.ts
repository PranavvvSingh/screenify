import { NextRequest, NextResponse } from "next/server";
import { getQuizForAnswer, upsertQuizAnswerWithLock } from "@/lib/db";
import { canAcceptAnswers } from "@/lib/quiz-helpers";

/**
 * POST /api/quiz/[token]/answer
 * Save individual answer as candidate progresses through quiz
 * Updates existing answer if question already answered (allows changing answers)
 * Uses optimistic locking to prevent race conditions with quiz submission
 * No authentication required - public endpoint
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
	try {
		const { token } = await params;
		const body = await request.json();

		const { questionId, answer, timeTaken, version } = body;
		console.log("Submitting answer: ", { questionId, answer, timeTaken, version });

		// Validate input
		if (!questionId || answer === undefined || answer === null) {
			return NextResponse.json({ error: "Missing required fields: questionId, answer" }, { status: 400 });
		}

		// Validate version is provided for optimistic locking
		if (version === undefined || version === null) {
			return NextResponse.json({ error: "Missing required field: version" }, { status: 400 });
		}

		// Validate token
		if (!token || token.length < 10) {
			return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
		}

		// Fetch quiz to validate and get question details
		const quiz = await getQuizForAnswer(token);

		if (!quiz) {
			return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
		}

		// Check if quiz can accept answers (IN_PROGRESS and not expired)
		if (
			!canAcceptAnswers({
				status: quiz.status,
				expiresAt: null, // expiresAt only affects starting, not in-progress quizzes
				startedAt: quiz.startedAt,
				duration: quiz.duration
			})
		) {
			return NextResponse.json({ error: "Quiz is not active. Cannot submit answers." }, { status: 410 });
		}

		// Validate question exists in quiz
		const questions = quiz.questions as Array<{
			id: string;
			correctAnswer: number;
			[key: string]: unknown;
		}>;
		const question = questions.find((q) => q.id === questionId);

		if (!question) {
			return NextResponse.json({ error: "Question not found in quiz" }, { status: 404 });
		}

		// Check if answer is correct
		const isCorrect = question.correctAnswer === answer;

		// Upsert answer with optimistic locking
		const result = await upsertQuizAnswerWithLock({
			quizId: quiz.id,
			questionId,
			answer: answer.toString(),
			isCorrect,
			timeTaken: timeTaken || 0,
			currentVersion: version
		});

		// If result is null, version mismatch - quiz was submitted or terminated
		if (!result) {
			return NextResponse.json(
				{
					error: "Quiz has ended. Answer not saved.",
					quizEnded: true
				},
				{ status: 409 } // Conflict
			);
		}

		return NextResponse.json({
			success: true,
			answerId: result.answer.id,
			version: result.newVersion
			// Note: isCorrect removed to prevent answer leakage
		});
	} catch (error) {
		console.error("Error saving answer:", error);

		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Failed to save answer"
			},
			{ status: 500 }
		);
	}
}
