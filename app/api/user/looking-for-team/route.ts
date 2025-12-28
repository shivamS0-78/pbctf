import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createAuthErrorResponse } from "@/lib/middleware/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";

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
 * GET /api/user/looking-for-team
 * Get list of users looking for teams
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
    const organisation = searchParams.get('organisation');

    await dbConnect();

    const query: any = { isLooking: true, teamCode: { $exists: false } };
    
    // Add organisation filter if provided
    if (organisation) {
      query.organisation = { $regex: organisation, $options: 'i' };
    }

    const skip = (page - 1) * limit;
    
    const [users, totalUsers] = await Promise.all([
      User.find(query)
        .select('name email organisation bio profile_picture github_link linkedin_link leetcode_profile')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    const formattedUsers = users.map(user => ({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      organisation: user.organisation || null,
      bio: user.bio || null,
      profile_picture: user.profile_picture || null,
      github_link: user.github_link || null,
      linkedin_link: user.linkedin_link || null,
      leetcode_profile: user.leetcode_profile || null,
    }));

    return createSuccessResponse("Users retrieved successfully", {
      users: formattedUsers,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        limit,
      },
    });
  } catch (error: any) {
    console.error("Get looking-for-team error:", error);
    return createErrorResponse("Failed to retrieve users", "SERVER_ERROR", 500);
  }
}

/**
 * PUT /api/user/looking-for-team
 * Toggle user's looking for team status
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const body = await request.json();
    const { isLooking } = body;

    if (typeof isLooking !== 'boolean') {
      return createErrorResponse("isLooking must be a boolean", "VALIDATION_ERROR", 400);
    }

    await dbConnect();

    const user = await User.findOne({ uid: authResult.user.uid });
    if (!user) {
      return createErrorResponse("User not found", "NOT_FOUND", 404);
    }

    // Cannot set isLooking to true if already in a team
    if (isLooking && user.teamCode) {
      return createErrorResponse("Cannot set looking status while in a team", "ALREADY_IN_TEAM", 400);
    }

    await User.findOneAndUpdate(
      { uid: authResult.user.uid },
      { isLooking }
    );

    return createSuccessResponse("Status updated successfully", { isLooking });
  } catch (error: any) {
    console.error("Update looking-for-team error:", error);
    return createErrorResponse("Failed to update status", "SERVER_ERROR", 500);
  }
}
