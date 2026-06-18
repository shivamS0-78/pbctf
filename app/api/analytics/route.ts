import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, createAuthErrorResponse } from "@/lib/middleware/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Team from "@/models/Team";
import Analytics from "@/models/Analytics";
import ProblemStatement from "@/models/ProblemStatement";

export const dynamic = 'force-dynamic';

function createSuccessResponse(data: any) {
    return NextResponse.json({
        success: true,
        data,
        timestamp: new Date().toISOString(),
    });
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

        // Allow 'admin' role only
        const userRole = authResult.user.role;
        if (userRole !== 'admin') {
            return createErrorResponse("Access denied", "FORBIDDEN", 403);
        }

        await dbConnect();

        // Fetch real stats
        const [totalUsers, totalTeams, submittedCount, evaluatedCount, shortlistedCount, actualSubmissionsCount] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            Team.countDocuments({}),
            Team.countDocuments({ teamStatus: { $in: ['submitted', 'under-review'] } }),
            Team.countDocuments({ evaluations: { $exists: true, $ne: [] } }),
            Team.countDocuments({ 
                'evaluations.tier': { $in: ['accepted', 'strongly_accepted'] }
            }),
            Team.countDocuments({ submittedAt: { $exists: true, $ne: null } })
        ]);

        const registered = Math.max(0, totalTeams - (submittedCount + evaluatedCount));

        const currentStats = {
            totalUsers,
            totalTeams: registered + submittedCount + evaluatedCount,
            totalSubmissions: actualSubmissionsCount,
            totalEvaluated: evaluatedCount,
        };

        const teamDistribution = [
            { name: 'Registered', value: registered },
            { name: 'Submitted', value: submittedCount },
            { name: 'Evaluated', value: Math.max(0, evaluatedCount - shortlistedCount) },
            { name: 'Shortlisted', value: shortlistedCount },
        ];

        // Fetch history (last 30 days)
        const historyDocs = await Analytics.find({}).sort({ date: 1 }).limit(30);
        const history = historyDocs.map((doc: any) => ({
            date: doc.date,
            totalUsers: doc.totalUsers,
        }));

        // Calculate Submission Activity
        const submissions = await Team.find({
            submittedAt: { $exists: true, $ne: null }
        }).select('submittedAt');

        const activityMap = new Map<string, number>();
        // Initialize standard hours 10:00 - 18:00
        for (let i = 10; i <= 18; i++) {
            activityMap.set(`${i}:00`, 0);
        }

        submissions.forEach(team => {
            if (team.submittedAt) {
                const hour = new Date(team.submittedAt).getHours();
                // Map to closest bucket or just raw hour if within range
                if (hour >= 10 && hour <= 18) {
                    const key = `${hour}:00`;
                    activityMap.set(key, (activityMap.get(key) || 0) + 1);
                }
            }
        });

        const submissionActivity = Array.from(activityMap.entries()).map(([time, count]) => ({
            time,
            submissions: count
        })).sort((a, b) => parseInt(a.time) - parseInt(b.time));

        // Calculate Problem Statement Distribution
        const psAggregation = await Team.aggregate([
            {
                $match: {
                    appliedFor: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$appliedFor",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        // Fetch PS Titles
        const psIds = psAggregation.map(item => item._id).filter(id => id); // Filter out nulls
        const problemStatements = await ProblemStatement.find({ _id: { $in: psIds } }).select('title');
        const psMap = new Map(problemStatements.map(ps => [ps._id.toString(), ps.title]));

        const psDistribution = psAggregation.map(item => ({
            name: psMap.get(item._id?.toString()) || "Unknown",
            value: item.count
        }));

        return createSuccessResponse({ ...currentStats, history, teamDistribution, submissionActivity, psDistribution });

    } catch (error: any) {
        console.error("Analytics data fetch error:", error);
        return createErrorResponse("Failed to retrieve data", "SERVER_ERROR", 500);
    }
}
