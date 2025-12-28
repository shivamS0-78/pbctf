import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
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
 * GET /api/problem-statements/:id
 * Get specific problem statement by ID (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const problemStatement = await ProblemStatement.findById(params.id);

    if (!problemStatement) {
      return createErrorResponse("Problem statement not found", "NOT_FOUND", 404);
    }

    return createSuccessResponse("Problem statement retrieved successfully", {
      id: problemStatement._id.toString(),
      title: problemStatement.title,
      description: problemStatement.description,
      teamCount: problemStatement.teamCount,
      isActive: problemStatement.isActive,
      createdAt: problemStatement.createdAt,
    });
  } catch (error: any) {
    console.error("Get problem statement error:", error);
    
    // Handle invalid ObjectId
    if (error.name === 'CastError') {
      return createErrorResponse("Invalid problem statement ID", "INVALID_ID", 400);
    }
    
    return createErrorResponse("Failed to retrieve problem statement", "SERVER_ERROR", 500);
  }
}
