import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getQuizzesByRole, type QuizFilters } from "@/lib/db";

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

		return NextResponse.json({
			quizzes: result.data,
			pagination: {
				page: result.page,
				total: result.total,
				totalPages: result.totalPages
			}
		});
	} catch (error) {
		console.error("Error fetching role candidates:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
