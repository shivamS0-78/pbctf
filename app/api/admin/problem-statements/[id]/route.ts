import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, requireAdmin, createAuthErrorResponse } from "@/lib/middleware/auth";
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { title, description, isActive } = body;

    if (title !== undefined && (title.length < 10 || title.length > 200)) {
      return createErrorResponse("Title must be 10-200 characters", "VALIDATION_ERROR", 400);
    }

    if (description !== undefined && (description.length < 50 || description.length > 1000)) {
      return createErrorResponse("Description must be 50-1000 characters", "VALIDATION_ERROR", 400);
    }

    await dbConnect();

    const ps = await ProblemStatement.findById(params.id);
    if (!ps) {
      return createErrorResponse("Problem statement not found", "NOT_FOUND", 404);
    }

    const updateData: Record<string, any> = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await ProblemStatement.findByIdAndUpdate(
      params.id,
      { $set: updateData },
      { new: true }
    );

    return createSuccessResponse("Problem statement updated successfully", {
      id: updated!._id.toString(),
      title: updated!.title,
      description: updated!.description,
      isActive: updated!.isActive,
      updatedAt: updated!.updatedAt,
    });
  } catch (error: any) {
    console.error("Update problem statement error:", error);
    
    if (error.name === 'CastError') {
      return createErrorResponse("Invalid problem statement ID", "INVALID_ID", 400);
    }
    
    return createErrorResponse("Failed to update problem statement", "SERVER_ERROR", 500);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const adminCheck = requireAdmin(authResult);
    if (adminCheck) {
      return createAuthErrorResponse(adminCheck);
    }

    await dbConnect();

    const ps = await ProblemStatement.findById(params.id);
    if (!ps) {
      return createErrorResponse("Problem statement not found", "NOT_FOUND", 404);
    }

    if (ps.teamCount > 0) {
      return createErrorResponse(
        "Cannot delete problem statement with associated teams",
        "HAS_TEAMS",
        400
      );
    }

    await ProblemStatement.findByIdAndDelete(params.id);

    return createSuccessResponse("Problem statement deleted successfully", {
      id: params.id,
    });
  } catch (error: any) {
    console.error("Delete problem statement error:", error);
    
    if (error.name === 'CastError') {
      return createErrorResponse("Invalid problem statement ID", "INVALID_ID", 400);
    }
    
    return createErrorResponse("Failed to delete problem statement", "SERVER_ERROR", 500);
  }
}
