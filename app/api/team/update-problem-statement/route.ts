import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createAuthErrorResponse, requireEmailVerified } from "@/lib/middleware/auth";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";
import ProblemStatement from "@/models/ProblemStatement";

export const dynamic = 'force-dynamic';

/**
 * PUT /api/team/update-problem-statement
 * Update team's problem statement (team lead only, active teams only)
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.error.message },
        { status: authResult.status }
      );
    }

    const emailError = requireEmailVerified(authResult);
    if (emailError) {
      return createAuthErrorResponse(emailError);
    }

    const body = await request.json();
    const { teamCode, problemStatementId } = body;

    if (!teamCode) {
      return NextResponse.json(
        { success: false, message: "Team code is required" },
        { status: 400 }
      );
    }

    if (!problemStatementId) {
      return NextResponse.json(
        { success: false, message: "Problem statement ID is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify problem statement exists
    const problemStatement = await ProblemStatement.findById(problemStatementId);
    if (!problemStatement) {
      return NextResponse.json(
        { success: false, message: "Problem statement not found" },
        { status: 404 }
      );
    }

    const team = await Team.findOne({ teamCode });
    if (!team) {
      return NextResponse.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      );
    }

    // Check if user is team lead
    if (team.teamLead !== authResult.user.uid) {
      return NextResponse.json(
        { success: false, message: "Only team lead can update problem statement" },
        { status: 403 }
      );
    }

    // Only allow update for teams that haven't submitted yet
    // Team status 'pending' means active/not submitted
    if (team.teamStatus !== 'pending') {
      return NextResponse.json(
        { success: false, message: "Cannot update problem statement after submission" },
        { status: 400 }
      );
    }

    const updatedTeam = await Team.findOneAndUpdate(
      { teamCode },
      { $set: { appliedFor: problemStatementId } },
      { new: true }
    );

    if (!updatedTeam) {
      return NextResponse.json(
        { success: false, message: "Failed to update problem statement" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Problem statement updated successfully",
      data: {
        teamCode: updatedTeam.teamCode,
        appliedFor: {
          id: problemStatement._id.toString(),
          title: problemStatement.title,
        },
      },
    });
  } catch (error: any) {
    console.error("Update problem statement error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
