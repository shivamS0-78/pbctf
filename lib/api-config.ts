/**
 * API Configuration - PRODUCTION ONLY
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const API_ENDPOINTS = {
  // Auth
  register: '/api/registration',
  login: '/api/auth/login',
  
  // Users
  getUser: (userId: string) => `/api/users/${userId}`,
  updateUser: (userId: string) => `/api/users/${userId}`,
  updateUserStatus: (userId: string) => `/api/users/${userId}/status`,
  
  // Teams
  createTeam: '/api/teams',
  getTeam: (teamId: string) => `/api/teams/${teamId}`,
  joinTeam: '/api/teams/join',
  leaveTeam: (teamId: string) => `/api/teams/${teamId}/leave`,
  removeTeamMember: (teamId: string, memberId: string) => `/api/teams/${teamId}/members/${memberId}`,
  
  // Submissions
  submitProject: (teamId: string) => `/api/teams/${teamId}/submission`,
  
  // Validation
  validateStep: '/api/validate-step'
};

// Helper function to build full API URL
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}

