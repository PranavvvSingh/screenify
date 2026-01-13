import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRecruiterByUserId, getQuizById } from "@/lib/db";

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
		const questions = quiz.questions as any[];
		const standardQuestions = questions.filter((q) => q.type === "STANDARD");
		const verificationQuestions = questions.filter((q) => q.type === "RESUME_VERIFICATION");

		// Map answers to questions for easy lookup
		const answersMap = new Map(
			quiz.answers.map((answer) => [answer.questionId, answer])
		);

		// Build verification details
		const verificationDetails = verificationQuestions.map((question) => {
			const answer = answersMap.get(question.id);
			const correctAnswerIndex = question.correctAnswer ?? question.correct_answer;
			const candidateAnswerIndex = answer ? parseInt(answer.answer) : null;

			return {
				questionId: question.id,
				question: question.question,
				options: question.options,
				correctAnswer: correctAnswerIndex ?? null,
				candidateAnswer: candidateAnswerIndex,
				timeTaken: answer?.timeTaken || 0
			};
		});

		// Build standard questions details
		const standardDetails = standardQuestions.map((question) => {
			const answer = answersMap.get(question.id);
			const correctAnswerIndex = question.correctAnswer ?? question.correct_answer;
			const candidateAnswerIndex = answer ? parseInt(answer.answer) : null;

			return {
				questionId: question.id,
				question: question.question,
				options: question.options,
				skill: question.skill,
				correctAnswer: correctAnswerIndex ?? null,
				candidateAnswer: candidateAnswerIndex,
				timeTaken: answer?.timeTaken || 0
			};
		});

		// Build skill breakdown from answers
		const skillBreakdown = quiz.result?.skillBreakdown as Record<string, number> | null;

		// Calculate time taken
		let totalTimeTaken = 0;
		if (quiz.result?.startedAt && quiz.result?.submittedAt) {
			totalTimeTaken = Math.floor(
				(new Date(quiz.result.submittedAt).getTime() - new Date(quiz.result.startedAt).getTime()) / 1000
			);
		}

		// Parse proctoring metadata
		const proctoringMetadata = quiz.result?.proctoringMetadata as any;
		const proctoringEvents = {
			tabSwitches: proctoringMetadata?.tabSwitches || 0,
			fullscreenExits: proctoringMetadata?.fullscreenExits || 0,
			events: proctoringMetadata?.events || []
		};

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
			completed: quiz.completed,
			createdAt: quiz.createdAt,
			result: quiz.result
				? {
						standardScore: quiz.result.standardScore,
						standardCorrect: quiz.result.standardCorrect,
						standardTotal: quiz.result.standardTotal,
						verificationStatus: quiz.result.verificationStatus,
						verificationCorrect: quiz.result.verificationCorrect,
						verificationTotal: quiz.result.verificationTotal,
						skillBreakdown,
						confidenceScore: quiz.result.confidenceScore,
						anomalyIndicators: quiz.result.anomalyIndicators,
						status: quiz.result.status,
						startedAt: quiz.result.startedAt,
						submittedAt: quiz.result.submittedAt,
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
