import { NextRequest, NextResponse } from "next/server";
import { appendProctoringEvent } from "@/lib/db";

interface ProctoringEventPayload {
  type: "TAB_SWITCH" | "FULLSCREEN_EXIT" | "WINDOW_BLUR" | "MULTIPLE_DISPLAYS";
  timestamp: string;
}

/**
 * POST /api/quiz/[token]/proctoring
 * Append a single proctoring event to the quiz's event log
 * No authentication required - public endpoint
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body = await request.json();

    const { type, timestamp } = body as ProctoringEventPayload;
    console.log("Logging proctoring event: ", { type, timestamp });

    // Validate token
    if (!token || token.length < 10) {
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Validate event type
    const validTypes = ["TAB_SWITCH", "FULLSCREEN_EXIT", "WINDOW_BLUR", "MULTIPLE_DISPLAYS"];
    if (!type || !validTypes.includes(type)) {
      return NextResponse.json(
        { error: "Invalid event type" },
        { status: 400 }
      );
    }

    // Validate timestamp
    if (!timestamp) {
      return NextResponse.json(
        { error: "Missing timestamp" },
        { status: 400 }
      );
    }

    // Append event to quiz
    const result = await appendProctoringEvent(token, { type, timestamp });

    if (!result) {
      return NextResponse.json(
        { error: "Quiz not found or not in progress" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging proctoring event:", error);

    return NextResponse.json(
      { error: "Failed to log proctoring event" },
      { status: 500 }
    );
  }
}
