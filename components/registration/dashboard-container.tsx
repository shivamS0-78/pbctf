"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/use-auth';
import { API_ENDPOINTS } from "@/lib/api-config";
import {
  Home,
  UserCircle,
  Users,
  FileText,
  Upload,
  Edit,
  CheckCircle,
  Clock,
  Award,
  AlertCircle,
  X,
  Check,
  Search,
} from "lucide-react";
import { FormSection } from "./form-section";
import { Button } from "./button";
import { StatusBadge } from "./status-badge";
import { AlertBanner } from "./alert-banner";

interface Team {
  teamCode: string;
  teamName: string;
  teamLead: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    organisation?: string;
    resume_link?: string;
    github_link?: string;
  };
  teamMembers: Array<{
    uid: string;
    name: string;
    email?: string;
    organisation?: string;
    role: string;
    joinedAt?: Date;
  }>;
  memberCount: number;
  teamStatus: string;
  isLooking: boolean;
  appliedFor?: {
    id: string;
    title: string;
  } | null;
  videoURL?: string;
  submissionPDF?: string;
  anyOtherLink?: string;
  isEvaluated?: boolean;
  evaluator?: {
    id: string;
    name: string;
    email: string;
  } | null;
  scores?: any;
  comments?: string;
  isShortlisted?: boolean;
  createdAt?: Date;
  submittedAt?: Date;
}

interface DashboardContainerProps {
  onNavigate: (view: "dashboard" | "profile" | "team" | "submission" | "discover") => void;
}

