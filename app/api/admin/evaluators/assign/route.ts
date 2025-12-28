import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, requireAdmin, createAuthErrorResponse } from "@/lib/middleware/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Team from "@/models/Team";
import Evaluator from "@/models/Evaluator";

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

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminCheck = requireAdmin(authResult);
    if (adminCheck) {
      return createAuthErrorResponse(adminCheck);
    }

    const body = await request.json();
    const { evaluatorUid, teamCodes } = body;

    if (!evaluatorUid) {
      return createErrorResponse("Evaluator UID is required", "VALIDATION_ERROR", 400);
    }

    if (!teamCodes || !Array.isArray(teamCodes) || teamCodes.length === 0) {
      return createErrorResponse("Team codes array is required", "VALIDATION_ERROR", 400);
    }

    await dbConnect();

    let evaluator = await Evaluator.findOne({ uid: evaluatorUid });
    
    if (!evaluator) {
      const user = await User.findOne({ uid: evaluatorUid });
      if (!user) {
        return createErrorResponse("User not found", "USER_NOT_FOUND", 404);
      }

      if (user.role !== 'evaluator') {
        await User.findOneAndUpdate({ uid: evaluatorUid }, { role: 'evaluator' });
      }

      evaluator = new Evaluator({
        uid: evaluatorUid,
        email: user.email,
        name: user.name,
        assignedTeams: [],
      });
    }

    const teams = await Team.find({ teamCode: { $in: teamCodes } });
    if (teams.length !== teamCodes.length) {
      return createErrorResponse("Some teams not found", "TEAMS_NOT_FOUND", 404);
    }
    let newAssignments = 0;
    for (const teamCode of teamCodes) {
      const alreadyAssigned = evaluator.assignedTeams.some(
        (t: any) => t.teamCode === teamCode
      );
      
      if (!alreadyAssigned) {
        evaluator.assignedTeams.push({
          teamCode,
          assignedAt: new Date(),
          isEvaluated: false,
        });

        await Team.findOneAndUpdate(
          { teamCode },
          { evaluator: evaluatorUid }
        );
        
        newAssignments++;
      }
    }

    await evaluator.save();

    return createSuccessResponse("Teams assigned successfully", {
      evaluator: {
        uid: evaluator.uid,
        name: evaluator.name,
        assignedCount: evaluator.assignedCount,
      },
      newAssignments,
      totalAssigned: evaluator.assignedCount,
    });
  } catch (error: any) {
    console.error("Assign teams error:", error);
    return createErrorResponse("Failed to assign teams", "SERVER_ERROR", 500);
  }
}
