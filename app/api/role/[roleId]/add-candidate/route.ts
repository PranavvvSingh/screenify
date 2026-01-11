import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRecruiterAPI } from "@/lib/auth-utils";
import {
  extractResumeProfile,
  generateVerificationQuestions,
  generateQuiz,
} from "@/lib/ollama";
import type { Question } from "@/types/ollama";
import { Prisma } from "@prisma/client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    // Authenticate recruiter
    const { recruiter } = await requireRecruiterAPI();
    const { roleId } = await params;

    // Parse request body
    const body = await request.json();
    const { candidateName, candidateEmail, resumeText } = body;

    // Validate input
    if (!candidateName || !candidateEmail || !resumeText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify role exists and belongs to this recruiter
    const role = await prisma.jobRole.findUnique({
      where: { id: roleId },
      select: {
        id: true,
        recruiterId: true,
        baseQuestions: true,
        totalQuestions: true,
      },
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    if (role.recruiterId !== recruiter.id) {
      return NextResponse.json(
        { error: "You do not have permission to add candidates to this role" },
        { status: 403 }
      );
    }

    // Check if candidate already exists for this role
    const existingQuiz = await prisma.quiz.findFirst({
      where: {
        jobRoleId: roleId,
        candidateEmail: candidateEmail,
      },
    });

    if (existingQuiz) {
      return NextResponse.json(
        { error: "Candidate already exists for this role" },
        { status: 409 }
      );
    }

    // Extract resume profile using Ollama
    const resumeProfile = await extractResumeProfile(resumeText);

    // Calculate question counts (70/30 split)
    const totalQuestions = role.totalQuestions || 10;
    const standardCount = Math.round(totalQuestions * 0.7);
    const verificationCount = totalQuestions - standardCount;

    // Get base questions (standard questions - 70%)
    const baseQuestions = (role.baseQuestions as unknown as Question[]) || [];

    // Select the required number of standard questions
    // If we have more than needed, randomly select
    let standardQuestions: Question[];
    if (baseQuestions.length >= standardCount) {
      // Randomly select standardCount questions
      const shuffled = [...baseQuestions].sort(() => Math.random() - 0.5);
      standardQuestions = shuffled.slice(0, standardCount);
    } else {
      // Use all available questions (shouldn't happen if role was created properly)
      standardQuestions = baseQuestions;
    }

    // Generate verification questions (30%) from resume
    const verificationQuestions = await generateVerificationQuestions(
      resumeProfile,
      verificationCount
    );
    console.log("Verification questions generated");

    // Combine and shuffle questions
    const { allQuestions } = generateQuiz({
      standardQuestions,
      verificationQuestions,
    });

    // Calculate duration (1 minutes per question)
    const duration = totalQuestions * 1;

    // Create quiz record
    const quiz = await prisma.quiz.create({
      data: {
        jobRoleId: roleId,
        candidateName,
        candidateEmail,
        questions: allQuestions as unknown as Prisma.InputJsonValue[],
        duration,
        completed: false,
      },
    });
    console.log("Quiz created with ID:", quiz.id);

    // Generate quiz URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const quizUrl = `${appUrl}/quiz/${quiz.token}`;

    return NextResponse.json({
      success: true,
      quizId: quiz.id,
      quizUrl,
      token: quiz.token,
    });
  } catch (error) {
    console.error("Error adding candidate:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to add candidate",
      },
      { status: 500 }
    );
  }
}
