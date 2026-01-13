import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getRecruiterByUserId, getQuizWithOwnership, updateQuizCandidateStatus } from "@/lib/db";

export async function PATCH(
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

		// Parse request body
		const body = await request.json();
		const { status } = body;

		// Validate status
		if (!status || !["PENDING", "SHORTLISTED", "REJECTED"].includes(status)) {
			return NextResponse.json(
				{ error: "Invalid status. Must be PENDING, SHORTLISTED, or REJECTED" },
				{ status: 400 }
			);
		}

		// Fetch quiz to verify ownership
		const quiz = await getQuizWithOwnership(quizId);

		if (!quiz) {
			return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
		}

		// Verify the quiz belongs to this recruiter's role
		if (quiz.jobRole.recruiterId !== recruiter.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Update candidate status
		const updatedQuiz = await updateQuizCandidateStatus(quizId, status);

		return NextResponse.json({
			success: true,
			candidateStatus: updatedQuiz.candidateStatus
		});
	} catch (error) {
		console.error("Error updating candidate status:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}
