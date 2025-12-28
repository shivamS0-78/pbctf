import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createAuthErrorResponse } from "@/lib/middleware/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Team from "@/models/Team";
import ProblemStatement from "@/models/ProblemStatement";

export const dynamic = 'force-dynamic';

function createSuccessResponse(message: string, data: any, status = 200) {
  return NextResponse.json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  }, { status });
}

function createErrorResponse(message: string, code: string, status: number, details?: string) {
  return NextResponse.json({
    success: false,
    message,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  }, { status });
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const body = await request.json();
    const { setLookingStatus = false } = body;

    await dbConnect();

    const user = await User.findOne({ uid: authResult.user.uid });
    if (!user) {
      return createErrorResponse("User not found", "NOT_FOUND", 404);
    }

    if (!user.teamCode) {
      return createErrorResponse("You are not part of any team", "NOT_IN_TEAM", 400);
    }

    const team = await Team.findOne({ teamCode: user.teamCode });
    if (!team) {
      await User.findOneAndUpdate({ uid: authResult.user.uid }, { teamCode: null });
      return createErrorResponse("Team not found", "TEAM_NOT_FOUND", 404);
    }

    if (team.teamStatus === 'submitted' || team.teamStatus === 'shortlisted' || team.teamStatus === 'rsvped') {
      return createErrorResponse("Cannot leave team after submission", "CANNOT_LEAVE_AFTER_SUBMISSION", 403);
    }

    const isTeamLead = team.teamLead === authResult.user.uid;
    const formerTeamName = team.teamName;
    let newTeamLead: string | null = null;

    if (isTeamLead) {
      const otherMembers = team.teamMembers.filter((m: any) => m.uid !== authResult.user.uid);
      
      if (otherMembers.length === 0) {
        await Team.deleteOne({ teamCode: team.teamCode });
        
        if (team.appliedFor) {
          await ProblemStatement.findByIdAndUpdate(team.appliedFor, { $inc: { teamCount: -1 } });
        }
      } else {
        newTeamLead = otherMembers[0].uid;
        
        team.teamMembers = otherMembers.map((m: any) => ({
          ...m,
          role: m.uid === newTeamLead ? 'Team Lead' : 'Member',
        }));
        team.teamLead = newTeamLead;
        
        await team.save();
      }
    } else {
      team.teamMembers = team.teamMembers.filter((m: any) => m.uid !== authResult.user.uid);
      await team.save();
    }
    await User.findOneAndUpdate(
      { uid: authResult.user.uid },
      { 
        teamCode: null, 
        isLooking: Boolean(setLookingStatus) 
      }
    );

    return createSuccessResponse("Successfully left team", {
      formerTeam: formerTeamName,
      isLooking: Boolean(setLookingStatus),
      newTeamLead: newTeamLead,
      teamDeleted: isTeamLead && team.teamMembers.filter((m: any) => m.uid !== authResult.user.uid).length === 0,
    });

  } catch (error: any) {
    console.error("Leave team error:", error);
    return createErrorResponse("Failed to leave team", "SERVER_ERROR", 500, error.message);
  }
}
