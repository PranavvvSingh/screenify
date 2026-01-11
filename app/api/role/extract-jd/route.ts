import { NextRequest, NextResponse } from "next/server";
import { requireRecruiterAPI } from "@/lib/auth-utils";
import { extractJDRequirements } from "@/lib/ollama";

export async function POST(request: NextRequest) {
  try {
    // Authenticate recruiter
    await requireRecruiterAPI();
    const { text } = await request.json();

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Invalid request: text is required" },
        { status: 400 }
      );
    }
    if (text.length < 50) {
      return NextResponse.json(
        { error: "Text is too short to extract meaningful requirements" },
        { status: 400 }
      );
    }

    console.log("Extracting JD requirements from text (length:", text.length, ")");

    // Call Ollama API to extract structured requirements
    const requirements = await extractJDRequirements(text);
    console.log("Successfully extracted requirements");
    console.log(JSON.stringify(requirements, null, 2));

    return NextResponse.json({
      success: true,
      requirements,
    });
  } catch (error) {
    console.error("Error extracting JD requirements:", error);

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
        error: error instanceof Error ? error.message : "Failed to extract JD requirements",
      },
      { status: 500 }
    );
  }
}
