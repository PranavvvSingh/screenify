import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRecruiterByUserId, getQuizById } from "@/lib/db";
import {
	getStandardScore,
	getVerificationStatus,
	getEffectiveQuizStatus,
} from "@/lib/quiz-helpers";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ quizId: string }> }
) {
	try {
		const { quizId } = await params;

		// Get authenticated user
		const session = await auth.api.getSession({
			headers: await headers()
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		// Get recruiter
		const recruiter = await getRecruiterByUserId(session.user.id);

		if (!recruiter) {
			return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
		}

		// Fetch quiz with all related data
		const quiz = await getQuizById(quizId);

		if (!quiz) {
			return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
		}

		// Verify the quiz belongs to this recruiter's role
		if (quiz.jobRole.recruiterId !== recruiter.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Parse questions to separate standard and verification questions
		const questions = quiz.questions as Array<{
			id: string;
			type: "STANDARD" | "RESUME_VERIFICATION";
			question: string;
			options: string[];
			correctAnswer: number;
		}>;
		const standardQuestions = questions.filter((q) => q.type === "STANDARD");
		const verificationQuestions = questions.filter((q) => q.type === "RESUME_VERIFICATION");

		// Map answers to questions for easy lookup
		const answersMap = new Map(
			quiz.answers.map((answer) => [answer.questionId, answer])
		);

		// Build verification details
		const verificationDetails = verificationQuestions.map((question) => {
			const answer = answersMap.get(question.id);
			const candidateAnswerIndex = answer ? parseInt(answer.answer) : null;

			return {
				questionId: question.id,
				question: question.question,
				options: question.options,
				correctAnswer: question.correctAnswer,
				candidateAnswer: candidateAnswerIndex,
				timeTaken: answer?.timeTaken || 0
			};
		});

		// Build standard questions details
		const standardDetails = standardQuestions.map((question) => {
			const answer = answersMap.get(question.id);
			const candidateAnswerIndex = answer ? parseInt(answer.answer) : null;

			return {
				questionId: question.id,
				question: question.question,
				options: question.options,
				correctAnswer: question.correctAnswer,
				candidateAnswer: candidateAnswerIndex,
				timeTaken: answer?.timeTaken || 0
			};
		});

		// Calculate time taken from Quiz fields
		let totalTimeTaken = 0;
		if (quiz.startedAt && quiz.endedAt) {
			totalTimeTaken = Math.floor(
				(new Date(quiz.endedAt).getTime() - new Date(quiz.startedAt).getTime()) / 1000
			);
		}

		// Parse proctoring events from Quiz model
		const proctoringEvents = (quiz.proctoringEvents as Array<{ type: string; timestamp: string }>) || [];

		// Get effective quiz status (includes computed EXPIRED)
		const effectiveStatus = getEffectiveQuizStatus({
			status: quiz.status,
			expiresAt: quiz.expiresAt,
			startedAt: quiz.startedAt,
			duration: quiz.duration,
		});

		// Compute derived values from result
		const standardScore = quiz.result
			? getStandardScore(quiz.result.standardCorrect, quiz.result.standardTotal)
			: null;

		const verificationStatus = quiz.result
			? getVerificationStatus(quiz.result.verificationCorrect, quiz.result.verificationTotal)
			: null;

		// Format the response
		const response = {
			id: quiz.id,
			candidateName: quiz.candidateName,
			candidateEmail: quiz.candidateEmail,
			candidateStatus: quiz.candidateStatus,
			role: {
				id: quiz.jobRole.id,
				title: quiz.jobRole.title,
				description: quiz.jobRole.description
			},
			duration: quiz.duration,
			status: effectiveStatus,
			createdAt: quiz.createdAt,
			startedAt: quiz.startedAt,
			endedAt: quiz.endedAt,
			result: quiz.result
				? {
						// Computed values
						standardScore,
						verificationStatus,
						// Raw counts
						standardCorrect: quiz.result.standardCorrect,
						standardTotal: quiz.result.standardTotal,
						verificationCorrect: quiz.result.verificationCorrect,
						verificationTotal: quiz.result.verificationTotal,
						// Proctoring verdict
						proctoringVerdict: quiz.result.proctoringVerdict,
						proctoringViolationCount: quiz.result.proctoringViolationCount,
						// Time taken
						timeTakenSeconds: totalTimeTaken
					}
				: null,
			standardDetails,
			verificationDetails,
			proctoringEvents,
			totalQuestions: questions.length,
			standardQuestionsCount: standardQuestions.length,
			verificationQuestionsCount: verificationQuestions.length
		};

		return NextResponse.json(response);
	} catch (error) {
		console.error("Error fetching quiz details:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
