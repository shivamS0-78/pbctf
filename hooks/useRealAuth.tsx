"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_ENDPOINTS, getApiUrl } from '@/lib/api-config';

interface AuthUser {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  organisation?: string;
  bio?: string;
  github_link?: string;
  linkedin_link?: string;
  portfolio_link?: string;
  resume_link?: string;
  profile_picture?: string;
  isAdmin?: boolean;
  teamId?: string;
  isLooking?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function RealAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        const storedToken = localStorage.getItem('authToken');
        
        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.login), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 401) {
          throw new Error(data.message || 'Invalid email or password.');
        } else if (response.status === 404) {
          throw new Error(data.message || 'Account not found. Please register first.');
        } else if (response.status === 500) {
          throw new Error(data.message || 'Server error. Please try again later.');
        } else {
          throw new Error(data.message || 'Login failed. Please try again.');
        }
      }

      if (data.status !== 'success') {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      // Store token and user data
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('authUser', JSON.stringify(data.user));
      
      setUser(data.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (formData: FormData) => {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.register), {
        method: 'POST',
        body: formData, // Send as FormData for file uploads
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 400) {
          throw new Error(data.message || 'Invalid registration data. Please check all fields.');
        } else if (response.status === 409) {
          throw new Error(data.message || 'Email already registered. Please login instead.');
        } else if (response.status === 500) {
          throw new Error(data.message || 'Server error. Please try again later.');
        } else {
          throw new Error(data.message || 'Registration failed. Please try again.');
        }
      }

      // Backend returns: { message, uid, status: "pending_verification", user }
      // Handle successful registration (even if status is pending_verification)
      if (data.message && data.message.toLowerCase().includes('success')) {
        // Store user data (no token yet - will get it on email verification or login)
        if (data.user) {
          localStorage.setItem('authUser', JSON.stringify(data.user));
          setUser(data.user);
        }
        
        // Check if token is provided (for auto-login)
        if (data.token) {
          localStorage.setItem('authToken', data.token);
        }
        
        return; // Success
      }

      // If we got here, registration wasn't successful
      throw new Error(data.message || 'Registration failed. Please try again.');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setUser(null);
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(getApiUrl(API_ENDPOINTS.getUser(user.uid)), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        localStorage.setItem('authUser', JSON.stringify(data.user));
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useRealAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useRealAuth must be used within a RealAuthProvider');
  }
  return context;
}

