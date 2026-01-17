import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getQuizzesByRole, type QuizFilters } from "@/lib/db";
import { getStandardScore, getVerificationStatus } from "@/lib/quiz-helpers";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ roleId: string }> }
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers()
		});

		if (!session?.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { roleId } = await params;
		const { searchParams } = new URL(request.url);

		// Parse pagination
		const page = parseInt(searchParams.get("page") || "1", 10);

		// Parse filters
		const filters: QuizFilters = {};

		const search = searchParams.get("search");
		if (search) filters.search = search;

		const quizStatus = searchParams.get("quizStatus");
		if (quizStatus && ["pending", "in_progress", "completed"].includes(quizStatus)) {
			filters.quizStatus = quizStatus as QuizFilters["quizStatus"];
		}

		const candidateStatus = searchParams.get("candidateStatus");
		if (candidateStatus && ["PENDING", "SHORTLISTED", "REJECTED"].includes(candidateStatus)) {
			filters.candidateStatus = candidateStatus as QuizFilters["candidateStatus"];
		}

		const verificationStatus = searchParams.get("verificationStatus");
		if (verificationStatus && ["VERIFIED", "QUESTIONABLE", "DISCREPANCY"].includes(verificationStatus)) {
			filters.verificationStatus = verificationStatus as QuizFilters["verificationStatus"];
		}

		const addedAfter = searchParams.get("addedAfter");
		if (addedAfter) {
			const date = new Date(addedAfter);
			if (!isNaN(date.getTime())) filters.addedAfter = date;
		}

		const addedBefore = searchParams.get("addedBefore");
		if (addedBefore) {
			const date = new Date(addedBefore);
			if (!isNaN(date.getTime())) filters.addedBefore = date;
		}

		// Parse sorting
		const sortBy = searchParams.get("sortBy");
		if (sortBy && ["score", "createdAt", "completedAt", "name"].includes(sortBy)) {
			filters.sortBy = sortBy as QuizFilters["sortBy"];
		}

		const sortOrder = searchParams.get("sortOrder");
		if (sortOrder && ["asc", "desc"].includes(sortOrder)) {
			filters.sortOrder = sortOrder as QuizFilters["sortOrder"];
		}

		const result = await getQuizzesByRole(roleId, page, filters);

		// Transform data to match frontend expected format
		const quizzes = result.data.map((quiz) => {
			// Compute standardScore and verificationStatus from raw counts
			const standardScore = quiz.result
				? getStandardScore(quiz.result.standardCorrect, quiz.result.standardTotal)
				: null;

			const computedVerificationStatus = quiz.result
				? getVerificationStatus(quiz.result.verificationCorrect, quiz.result.verificationTotal)
				: null;

			return {
				id: quiz.id,
				candidateName: quiz.candidateName,
				candidateEmail: quiz.candidateEmail,
				candidateStatus: quiz.candidateStatus,
				token: quiz.token,
				status: quiz.status,
				createdAt: quiz.createdAt,
				result: quiz.result
					? {
							standardScore,
							verificationStatus: computedVerificationStatus,
							submittedAt: quiz.endedAt,
						}
					: null,
			};
		});

		// Post-filter by verificationStatus if specified (since it's computed)
		let filteredQuizzes = quizzes;
		if (filters.verificationStatus) {
			filteredQuizzes = quizzes.filter(
				(q) => q.result?.verificationStatus === filters.verificationStatus
			);
		}

		return NextResponse.json({
			quizzes: filteredQuizzes,
			pagination: {
				page: result.page,
				total: filters.verificationStatus ? filteredQuizzes.length : result.total,
				totalPages: result.totalPages
			}
		});
	} catch (error) {
		console.error("Error fetching role candidates:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
