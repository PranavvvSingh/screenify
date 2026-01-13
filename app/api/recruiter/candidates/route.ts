import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRecruiterByUserId, getQuizzesByRecruiter } from "@/lib/db";

export async function GET(request: NextRequest) {
	try {
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

		// Get query parameters for filtering and sorting
		const { searchParams } = new URL(request.url);
		const status = searchParams.get("status"); // ALL, IN_PROGRESS, SUBMITTED, EVALUATED
		const verificationStatus = searchParams.get("verificationStatus"); // ALL, VERIFIED, QUESTIONABLE, DISCREPANCY
		const minScore = searchParams.get("minScore");
		const maxScore = searchParams.get("maxScore");
		const sortBy = searchParams.get("sortBy") || "standardScore"; // standardScore, submittedAt, candidateName
		const sortOrder = searchParams.get("sortOrder") || "desc"; // asc, desc

		// Fetch all quizzes for recruiter's roles with results
		const quizzes = await getQuizzesByRecruiter(recruiter.id, {
			status: status || undefined,
			sortBy,
			sortOrder: sortOrder as "asc" | "desc"
		});

		// Filter and map the results
		let filteredQuizzes = quizzes.filter((quiz) => {
			// Filter by quiz result status if provided
			if (status && status !== "ALL") {
				if (!quiz.result) return status === "IN_PROGRESS";
				if (quiz.result.status !== status) return false;
			}

			// Filter by verification status if provided
			if (verificationStatus && verificationStatus !== "ALL") {
				if (!quiz.result?.verificationStatus) return false;
				if (quiz.result.verificationStatus !== verificationStatus) return false;
			}

			// Filter by score range if provided
			if (minScore || maxScore) {
				const score = quiz.result?.standardScore;
				if (score === null || score === undefined) return false;
				if (minScore && score < parseFloat(minScore)) return false;
				if (maxScore && score > parseFloat(maxScore)) return false;
			}

			return true;
		});

		// Sort by standardScore if needed (can't do in Prisma query due to relation)
		if (sortBy === "standardScore") {
			filteredQuizzes.sort((a, b) => {
				const scoreA = a.result?.standardScore ?? -1;
				const scoreB = b.result?.standardScore ?? -1;
				return sortOrder === "desc" ? scoreB - scoreA : scoreA - scoreB;
			});
		}

		// Format the response
		const candidates = filteredQuizzes.map((quiz) => ({
			id: quiz.id,
			name: quiz.candidateName,
			email: quiz.candidateEmail,
			role: {
				id: quiz.jobRole.id,
				title: quiz.jobRole.title
			},
			standardScore: quiz.result?.standardScore ?? null,
			verificationStatus: quiz.result?.verificationStatus ?? null,
			confidenceScore: quiz.result?.confidenceScore ?? null,
			status: quiz.result?.status ?? (quiz.completed ? "SUBMITTED" : "IN_PROGRESS"),
			submittedAt: quiz.result?.submittedAt ?? null,
			createdAt: quiz.createdAt
		}));

		return NextResponse.json({
			candidates,
			total: candidates.length
		});
	} catch (error) {
		console.error("Error fetching candidates:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
