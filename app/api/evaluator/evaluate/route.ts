import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, requireEvaluator, createAuthErrorResponse } from "@/lib/middleware/auth";
import dbConnect from "@/lib/db";
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

/**
 * PUT /api/evaluator/evaluate
 * Submit evaluation scores for a team
 */
export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const evaluatorCheck = requireEvaluator(authResult);
    if (evaluatorCheck) {
      return createAuthErrorResponse(evaluatorCheck);
    }

    const body = await request.json();
    const { teamCode, scores, comments } = body;

    // Validation
    if (!teamCode) {
      return createErrorResponse("Team code is required", "VALIDATION_ERROR", 400);
    }

    if (!scores || typeof scores !== 'object') {
      return createErrorResponse("Scores object is required", "VALIDATION_ERROR", 400);
    }

    const { tech, ux, presentation } = scores;
    
    if (tech === undefined || ux === undefined || presentation === undefined) {
      return createErrorResponse("All score fields (tech, ux, presentation) are required", "VALIDATION_ERROR", 400);
    }

    // Validate scores are 0-100
    if (tech < 0 || tech > 100 || ux < 0 || ux > 100 || presentation < 0 || presentation > 100) {
      return createErrorResponse("Scores must be between 0 and 100", "INVALID_SCORES", 400);
    }

    await dbConnect();

    // Verify evaluator is assigned to this team
    const evaluator = await Evaluator.findOne({ uid: authResult.user.uid });
    if (!evaluator) {
      return createErrorResponse("Evaluator not found", "NOT_FOUND", 404);
    }

    const assignmentIndex = evaluator.assignedTeams.findIndex(
      (t: any) => t.teamCode === teamCode
    );
    if (assignmentIndex === -1) {
      return createErrorResponse("You are not assigned to this team", "NOT_ASSIGNED", 403);
    }

    const team = await Team.findOne({ teamCode });
    if (!team) {
      return createErrorResponse("Team not found", "NOT_FOUND", 404);
    }

    // Calculate total score
    const total = tech + ux + presentation;

    // Update team with scores
    await Team.findOneAndUpdate(
      { teamCode },
      {
        isEvaluated: true,
        scores: { tech, ux, presentation, total },
        comments: comments || '',
        evaluatedAt: new Date(),
      }
    );

    // Update evaluator assignment
    evaluator.assignedTeams[assignmentIndex].isEvaluated = true;
    evaluator.lastEvaluationAt = new Date();
    
    // Update stats
    if (evaluator.stats) {
      const allScores = await Team.find({
        teamCode: { $in: evaluator.assignedTeams.map((t: any) => t.teamCode) },
        isEvaluated: true,
      }).select('scores.total');
      
      const scoreValues = allScores.map(t => t.scores?.total || 0);
      evaluator.stats.averageScore = scoreValues.length > 0
        ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
        : 0;
    }

    await evaluator.save();

    return createSuccessResponse("Evaluation submitted successfully", {
      teamCode,
      scores: { tech, ux, presentation, total },
      evaluatedAt: new Date().toISOString(),
      evaluatorStats: {
        evaluated: evaluator.evaluatedCount,
        pending: evaluator.assignedCount - evaluator.evaluatedCount,
      },
    });
  } catch (error: any) {
    console.error("Submit evaluation error:", error);
    return createErrorResponse("Failed to submit evaluation", "SERVER_ERROR", 500);
  }
}
