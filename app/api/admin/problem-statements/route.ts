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

export async function POST(request: NextRequest) {
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
    const { title, description, isActive = true } = body;

    if (!title?.trim() || title.length < 10 || title.length > 200) {
      return createErrorResponse("Title is required (10-200 characters)", "VALIDATION_ERROR", 400);
    }

    if (!description?.trim() || description.length < 50 || description.length > 1000) {
      return createErrorResponse("Description is required (50-1000 characters)", "VALIDATION_ERROR", 400);
    }

    await dbConnect();

    const existing = await ProblemStatement.findOne({ 
      title: { $regex: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    
    if (existing) {
      return createErrorResponse("Problem statement with this title already exists", "TITLE_EXISTS", 409);
    }

    const newPS = new ProblemStatement({
      title: title.trim(),
      description: description.trim(),
      teamCount: 0,
      isActive: Boolean(isActive),
    });

    await newPS.save();

    return createSuccessResponse("Problem statement created successfully", {
      id: newPS._id.toString(),
      title: newPS.title,
      description: newPS.description,
      isActive: newPS.isActive,
      teamCount: 0,
      createdAt: newPS.createdAt,
    }, 201);
  } catch (error: any) {
    console.error("Create problem statement error:", error);
    return createErrorResponse("Failed to create problem statement", "SERVER_ERROR", 500);
  }
}


export async function GET(request: NextRequest) {
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

    const problemStatements = await ProblemStatement.find()
      .select('title description teamCount isActive createdAt updatedAt')
      .sort({ createdAt: -1 });

    const formatted = problemStatements.map(ps => ({
      id: ps._id.toString(),
      title: ps.title,
      description: ps.description,
      teamCount: ps.teamCount,
      isActive: ps.isActive,
      createdAt: ps.createdAt,
      updatedAt: ps.updatedAt,
    }));

    return createSuccessResponse("Problem statements retrieved successfully", {
      problemStatements: formatted,
      total: formatted.length,
    });
  } catch (error: any) {
    console.error("Get problem statements error:", error);
    return createErrorResponse("Failed to retrieve problem statements", "SERVER_ERROR", 500);
  }
}
