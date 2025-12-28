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

function createErrorResponse(message: string, code: string, status: number) {
  return NextResponse.json({
    success: false,
    message,
    error: { code, message },
    timestamp: new Date().toISOString(),
  }, { status });
}

/**
 * GET /api/team/looking-for-members
 * Get list of teams looking for members
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const appliedFor = searchParams.get('appliedFor');

    await dbConnect();

    const query: any = { isLooking: true, memberCount: { $lt: 4 } };
    
    if (appliedFor) {
      query.appliedFor = appliedFor;
    }

    const skip = (page - 1) * limit;
    
    const [teams, totalTeams] = await Promise.all([
      Team.find(query)
        .select('teamCode teamName teamLead teamMembers memberCount appliedFor isLooking')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      Team.countDocuments(query),
    ]);

    // Get team lead info and problem statement info
    const teamLeadUids = teams.map(t => t.teamLead);
    const problemStatementIds = teams.map(t => t.appliedFor).filter(Boolean);
    
    const [teamLeads, problemStatements] = await Promise.all([
      User.find({ uid: { $in: teamLeadUids } }).select('uid name'),
      ProblemStatement.find({ _id: { $in: problemStatementIds } }).select('title'),
    ]);

    const formattedTeams = teams.map(team => {
      const lead = teamLeads.find(u => u.uid === team.teamLead);
      const ps = problemStatements.find(p => p._id.toString() === team.appliedFor);
      
      return {
        teamCode: team.teamCode,
        teamName: team.teamName,
        teamLead: {
          id: lead?._id?.toString(),
          name: lead?.name || 'Unknown',
        },
        teamMembers: team.teamMembers.map((m: any) => ({
          uid: m.uid,
          role: m.role,
        })),
        currentMemberCount: team.memberCount,
        maxMembers: 4,
        appliedFor: ps ? { id: ps._id.toString(), title: ps.title } : null,
        isLooking: team.isLooking,
      };
    });

    return createSuccessResponse("Teams retrieved successfully", {
      teams: formattedTeams,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTeams / limit),
        totalTeams,
        limit,
      },
    });
  } catch (error: any) {
    console.error("Get looking-for-members error:", error);
    return createErrorResponse("Failed to retrieve teams", "SERVER_ERROR", 500);
  }
}

/**
 * PUT /api/team/looking-for-members
 * Toggle team's looking for members status (team lead only)
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const body = await request.json();
    const { teamCode, isLooking } = body;

    if (!teamCode) {
      return createErrorResponse("Team code is required", "VALIDATION_ERROR", 400);
    }

    if (typeof isLooking !== 'boolean') {
      return createErrorResponse("isLooking must be a boolean", "VALIDATION_ERROR", 400);
    }

    await dbConnect();

    const team = await Team.findOne({ teamCode });
    if (!team) {
      return createErrorResponse("Team not found", "NOT_FOUND", 404);
    }

    // Check if user is team lead
    if (team.teamLead !== authResult.user.uid) {
      return createErrorResponse("Only team lead can update this status", "NOT_TEAM_LEAD", 403);
    }

    await Team.findOneAndUpdate({ teamCode }, { isLooking });

    return createSuccessResponse("Team status updated successfully", {
      teamCode,
      isLooking,
    });
  } catch (error: any) {
    console.error("Update looking-for-members error:", error);
    return createErrorResponse("Failed to update status", "SERVER_ERROR", 500);
  }
}
