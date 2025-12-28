"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';
import { getAuthToken, signIn as firebaseSignIn, signOutUser, getCurrentUser, onAuthStateChanged } from '@/lib/firebase-client';

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
  teamCode?: string;  // Added from API response
  isLooking?: boolean;
  role?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function RealAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch user profile from backend
        try {
          const token = await firebaseUser.getIdToken();
          const response = await fetch(API_ENDPOINTS.userProfile, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              setUser(data.data);
            }
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Call backend login endpoint
      const response = await fetch(API_ENDPOINTS.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
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

      if (data.status !== 'success' || !data.token) {
        throw new Error(data.message || 'Login failed. Please try again.');
      }

      // Now sign in to Firebase with email/password
      // This will trigger onAuthStateChanged which will fetch the profile
      await firebaseSignIn(email, password);
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (formData: FormData) => {
    try {
      const response = await fetch(API_ENDPOINTS.register, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
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

      // Registration successful
      if (data.message && data.message.toLowerCase().includes('success')) {
        // Now log the user in to Firebase with the credentials from formData
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        if (email && password) {
          // Sign in to Firebase - this will trigger onAuthStateChanged
          await firebaseSignIn(email, password);
        } else {
          // If we don't have credentials, just set the user data
          if (data.user) {
            setUser(data.user);
          }
        }
        
        return;
      }

      throw new Error(data.message || 'Registration failed. Please try again.');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      const token = await getAuthToken();
      if (!token) return;
      
      const response = await fetch(API_ENDPOINTS.userProfile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      const data = await response.json();

      if (response.ok && data.success && data.data) {
        setUser(data.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const getToken = async (): Promise<string | null> => {
    return await getAuthToken();
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
        getToken,
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

