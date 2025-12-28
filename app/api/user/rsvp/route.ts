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
 * PUT /api/user/rsvp
 * Individual RSVP for selected team member
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const body = await request.json();
    const { rsvpStatus } = body;

    // Validate rsvpStatus
    if (!rsvpStatus || !['confirmed', 'declined'].includes(rsvpStatus)) {
      return createErrorResponse("rsvpStatus must be 'confirmed' or 'declined'", "INVALID_RSVP_STATUS", 400);
    }

    await dbConnect();

    const user = await User.findOne({ uid: authResult.user.uid });
    if (!user) {
      return createErrorResponse("User not found", "NOT_FOUND", 404);
    }

    if (!user.teamCode) {
      return createErrorResponse("You are not part of any team", "USER_NOT_IN_TEAM", 400);
    }

    const team = await Team.findOne({ teamCode: user.teamCode });
    if (!team) {
      return createErrorResponse("Team not found", "NOT_FOUND", 404);
    }

    // Check if team is shortlisted
    if (!team.isShortlisted) {
      return createErrorResponse("Team must be shortlisted before RSVP", "TEAM_NOT_SHORTLISTED", 400);
    }

    // Check if user already RSVPed
    const existingRSVP = team.memberRSVPs.find((r: any) => r.uid === authResult.user.uid);
    if (existingRSVP) {
      return createErrorResponse("You have already submitted your RSVP", "ALREADY_RSVPED", 409);
    }

    // Add user's RSVP
    team.memberRSVPs.push({
      uid: authResult.user.uid,
      name: user.name,
      rsvpStatus,
      rsvpedAt: new Date(),
    });

    // Check if all members have RSVPed
    const allRSVPed = team.teamMembers.every((member: any) =>
      team.memberRSVPs.some((rsvp: any) => rsvp.uid === member.uid)
    );

    // Check if all RSVPs are confirmed
    const allConfirmed = allRSVPed && team.memberRSVPs.every(
      (rsvp: any) => rsvp.rsvpStatus === 'confirmed'
    );

    // Check if any member declined
    const anyDeclined = team.memberRSVPs.some(
      (rsvp: any) => rsvp.rsvpStatus === 'declined'
    );

    // Update team status
    if (allConfirmed) {
      team.teamStatus = 'rsvped';
      team.rsvpCompletedAt = new Date();
    } else if (anyDeclined) {
      team.teamStatus = 'rsvp_declined';
    }

    await team.save();

    return createSuccessResponse(
      allConfirmed ? "RSVP submitted successfully. Your team is now fully confirmed!" : "RSVP submitted successfully",
      {
        userRSVP: {
          uid: authResult.user.uid,
          name: user.name,
          rsvpStatus,
          rsvpedAt: new Date().toISOString(),
        },
        teamStatus: {
          teamCode: team.teamCode,
          teamName: team.teamName,
          totalMembers: team.memberCount,
          rsvpedMembers: team.memberRSVPs.length,
          pendingRSVPs: team.memberCount - team.memberRSVPs.length,
          allRSVPed,
          teamStatus: team.teamStatus,
          rsvpCompletedAt: team.rsvpCompletedAt || null,
          memberRSVPs: team.memberRSVPs,
        },
      }
    );
  } catch (error: any) {
    console.error("RSVP error:", error);
    return createErrorResponse("Failed to submit RSVP", "SERVER_ERROR", 500);
  }
}

/**
 * GET /api/user/rsvp
 * Alias for /api/user/rsvp-status
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    await dbConnect();

    const user = await User.findOne({ uid: authResult.user.uid });
    if (!user) {
      return createErrorResponse("User not found", "NOT_FOUND", 404);
    }

    if (!user.teamCode) {
      return createSuccessResponse("RSVP status retrieved", {
        hasRSVPed: false,
        userRSVP: null,
        team: null,
      });
    }

    const team = await Team.findOne({ teamCode: user.teamCode });
    if (!team) {
      return createSuccessResponse("RSVP status retrieved", {
        hasRSVPed: false,
        userRSVP: null,
        team: null,
      });
    }

    const userRSVP = team.memberRSVPs.find((r: any) => r.uid === authResult.user.uid);
    
    // Get member names for RSVP display
    const memberUids = team.teamMembers.map((m: any) => m.uid);
    const members = await User.find({ uid: { $in: memberUids } }).select('uid name');

    const memberRSVPs = team.teamMembers.map((member: any) => {
      const memberInfo = members.find(m => m.uid === member.uid);
      const rsvp = team.memberRSVPs.find((r: any) => r.uid === member.uid);
      return {
        name: memberInfo?.name || 'Unknown',
        rsvpStatus: rsvp?.rsvpStatus || null,
        rsvpedAt: rsvp?.rsvpedAt || null,
      };
    });

    return createSuccessResponse("RSVP status retrieved", {
      hasRSVPed: !!userRSVP,
      userRSVP: userRSVP ? {
        rsvpStatus: userRSVP.rsvpStatus,
        rsvpedAt: userRSVP.rsvpedAt,
      } : null,
      team: {
        teamCode: team.teamCode,
        teamName: team.teamName,
        isShortlisted: team.isShortlisted,
        teamStatus: team.teamStatus,
        totalMembers: team.memberCount,
        rsvpedMembers: team.memberRSVPs.length,
        pendingRSVPs: team.memberCount - team.memberRSVPs.length,
        allRSVPed: team.memberCount === team.memberRSVPs.length,
        memberRSVPs,
      },
    });
  } catch (error: any) {
    console.error("Get RSVP status error:", error);
    return createErrorResponse("Failed to get RSVP status", "SERVER_ERROR", 500);
  }
}
