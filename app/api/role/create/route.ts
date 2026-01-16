import { NextRequest, NextResponse } from "next/server";
import { requireRecruiterAPI } from "@/lib/auth-utils";
import { insertJobRole } from "@/lib/db";
import { generateStandardQuestions } from "@/lib/ollama";
import type { JDRequirements } from "@/types/ollama";
import type { Prisma } from "@prisma/client";

interface CreateRoleRequest {
  requirements: JDRequirements;
  totalQuestions: number;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate recruiter
    const { recruiter } = await requireRecruiterAPI();

    // 2. Parse and validate request body
    const body: CreateRoleRequest = await request.json();
    const { requirements, totalQuestions } = body;

    // Extract title and description from requirements
    const title = requirements?.job_title;
    const description = requirements?.description;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Role title is required" },
        { status: 400 }
      );
    }
    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }
    if (!requirements || !requirements.required_skills || requirements.required_skills.length === 0) {
      return NextResponse.json(
        { error: "At least one required skill is needed" },
        { status: 400 }
      );
    }

    if (totalQuestions < 5 || totalQuestions > 25) {
      return NextResponse.json(
        { error: "Total questions must be between 5 and 25" },
        { status: 400 }
      );
    }

    console.log("Creating role:", {
      title,
      totalQuestions,
      recruiterId: recruiter.id,
    });

    // 3. Calculate standard questions count (70% of total, rounded)
    const standardQuestionsCount = Math.round(totalQuestions * 0.7);
    console.log(`Generating ${standardQuestionsCount} standard questions (70% of ${totalQuestions})`);

    // 4. Generate base questions using Ollama API
    let baseQuestions;
    try {
      baseQuestions = await generateStandardQuestions(
        requirements,
        standardQuestionsCount
      );
      console.log(`Successfully generated ${baseQuestions.length} base questions`);

      // Validate that we got enough questions
      if (baseQuestions.length < standardQuestionsCount) {
        return NextResponse.json(
          {
            error: `Failed to generate enough questions. Expected ${standardQuestionsCount}, got ${baseQuestions.length}. Please try again.`,
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Error generating base questions:", error);
      return NextResponse.json(
        {
          error: "Failed to generate quiz questions. Please try again.",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // 5. Save role to database
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { description: _, ...jdWithoutDescription } = requirements;
    const role = await insertJobRole({
      title: title.trim(),
      description: description.trim(),
      recruiterId: recruiter.id,
      jd: jdWithoutDescription as unknown as Prisma.InputJsonValue,
      baseQuestions: baseQuestions as unknown as Prisma.InputJsonValue,
      totalQuestions: totalQuestions,
    });

    console.log("Role created successfully:", role.id);

    // 6. Return success response
    return NextResponse.json(
      {
        success: true,
        role: {
          id: role.id,
          title: role.title,
          totalQuestions: role.totalQuestions,
          baseQuestionsCount: baseQuestions.length,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating role:", error);

    // Handle authentication errors
    if (error instanceof Error) {
      if (error.message === "UNAUTHORIZED") {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      if (error.message === "FORBIDDEN") {
        return NextResponse.json(
          { error: "Recruiter access required" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to create role",
      },
      { status: 500 }
    );
  }
}
