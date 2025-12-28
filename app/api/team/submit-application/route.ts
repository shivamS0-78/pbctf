import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createAuthErrorResponse } from "@/lib/middleware/auth";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";

export const dynamic = 'force-dynamic';

function createSuccessResponse(message: string, data: any, status = 200) {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }, { status });
}

function createErrorResponse(message: string, code: string, status: number) {
  return NextResponse.json({
    success: false,
    message,
    error: { code, message },
    timestamp: new Date().toISOString(),
  }, { status });
}

/**
 * POST /api/team/submit-application
 * Submit team application for evaluation (team lead only)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const body = await request.json();
    const { teamCode } = body;

    if (!teamCode) {
      return createErrorResponse("Team code is required", "VALIDATION_ERROR", 400);
    }

    await dbConnect();

    const team = await Team.findOne({ teamCode });
    if (!team) {
      return createErrorResponse("Team not found", "NOT_FOUND", 404);
    }

    // Check if user is team lead
    if (team.teamLead !== authResult.user.uid) {
      return createErrorResponse("Only team lead can submit application", "NOT_TEAM_LEAD", 403);
    }

    // Check if already submitted
    if (team.teamStatus === 'submitted') {
      return createErrorResponse("Application already submitted", "ALREADY_SUBMITTED", 409);
    }

    // Check if video pitch is uploaded
    if (!team.videoURL) {
      return createErrorResponse("Video pitch is required before submission", "MISSING_VIDEO", 400);
    }

    // PDF is optional

    // Update team status
    const updatedTeam = await Team.findOneAndUpdate(
      { teamCode },
      { 
        teamStatus: 'submitted',
        submittedAt: new Date(),
        isLooking: false, // No longer looking for members after submission
      },
      { new: true }
    );

    return createSuccessResponse("Application submitted successfully", {
      teamCode,
      teamName: updatedTeam!.teamName,
      teamStatus: 'submitted',
      submittedAt: updatedTeam!.submittedAt,
      membersCount: updatedTeam!.memberCount,
    });
  } catch (error: any) {
    console.error("Submit application error:", error);
    return createErrorResponse("Failed to submit application", "SERVER_ERROR", 500);
  }
}
