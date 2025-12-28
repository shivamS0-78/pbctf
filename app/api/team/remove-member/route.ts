import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createAuthErrorResponse } from "@/lib/middleware/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
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
 * PUT /api/team/remove-member
 * Remove a member from team (team lead only)
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const body = await request.json();
    const { teamCode, memberId, setTheirLookingStatus = true } = body;

    if (!teamCode || !memberId) {
      return createErrorResponse("Team code and member ID are required", "VALIDATION_ERROR", 400);
    }

    await dbConnect();

    const team = await Team.findOne({ teamCode });
    if (!team) {
      return createErrorResponse("Team not found", "NOT_FOUND", 404);
    }

    // Check if user is team lead
    if (team.teamLead !== authResult.user.uid) {
      return createErrorResponse("Only team lead can remove members", "NOT_TEAM_LEAD", 403);
    }

    // Cannot remove self
    if (memberId === authResult.user.uid) {
      return createErrorResponse("Cannot remove yourself. Use leave team instead.", "CANNOT_REMOVE_SELF", 400);
    }

    // Cannot remove after submission
    if (team.teamStatus === 'submitted' || team.teamStatus === 'shortlisted') {
      return createErrorResponse("Cannot remove members after submission", "TEAM_SUBMITTED", 400);
    }

    // Find the member to remove
    const memberIndex = team.teamMembers.findIndex((m: any) => m.uid === memberId);
    if (memberIndex === -1) {
      return createErrorResponse("Member not found in team", "MEMBER_NOT_FOUND", 404);
    }

    // Get member info before removing
    const removedMember = await User.findOne({ uid: memberId });
    const memberName = removedMember?.name || 'Unknown';

    // Remove member from team
    team.teamMembers.splice(memberIndex, 1);
    await team.save();

    // Update removed member's user record
    await User.findOneAndUpdate(
      { uid: memberId },
      { teamCode: null, isLooking: Boolean(setTheirLookingStatus) }
    );

    return createSuccessResponse("Member removed successfully", {
      teamCode,
      removedMember: {
        id: memberId,
        name: memberName,
      },
      currentMemberCount: team.memberCount,
    });
  } catch (error: any) {
    console.error("Remove member error:", error);
    return createErrorResponse("Failed to remove member", "SERVER_ERROR", 500);
  }
}
