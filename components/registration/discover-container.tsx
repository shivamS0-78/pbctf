"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/hooks/use-auth';
import { API_ENDPOINTS } from "@/lib/api-config";
import { Users, Search, X, User, Mail, Phone, Building, FileText, Github, Linkedin, ExternalLink } from "lucide-react";
import { FormSection } from "./form-section";
import { Button } from "./button";
import { Card } from "./card";
import { SectionTab } from "./section-tab";

interface DiscoverContainerProps {
  onNavigate: (view: string) => void;
}

interface TeamLookingForMembers {
  teamName: string;
  teamCode: string;
  problemStatement: string;
  currentMembers: number;
  maxMembers: number;
  teamLead?: {
    id: string;
    name: string;
  };
  teamMembers?: Array<{
    id: string;
    name: string;
    organisation?: string;
  }>;
  appliedFor?: {
    id: string;
    title: string;
  };
}

interface ParticipantLookingForTeam {
  id: string; // uid
  name: string;
  skills: string;
  interests: string;
  university?: string;
}

interface TeamDetails {
  teamCode: string;
  teamName: string;
  teamLead: {
    id?: string;
    uid?: string;
    name: string;
    email?: string;
    phone?: string;
    organisation?: string;
  };
  teamMembers: Array<{
    uid: string;
    name: string;
    email?: string;
    role: string;
  }>;
  appliedFor?: {
    id: string;
    title: string;
  };
  memberCount: number;
  maxMembers: number;
  teamStatus: string;
}

interface UserDetails {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  organisation?: string;
  bio?: string;
  profile_picture?: string;
  resume_link?: string;
  github_link?: string;
  linkedin_link?: string;
  leetcode_profile?: string;
  codeforces_link?: string;
  kaggle_link?: string;
  devfolio_link?: string;
  portfolio_link?: string;
  ctf_profile?: string;
  age?: number;
}

