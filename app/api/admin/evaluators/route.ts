import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, requireAdmin, createAuthErrorResponse } from "@/lib/middleware/auth";
import dbConnect from "@/lib/db";
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

    const evaluators = await Evaluator.find().sort({ createdAt: -1 });

    const formatted = evaluators.map(ev => ({
      uid: ev.uid,
      name: ev.name,
      email: ev.email,
      assignedCount: ev.assignedCount,
      evaluatedCount: ev.evaluatedCount,
      pendingCount: ev.assignedCount - ev.evaluatedCount,
      stats: ev.stats,
      createdAt: ev.createdAt,
      lastEvaluationAt: ev.lastEvaluationAt || null,
    }));

    return createSuccessResponse("Evaluators retrieved successfully", {
      evaluators: formatted,
      total: formatted.length,
    });
  } catch (error: any) {
    console.error("Get evaluators error:", error);
    return createErrorResponse("Failed to retrieve evaluators", "SERVER_ERROR", 500);
  }
}