export function DashboardContainer({ onNavigate }: DashboardContainerProps) {
  const { user, isAuthenticated, getToken } = useAuth();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [rsvpStatus, setRsvpStatus] = useState<"pending" | "confirmed" | "declined">("pending");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push("/login");
      return;
    }

    // Fetch real data from API
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Get Firebase auth token (automatically refreshed by Firebase SDK)
        const token = await getToken();
        if (!token) {
          router.push("/login");
          return;
        }
        
        // Fetch user profile from authenticated endpoint
        const userResponse = await fetch(API_ENDPOINTS.userProfile, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          // Profile API returns data directly (not wrapped in success/data)
          const profileData = userData.success ? userData.data : userData;
          
          if (profileData) {
            // Calculate profile completeness based on required fields
            const requiredFields = [
              'name',           // Required
              'email',          // Required
              'phone',          // Required
              'age',            // Required
              'organisation',   // Required
              'bio',            // Required
              'github_link',    // Required
              'linkedin_link',  // Required
              'resume_link'     // Required (file upload)
            ];
            
            let completed = 0;
            requiredFields.forEach((field) => {
              const value = profileData[field];
              // Check if field exists and is not null/empty
              if (value && value !== null && value !== '') {
                completed++;
              }
            });
            
            const percentage = Math.round((completed / requiredFields.length) * 100);
            setProfileCompleteness(percentage);

            // Fetch team data if user has a teamCode
            if (profileData.teamCode) {
              try {
                // Try the regular team endpoint first
                const teamResponse = await fetch(API_ENDPOINTS.getTeam(profileData.teamCode), {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                  }
                });

                if (teamResponse.ok) {
                  const teamData = await teamResponse.json();
                  if (teamData.success && teamData.data) {
                    setTeam(teamData.data);
                  }
                } else {
                  // If regular endpoint doesn't exist, try admin endpoint (might fail for non-admins)
                  const adminTeamResponse = await fetch(`/api/admin/teams/${profileData.teamCode}`, {
                    headers: {
                      'Authorization': `Bearer ${token}`,
                      'Content-Type': 'application/json'
                    }
                  });

                  if (adminTeamResponse.ok) {
                    const teamData = await adminTeamResponse.json();
                    if (teamData.success && teamData.data) {
                      setTeam(teamData.data);
                    }
                  }
                }
              } catch (error) {
                console.error('Error fetching team data:', error);
                // Team fetch failed, but we'll continue without team data
              }
            }
          } else {
            // If API doesn't return expected format, calculate from context user
            calculateProfileFromContext();
          }
        } else {
          // If API fails, calculate from context user
          calculateProfileFromContext();
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Calculate from context user as fallback
        calculateProfileFromContext();
      } finally {
        setIsLoading(false);
      }
    };

    // Fallback: Calculate from user context if API fails
    const calculateProfileFromContext = () => {
      const requiredFields = [
        'name',
        'email',
        'phone',
        'age',
        'organisation',
        'bio',
        'github_link',
        'linkedin_link',
        'resume_link'
      ];
      
      let completed = 0;
      requiredFields.forEach((field) => {
        const value = user[field as keyof typeof user];
        if (value && value !== null && value !== '') {
          completed++;
        }
      });
      
      setProfileCompleteness(Math.round((completed / requiredFields.length) * 100));
    };

    fetchData();
  }, [user, isAuthenticated, router]);

  const getTeamStatus = (): "none" | "in-team" | "submitted" | "under-review" | "shortlisted" | "confirmed" | "declined" => {
    if (!team) return "none";
    // Map teamStatus from API to component status
    const statusMap: Record<string, "none" | "in-team" | "submitted" | "under-review" | "shortlisted" | "confirmed" | "declined"> = {
      'pending': 'in-team',
      'submitted': 'submitted',
      'withdrawn': 'none',
      'shortlisted': 'shortlisted',
      'rsvped': 'confirmed',
      'rsvp_declined': 'declined',
    };
    return statusMap[team.teamStatus] || 'in-team';
  };

  const isTeamLead = (): boolean => {
    if (!team || !user) return false;
    // Check if user is the team lead by checking teamMembers array
    const userMember = team.teamMembers?.find((member: any) => member.uid === user.uid);
    return userMember?.role === 'Team Lead' || false;
  };

  const handleRSVP = (status: "confirmed" | "declined") => {
    setRsvpStatus(status);
    // TODO: Call API to update RSVP status
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-white" style={{ fontFamily: 'var(--font-body)' }}>Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const teamStatus = getTeamStatus();

  return (
    <div className="flex flex-col gap-[24px] max-w-[900px] w-full">
      <div className="flex flex-col gap-[12px] items-center text-center">
        <h1 className="text-[48px] text-white leading-[52px] tracking-[-1px]" style={{ fontFamily: 'var(--font-heading)' }}>
          Welcome back, {user.name}!
        </h1>
        <p className="text-[15.9px] text-white opacity-90 leading-[23.8px]" style={{ fontFamily: 'var(--font-body)' }}>
          Manage your profile, team, and submissions from your dashboard.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex flex-wrap gap-[12px] justify-center">
        <Button onClick={() => onNavigate("dashboard")} variant="primary">
          <Home className="w-4 h-4" />
          Dashboard
        </Button>
        <Button onClick={() => onNavigate("profile")} variant="secondary">
          <UserCircle className="w-4 h-4" />
          Profile
        </Button>
        <Button onClick={() => onNavigate("team")} variant="secondary">
          <Users className="w-4 h-4" />
          Team
        </Button>
        {team && isTeamLead() && getTeamStatus() === "in-team" && (
          <Button onClick={() => onNavigate("submission")} variant="secondary">
            <FileText className="w-4 h-4" />
            Submit Project
          </Button>
        )}
      </div>

      {/* Profile Completeness */}
      <FormSection
        title="Profile Status"
        status={
          <StatusBadge
            status={profileCompleteness === 100 ? "Completed" : "Pending"}
            icon={profileCompleteness === 100 ? CheckCircle : Clock}
          />
        }
      >
        <div className="flex flex-col gap-[12px]">
          <div className="flex justify-between items-center">
            <span className="text-[14px] text-white" style={{ fontFamily: 'var(--font-body)' }}>
              Profile Completeness
            </span>
            <span className="text-[14px] text-white" style={{ fontFamily: 'var(--font-body)' }}>
              {profileCompleteness}%
            </span>
          </div>
          <div className="w-full bg-[rgba(138,138,138,0.2)] rounded-full h-[8px] overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#ff4d00] to-[#ff8800] h-full transition-all duration-500"
              style={{ width: `${profileCompleteness}%` }}
            />
          </div>
          {profileCompleteness < 100 && (
            <Button onClick={() => onNavigate("profile")} variant="secondary">
              Complete Profile
            </Button>
          )}
        </div>
      </FormSection>

      {/* Team Status */}
      <FormSection
        title="Team Status"
        status={
          <StatusBadge
            status={teamStatus}
            icon={
              teamStatus === "none"
                ? AlertCircle
                : teamStatus === "shortlisted" || teamStatus === "confirmed"
                ? Award
                : Users
            }
          />
        }
      >
        <div className="flex flex-col gap-[16px]">
          {teamStatus === "none" ? (
            <>
              <p className="text-[14px] text-white opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
                You're not part of a team yet. Create or join a team to participate in the hackathon.
              </p>
              <div className="flex gap-[12px]">
                <Button onClick={() => onNavigate("team")} variant="primary">
                  <Users className="w-4 h-4" />
                  Create / Join Team
                </Button>
                <Button onClick={() => onNavigate("discover")} variant="secondary">
                  <Search className="w-4 h-4" />
                  Discover Teams
                </Button>
              </div>
            </>
          ) : team ? (
            <>
              <div className="flex flex-col gap-[8px]">
                <div className="flex justify-between">
                  <span className="text-[14px] text-white opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
                    Team Name
                  </span>
                  <span className="text-[14px] text-white" style={{ fontFamily: 'var(--font-body)' }}>
                    {team.teamName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-white opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
                    Team Code
                  </span>
                  <span className="text-[14px] text-white font-mono" style={{ fontFamily: 'var(--font-body)' }}>
                    {team.teamCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-white opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
                    Members
                  </span>
                  <span className="text-[14px] text-white" style={{ fontFamily: 'var(--font-body)' }}>
                    {team.memberCount} / 4
                  </span>
                </div>
                {team.appliedFor && (
                  <div className="flex justify-between">
                    <span className="text-[14px] text-white opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
                      Problem Statement
                    </span>
                    <span className="text-[14px] text-white" style={{ fontFamily: 'var(--font-body)' }}>
                      {team.appliedFor.title}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[14px] text-white opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
                    Your Role
                  </span>
                  <span className="text-[14px] text-white" style={{ fontFamily: 'var(--font-body)' }}>
                    {isTeamLead() ? "Team Lead" : "Member"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[14px] text-white opacity-80" style={{ fontFamily: 'var(--font-body)' }}>
                    Team Status
                  </span>
                  <span className="text-[14px] text-white capitalize" style={{ fontFamily: 'var(--font-body)' }}>
                    {team.teamStatus}
                  </span>
                </div>
              </div>

              {teamStatus === "in-team" && isTeamLead() && (
                <Button onClick={() => onNavigate("submission")} variant="primary">
                  <FileText className="w-4 h-4" />
                  Submit Project
                </Button>
              )}

              {teamStatus === "submitted" && (
                <AlertBanner type="success" message="Project submitted! Waiting for evaluation." />
              )}

              {teamStatus === "under-review" && (
                <AlertBanner type="warning" message="Your project is under review by evaluators." />
              )}

              {teamStatus === "shortlisted" && rsvpStatus === "pending" && (
                <div className="flex flex-col gap-[12px]">
                  <AlertBanner type="success" message="🎉 Congratulations! Your team has been shortlisted!" />
                  <p className="text-[14px] text-white" style={{ fontFamily: 'var(--font-body)' }}>
                    Please confirm your participation:
                  </p>
                  <div className="flex gap-[12px]">
                    <Button onClick={() => handleRSVP("confirmed")} variant="primary">
                      <Check className="w-4 h-4" />
                      Confirm Participation
                    </Button>
                    <Button onClick={() => handleRSVP("declined")} variant="danger">
                      <X className="w-4 h-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              )}

              {teamStatus === "confirmed" && (
                <AlertBanner type="success" message="✅ RSVP Confirmed! See you at the event!" />
              )}

              <Button onClick={() => onNavigate("team")} variant="secondary">
                View Team Details
              </Button>
            </>
          ) : null}
        </div>
      </FormSection>

      {/* Quick Actions */}
      <FormSection title="Quick Actions">
        <div className="grid grid-cols-2 gap-[12px]">
          <Button onClick={() => onNavigate("profile")} variant="secondary">
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
          <Button onClick={() => onNavigate("discover")} variant="secondary">
            <Search className="w-4 h-4" />
            Discover
          </Button>
          {!team && (
            <Button onClick={() => onNavigate("team")} variant="secondary">
              <Users className="w-4 h-4" />
              Team Management
            </Button>
          )}
          {team && isTeamLead() && (
            <Button onClick={() => onNavigate("submission")} variant="secondary">
              <Upload className="w-4 h-4" />
              {team.teamStatus === "submitted" ? "Update Submission" : "Submit Project"}
            </Button>
          )}
        </div>
      </FormSection>
    </div>
  );
}