export function DiscoverContainer({ onNavigate }: DiscoverContainerProps) {
  const { user, getToken } = useAuth();
  const [activeTab, setActiveTab] = useState<"teams" | "participants">("teams");
  const [teamsLookingForMembers, setTeamsLookingForMembers] = useState<TeamLookingForMembers[]>([]);
  const [participantsLookingForTeams, setParticipantsLookingForTeams] = useState<ParticipantLookingForTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRequests, setUserRequests] = useState<Record<string, string>>({}); // teamCode -> requestStatus
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  
  // Modal states
  const [selectedTeamCode, setSelectedTeamCode] = useState<string | null>(null);
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [isLoadingTeam, setIsLoadingTeam] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(false);
  const [teamError, setTeamError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Fetch teams looking for members
        const teamsResponse = await fetch(API_ENDPOINTS.lookingForMembers, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (teamsResponse.ok) {
          const teamsData = await teamsResponse.json();
          if (teamsData.success && teamsData.data && Array.isArray(teamsData.data.teams)) {
            // Transform API response to match component interface - store all available data
            const transformed = teamsData.data.teams.map((team: any) => ({
              teamName: team.teamName,
              teamCode: team.teamCode,
              problemStatement: team.appliedFor?.title || 'No problem statement selected',
              currentMembers: team.currentMemberCount || 0,
              maxMembers: team.maxMembers || 4,
              teamLead: team.teamLead,
              teamMembers: team.teamMembers,
              appliedFor: team.appliedFor,
            }));
            setTeamsLookingForMembers(transformed);
          } else {
            setTeamsLookingForMembers([]);
          }
        }

        // Fetch participants looking for teams
        const participantsResponse = await fetch(API_ENDPOINTS.lookingForTeam, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (participantsResponse.ok) {
          const participantsData = await participantsResponse.json();
          if (participantsData.success && participantsData.data && Array.isArray(participantsData.data.users)) {
            // Transform API response to match component interface
            const transformed = participantsData.data.users.map((user: any) => ({
              id: user.id, // Store uid for fetching details
              name: user.name,
              skills: user.bio || 'No skills listed',
              interests: user.bio || 'No interests listed',
              university: user.organisation || undefined,
            }));
            setParticipantsLookingForTeams(transformed);
          } else {
            setParticipantsLookingForTeams([]);
          }
        }

        // Fetch user's join requests
        const requestsResponse = await fetch(`${API_ENDPOINTS.joinRequest}?type=user`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (requestsResponse.ok) {
          const requestsData = await requestsResponse.json();
          if (requestsData.success && requestsData.data && Array.isArray(requestsData.data.requests)) {
            const requestsMap: Record<string, string> = {};
            requestsData.data.requests.forEach((req: any) => {
              // Only track pending and accepted requests
              // Declined/cancelled requests are ignored so user can send a new request
              if (req.status === 'pending' || req.status === 'accepted') {
                requestsMap[req.teamCode] = req.status;
              }
            });
            setUserRequests(requestsMap);
          }
        }
      } catch (error) {
        console.error('Failed to fetch discover data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [getToken]);

  const handleSendRequest = async (teamCode: string, e?: React.MouseEvent) => {
    if (!user) return;
    e?.stopPropagation(); // Prevent opening team modal when clicking button

    try {
      setSendingRequest(teamCode);
      const token = await getToken();
      if (!token) return;

      const response = await fetch(API_ENDPOINTS.joinRequest, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ teamCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send request');
      }

      // Update user requests map
      setUserRequests(prev => ({ ...prev, [teamCode]: 'pending' }));
    } catch (error) {
      console.error('Error sending join request:', error);
      alert(error instanceof Error ? error.message : 'Failed to send request');
    } finally {
      setSendingRequest(null);
    }
  };

  const handleTeamClick = async (teamCode: string) => {
    setSelectedTeamCode(teamCode);
    setIsLoadingTeam(true);
    setTeamError(null);
    
    // First, try to use the basic data we already have from the looking-for-members endpoint
    const basicTeamData = teamsLookingForMembers.find(t => t.teamCode === teamCode);
    
    // Try to fetch full team details (will fail if user is not a member)
    try {
      const token = await getToken();
      if (!token) {
        // If no token, use basic data
        if (basicTeamData) {
          const basicDetails: TeamDetails = {
            teamCode: basicTeamData.teamCode,
            teamName: basicTeamData.teamName,
            teamLead: basicTeamData.teamLead || { id: '', name: 'Unknown' },
            teamMembers: basicTeamData.teamMembers?.map(m => ({
              uid: m.id,
              name: m.name,
              role: 'Member',
            })) || [],
            appliedFor: basicTeamData.appliedFor,
            memberCount: basicTeamData.currentMembers,
            maxMembers: basicTeamData.maxMembers,
            teamStatus: 'pending',
          };
          setTeamDetails(basicDetails);
        } else {
          setTeamError('Authentication required');
        }
        setIsLoadingTeam(false);
        return;
      }

      const response = await fetch(API_ENDPOINTS.getTeam(teamCode), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setTeamDetails(data.data);
          setTeamError(null);
        } else {
          // Fallback to basic data
          if (basicTeamData) {
            const basicDetails: TeamDetails = {
              teamCode: basicTeamData.teamCode,
              teamName: basicTeamData.teamName,
              teamLead: basicTeamData.teamLead || { id: '', name: 'Unknown' },
              teamMembers: basicTeamData.teamMembers?.map(m => ({
                uid: m.id,
                name: m.name,
                role: 'Member',
              })) || [],
              appliedFor: basicTeamData.appliedFor,
              memberCount: basicTeamData.currentMembers,
              maxMembers: basicTeamData.maxMembers,
              teamStatus: 'pending',
            };
            setTeamDetails(basicDetails);
          } else {
            setTeamError('Failed to load team details');
          }
        }
      } else {
        // If API fails (e.g., user is not a member), use basic data if available
        if (basicTeamData) {
          const basicDetails: TeamDetails = {
            teamCode: basicTeamData.teamCode,
            teamName: basicTeamData.teamName,
            teamLead: basicTeamData.teamLead || { id: '', name: 'Unknown' },
            teamMembers: basicTeamData.teamMembers?.map(m => ({
              uid: m.id,
              name: m.name,
              role: 'Member',
            })) || [],
            appliedFor: basicTeamData.appliedFor,
            memberCount: basicTeamData.currentMembers,
            maxMembers: basicTeamData.maxMembers,
            teamStatus: 'pending',
          };
          setTeamDetails(basicDetails);
          setTeamError(null);
        } else {
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.message || 'Failed to fetch team details';
          setTeamError(errorMessage);
        }
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
      // Fallback to basic data if available
      if (basicTeamData) {
        const basicDetails: TeamDetails = {
          teamCode: basicTeamData.teamCode,
          teamName: basicTeamData.teamName,
          teamLead: basicTeamData.teamLead || { id: '', name: 'Unknown' },
          teamMembers: basicTeamData.teamMembers?.map(m => ({
            uid: m.id,
            name: m.name,
            role: 'Member',
          })) || [],
          appliedFor: basicTeamData.appliedFor,
          memberCount: basicTeamData.currentMembers,
          maxMembers: basicTeamData.maxMembers,
          teamStatus: 'pending',
        };
        setTeamDetails(basicDetails);
      } else {
        setTeamError('Network error. Please try again.');
      }
    } finally {
      setIsLoadingTeam(false);
    }
  };

  const handleCloseTeamModal = () => {
    setSelectedTeamCode(null);
    setTeamDetails(null);
    setTeamError(null);
    // Also close user modal if open
    setSelectedUserId(null);
    setUserDetails(null);
  };

  const handleUserClick = async (userId: string, e?: React.MouseEvent) => {
    e?.stopPropagation(); // Prevent closing team modal
    setSelectedUserId(userId);
    setIsLoadingUser(true);
    
    try {
      const token = await getToken();
      if (!token) return;

      const response = await fetch(`/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.user) {
          setUserDetails(data.user);
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleCloseUserModal = () => {
    setSelectedUserId(null);
    setUserDetails(null);
  };

  return (
    <div className="flex flex-col gap-[24px] w-full">
      <FormSection title="Discover">
        <div className="flex flex-col gap-[24px]">
          {/* Tab Navigation */}
          <div className="flex gap-[12px]">
            <SectionTab
              active={activeTab === "teams"}
              onClick={() => setActiveTab("teams")}
              icon={Users}
              label="Teams Looking for Members"
            />
            <SectionTab
              active={activeTab === "participants"}
              onClick={() => setActiveTab("participants")}
              icon={Search}
              label="Participants Looking for Teams"
            />
          </div>

          {/* Tab Content */}
          {activeTab === "teams" ? (
            <div>
              {isLoading ? (
                <div className="text-white text-center py-[40px]">Loading teams...</div>
              ) : Array.isArray(teamsLookingForMembers) && teamsLookingForMembers.length === 0 ? (
                <div className="text-white text-center py-[40px] opacity-70">
                  No teams are currently looking for members.
                </div>
              ) : Array.isArray(teamsLookingForMembers) && teamsLookingForMembers.length > 0 ? (
                <div className="flex flex-col gap-[16px]">
                  {teamsLookingForMembers.map((team, idx) => (
                    <Card key={idx}>
                      <div 
                        className="flex items-start justify-between cursor-pointer"
                        onClick={() => handleTeamClick(team.teamCode)}
                      >
                        <div className="flex-1">
                          <h3 className="font-['Inter',sans-serif] text-[16px] text-white mb-[4px]">{team.teamName}</h3>
                          <p className="font-['Inter',sans-serif] text-[13px] text-white opacity-70 mb-[8px]">
                            Problem: {team.problemStatement}
                          </p>
                          <div className="flex items-center gap-[12px]">
                            <span className="font-['Inter',sans-serif] text-[12px] text-white opacity-60">
                              {team.currentMembers}/{team.maxMembers} members
                            </span>
                            <span className="font-['Inter',sans-serif] text-[12px] text-white opacity-60">
                              Code: <span className="font-mono text-[#ff4d00]">{team.teamCode}</span>
                            </span>
                          </div>
                        </div>
                        {userRequests[team.teamCode] === 'pending' ? (
                          <Button 
                            variant="secondary"
                            disabled
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Users className="w-4 h-4" />
                            Request Sent
                          </Button>
                        ) : userRequests[team.teamCode] === 'accepted' ? (
                          <Button 
                            variant="secondary"
                            disabled
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Users className="w-4 h-4" />
                            Accepted
                          </Button>
                        ) : userRequests[team.teamCode] === 'declined' ? (
                          <Button 
                            variant="secondary"
                            onClick={(e) => handleSendRequest(team.teamCode, e)}
                            disabled={sendingRequest === team.teamCode}
                          >
                            <Users className="w-4 h-4" />
                            {sendingRequest === team.teamCode ? 'Sending...' : 'Send Request'}
                          </Button>
                        ) : (
                          <Button 
                            variant="secondary"
                            onClick={(e) => handleSendRequest(team.teamCode, e)}
                            disabled={sendingRequest === team.teamCode}
                          >
                            <Users className="w-4 h-4" />
                            {sendingRequest === team.teamCode ? 'Sending...' : 'Send Request'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-white text-center py-[40px] opacity-70">
                  No teams are currently looking for members.
                </div>
              )}
            </div>
          ) : (
            <div>
              {isLoading ? (
                <div className="text-white text-center py-[40px]">Loading participants...</div>
              ) : Array.isArray(participantsLookingForTeams) && participantsLookingForTeams.length === 0 ? (
                <div className="text-white text-center py-[40px] opacity-70">
                  No participants are currently looking for teams.
                </div>
              ) : Array.isArray(participantsLookingForTeams) && participantsLookingForTeams.length > 0 ? (
                <div className="flex flex-col gap-[16px]">
                  {participantsLookingForTeams.map((participant, idx) => (
                    <Card key={idx}>
                      <div 
                        className="flex flex-col gap-[8px] cursor-pointer"
                        onClick={() => handleUserClick(participant.id)}
                      >
                        <div className="flex items-start justify-between">
                          <h3 className="font-['Inter',sans-serif] text-[16px] text-white">{participant.name}</h3>
                          {participant.university && (
                            <span className="font-['Inter',sans-serif] text-[12px] text-white opacity-60">{participant.university}</span>
                          )}
                        </div>
                        <p className="font-['Inter',sans-serif] text-[13px] text-white opacity-70">
                          Skills: {participant.skills}
                        </p>
                        <p className="font-['Inter',sans-serif] text-[13px] text-white opacity-70">
                          Interests: {participant.interests}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-white text-center py-[40px] opacity-70">
                  No participants are currently looking for teams.
                </div>
              )}
            </div>
          )}
        </div>
      </FormSection>

      {/* Team Details Modal */}
      {selectedTeamCode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseTeamModal}
          />
          
          {/* Modal Content */}
          <div className="relative z-[101] w-full max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-[2.5px] backdrop-filter bg-[rgba(138,138,138,0.15)] rounded-[20px] p-[32px] border border-[rgba(255,255,255,0.2)]">
            <div className="flex items-center justify-between mb-[24px]">
              <h2 className="text-[28px] text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Team Details
              </h2>
              <button
                onClick={handleCloseTeamModal}
                className="text-white opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isLoadingTeam ? (
              <div className="text-white text-center py-[40px]">Loading team details...</div>
            ) : teamError ? (
              <div className="text-white text-center py-[40px]">
                <p className="text-red-400 mb-[8px]">Error loading team details</p>
                <p className="text-white opacity-70 text-[14px]">{teamError}</p>
              </div>
            ) : teamDetails && teamDetails.teamName ? (
              <div className="flex flex-col gap-[24px]">
                <div>
                  <h3 className="font-['Inter',sans-serif] text-[20px] text-white mb-[8px]">{teamDetails.teamName}</h3>
                  <p className="font-['Inter',sans-serif] text-[14px] text-white opacity-70">
                    Team Code: <span className="font-mono text-[#ff4d00]">{teamDetails.teamCode}</span>
                  </p>
                  {teamDetails.appliedFor && (
                    <p className="font-['Inter',sans-serif] text-[14px] text-white opacity-70 mt-[4px]">
                      Problem Statement: {teamDetails.appliedFor.title}
                    </p>
                  )}
                  <p className="font-['Inter',sans-serif] text-[14px] text-white opacity-70 mt-[4px]">
                    Members: {teamDetails.memberCount || (teamDetails.teamMembers?.length || 0)}/{teamDetails.maxMembers || 4}
                  </p>
                </div>

                <div>
                  <h4 className="font-['Inter',sans-serif] text-[16px] text-white mb-[12px]">Team Lead</h4>
                  <div 
                    className="p-[12px] bg-[rgba(138,138,138,0.1)] rounded-[8px] border border-[rgba(255,255,255,0.1)] cursor-pointer hover:bg-[rgba(138,138,138,0.2)] transition-colors"
                    onClick={(e) => {
                      const leadId = teamDetails.teamLead.uid || teamDetails.teamLead.id;
                      if (leadId) {
                        handleUserClick(leadId, e);
                      }
                    }}
                  >
                    <div className="flex items-center gap-[8px]">
                      <User className="w-4 h-4 text-white opacity-70" />
                      <span className="font-['Inter',sans-serif] text-[14px] text-white">{teamDetails.teamLead.name}</span>
                      {teamDetails.teamLead.email && (
                        <span className="font-['Inter',sans-serif] text-[12px] text-white opacity-60 ml-auto">
                          {teamDetails.teamLead.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {teamDetails.teamMembers && teamDetails.teamMembers.length > 0 && (
                  <div>
                    <h4 className="font-['Inter',sans-serif] text-[16px] text-white mb-[12px]">Team Members</h4>
                    <div className="flex flex-col gap-[8px]">
                      {teamDetails.teamMembers.map((member) => (
                        <div
                          key={member.uid}
                          className="p-[12px] bg-[rgba(138,138,138,0.1)] rounded-[8px] border border-[rgba(255,255,255,0.1)] cursor-pointer hover:bg-[rgba(138,138,138,0.2)] transition-colors"
                          onClick={(e) => handleUserClick(member.uid, e)}
                        >
                          <div className="flex items-center gap-[8px]">
                            <User className="w-4 h-4 text-white opacity-70" />
                            <span className="font-['Inter',sans-serif] text-[14px] text-white">{member.name}</span>
                            <span className="font-['Inter',sans-serif] text-[12px] text-white opacity-60">
                              ({member.role})
                            </span>
                            {member.email && (
                              <span className="font-['Inter',sans-serif] text-[12px] text-white opacity-60 ml-auto">
                                {member.email}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white text-center py-[40px]">Failed to load team details</div>
            )}
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseUserModal}
          />
          
          {/* Modal Content */}
          <div className="relative z-[111] w-full max-w-2xl max-h-[90vh] overflow-y-auto backdrop-blur-[2.5px] backdrop-filter bg-[rgba(138,138,138,0.15)] rounded-[20px] p-[32px] border border-[rgba(255,255,255,0.2)]">
            <div className="flex items-center justify-between mb-[24px]">
              <h2 className="text-[28px] text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                User Profile
              </h2>
              <button
                onClick={handleCloseUserModal}
                className="text-white opacity-70 hover:opacity-100 transition-opacity"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isLoadingUser ? (
              <div className="text-white text-center py-[40px]">Loading user details...</div>
            ) : userDetails ? (
              <div className="flex flex-col gap-[24px]">
                <div className="flex items-start gap-[16px]">
                  {userDetails.profile_picture ? (
                    <img 
                      src={userDetails.profile_picture} 
                      alt={userDetails.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-[rgba(255,255,255,0.2)]"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-[rgba(138,138,138,0.2)] border-2 border-[rgba(255,255,255,0.2)] flex items-center justify-center">
                      <User className="w-10 h-10 text-white opacity-50" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-['Inter',sans-serif] text-[20px] text-white mb-[4px]">{userDetails.name}</h3>
                    {userDetails.email && (
                      <div className="flex items-center gap-[8px] mb-[4px]">
                        <Mail className="w-4 h-4 text-white opacity-60" />
                        <span className="font-['Inter',sans-serif] text-[14px] text-white opacity-70">{userDetails.email}</span>
                      </div>
                    )}
                    {userDetails.phone && (
                      <div className="flex items-center gap-[8px] mb-[4px]">
                        <Phone className="w-4 h-4 text-white opacity-60" />
                        <span className="font-['Inter',sans-serif] text-[14px] text-white opacity-70">{userDetails.phone}</span>
                      </div>
                    )}
                    {userDetails.organisation && (
                      <div className="flex items-center gap-[8px]">
                        <Building className="w-4 h-4 text-white opacity-60" />
                        <span className="font-['Inter',sans-serif] text-[14px] text-white opacity-70">{userDetails.organisation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {userDetails.bio && (
                  <div>
                    <h4 className="font-['Inter',sans-serif] text-[16px] text-white mb-[8px]">Bio</h4>
                    <p className="font-['Inter',sans-serif] text-[14px] text-white opacity-70">{userDetails.bio}</p>
                  </div>
                )}

                {(userDetails.github_link || userDetails.linkedin_link || userDetails.resume_link || 
                  userDetails.leetcode_profile || userDetails.codeforces_link || userDetails.kaggle_link ||
                  userDetails.devfolio_link || userDetails.portfolio_link || userDetails.ctf_profile) && (
                  <div>
                    <h4 className="font-['Inter',sans-serif] text-[16px] text-white mb-[12px]">Links & Profiles</h4>
                    <div className="flex flex-col gap-[8px]">
                      {userDetails.github_link && (
                        <a 
                          href={userDetails.github_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-[8px] p-[8px] bg-[rgba(138,138,138,0.1)] rounded-[8px] hover:bg-[rgba(138,138,138,0.2)] transition-colors"
                        >
                          <Github className="w-4 h-4 text-white opacity-70" />
                          <span className="font-['Inter',sans-serif] text-[14px] text-white">GitHub</span>
                          <ExternalLink className="w-3 h-3 text-white opacity-50 ml-auto" />
                        </a>
                      )}
                      {userDetails.linkedin_link && (
                        <a 
                          href={userDetails.linkedin_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-[8px] p-[8px] bg-[rgba(138,138,138,0.1)] rounded-[8px] hover:bg-[rgba(138,138,138,0.2)] transition-colors"
                        >
                          <Linkedin className="w-4 h-4 text-white opacity-70" />
                          <span className="font-['Inter',sans-serif] text-[14px] text-white">LinkedIn</span>
                          <ExternalLink className="w-3 h-3 text-white opacity-50 ml-auto" />
                        </a>
                      )}
                      {userDetails.resume_link && (
                        <a 
                          href={userDetails.resume_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-[8px] p-[8px] bg-[rgba(138,138,138,0.1)] rounded-[8px] hover:bg-[rgba(138,138,138,0.2)] transition-colors"
                        >
                          <FileText className="w-4 h-4 text-white opacity-70" />
                          <span className="font-['Inter',sans-serif] text-[14px] text-white">Resume</span>
                          <ExternalLink className="w-3 h-3 text-white opacity-50 ml-auto" />
                        </a>
                      )}
                      {userDetails.leetcode_profile && (
                        <a 
                          href={userDetails.leetcode_profile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-[8px] p-[8px] bg-[rgba(138,138,138,0.1)] rounded-[8px] hover:bg-[rgba(138,138,138,0.2)] transition-colors"
                        >
                          <span className="font-['Inter',sans-serif] text-[14px] text-white">LeetCode</span>
                          <ExternalLink className="w-3 h-3 text-white opacity-50 ml-auto" />
                        </a>
                      )}
                      {userDetails.codeforces_link && (
                        <a 
                          href={userDetails.codeforces_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-[8px] p-[8px] bg-[rgba(138,138,138,0.1)] rounded-[8px] hover:bg-[rgba(138,138,138,0.2)] transition-colors"
                        >
                          <span className="font-['Inter',sans-serif] text-[14px] text-white">Codeforces</span>
                          <ExternalLink className="w-3 h-3 text-white opacity-50 ml-auto" />
                        </a>
                      )}
                      {userDetails.kaggle_link && (
                        <a 
                          href={userDetails.kaggle_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-[8px] p-[8px] bg-[rgba(138,138,138,0.1)] rounded-[8px] hover:bg-[rgba(138,138,138,0.2)] transition-colors"
                        >
                          <span className="font-['Inter',sans-serif] text-[14px] text-white">Kaggle</span>
                          <ExternalLink className="w-3 h-3 text-white opacity-50 ml-auto" />
                        </a>
                      )}
                      {userDetails.devfolio_link && (
                        <a 
                          href={userDetails.devfolio_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-[8px] p-[8px] bg-[rgba(138,138,138,0.1)] rounded-[8px] hover:bg-[rgba(138,138,138,0.2)] transition-colors"
                        >
                          <span className="font-['Inter',sans-serif] text-[14px] text-white">Devfolio</span>
                          <ExternalLink className="w-3 h-3 text-white opacity-50 ml-auto" />
                        </a>
                      )}
                      {userDetails.portfolio_link && (
                        <a 
                          href={userDetails.portfolio_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-[8px] p-[8px] bg-[rgba(138,138,138,0.1)] rounded-[8px] hover:bg-[rgba(138,138,138,0.2)] transition-colors"
                        >
                          <span className="font-['Inter',sans-serif] text-[14px] text-white">Portfolio</span>
                          <ExternalLink className="w-3 h-3 text-white opacity-50 ml-auto" />
                        </a>
                      )}
                      {userDetails.ctf_profile && (
                        <a 
                          href={userDetails.ctf_profile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-[8px] p-[8px] bg-[rgba(138,138,138,0.1)] rounded-[8px] hover:bg-[rgba(138,138,138,0.2)] transition-colors"
                        >
                          <span className="font-['Inter',sans-serif] text-[14px] text-white">CTF Profile</span>
                          <ExternalLink className="w-3 h-3 text-white opacity-50 ml-auto" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-white text-center py-[40px]">Failed to load user details</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

