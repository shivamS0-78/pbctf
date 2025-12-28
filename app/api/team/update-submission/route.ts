import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createAuthErrorResponse } from "@/lib/middleware/auth";
import { cloudinaryV2 } from "@/c";
import dbConnect from "@/lib/db";
import Team from "@/models/Team";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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

function isValidYouTubeURL(url: string): boolean {
  const patterns = [
    /^(https?:\/\/)?(www\.)?youtube\.com\/watch\?v=[\w-]+/,
    /^(https?:\/\/)?(www\.)?youtu\.be\/[\w-]+/,
  ];
  return patterns.some(pattern => pattern.test(url));
}

async function uploadBase64ToCloudinary(base64Data: string, folder: string, resourceType: 'raw'): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinaryV2.uploader.upload(
      base64Data,
      { folder, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result!.secure_url);
      }
    );
  });
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await authenticateUser(request);
    if (!authResult.success) {
      return createAuthErrorResponse(authResult);
    }

    const body = await request.json();
    const { teamCode, videoURL, submissionPDF, anyOtherLink } = body;

    if (!teamCode) {
      return createErrorResponse("Team code is required", "VALIDATION_ERROR", 400);
    }

    await dbConnect();

    const team = await Team.findOne({ teamCode });
    if (!team) {
      return createErrorResponse("Team not found", "NOT_FOUND", 404);
    }

    if (team.teamLead !== authResult.user.uid) {
      return createErrorResponse("Only team lead can update submission", "NOT_TEAM_LEAD", 403);
    }
    if (team.teamStatus !== 'submitted') {
      return createErrorResponse("Team must be submitted before updating", "INVALID_STATUS", 400);
    }
    if (team.isEvaluated) {
      return createErrorResponse("Cannot update after evaluation", "ALREADY_EVALUATED", 403);
    }
    const deadline = process.env.SUBMISSION_DEADLINE 
      ? new Date(process.env.SUBMISSION_DEADLINE) 
      : null;
    
    if (deadline && new Date() > deadline) {
      return createErrorResponse(
        "Submission deadline has passed. No updates allowed.",
        "DEADLINE_PASSED",
        403
      );
    }

    const updateData: Record<string, any> = {};

    if (videoURL !== undefined) {
      if (videoURL && !isValidYouTubeURL(videoURL)) {
        return createErrorResponse("Invalid YouTube URL format", "INVALID_VIDEO_URL", 400);
      }
      updateData.videoURL = videoURL || null;
    }

    if (submissionPDF) {
      try {
        updateData.submissionPDF = await uploadBase64ToCloudinary(
          submissionPDF,
          'zenith/submissions',
          'raw'
        );
      } catch (uploadError) {
        console.error('PDF upload error:', uploadError);
        return createErrorResponse("Failed to upload PDF", "UPLOAD_ERROR", 500);
      }
    }

    if (anyOtherLink !== undefined) {
      updateData.anyOtherLink = anyOtherLink || null;
    }
    const updatedTeam = await Team.findOneAndUpdate(
      { teamCode },
      { $set: updateData },
      { new: true }
    );

    return createSuccessResponse("Submission updated successfully", {
      teamCode,
      videoURL: updatedTeam!.videoURL || null,
      submissionPDF: updatedTeam!.submissionPDF || null,
      anyOtherLink: updatedTeam!.anyOtherLink || null,
      updatedAt: updatedTeam!.updatedAt,
      deadline: deadline?.toISOString() || null,
    });
  } catch (error: any) {
    console.error("Update submission error:", error);
    return createErrorResponse("Failed to update submission", "SERVER_ERROR", 500);
  }
}
