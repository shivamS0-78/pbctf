"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface MockUser {
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
  leetcode_profile?: string;
  kaggle_link?: string;
  devfolio_link?: string;
  resume_link?: string;
  profile_picture?: string;
  teamId?: string;
  isAdmin?: boolean;
  isLooking?: boolean;
}

interface MockAuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined);

export function MockAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('mockUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if user exists in localStorage
    const storedUsers = localStorage.getItem('mockUsers');
    let users: any[] = [];
    
    if (storedUsers) {
      users = JSON.parse(storedUsers);
    }
    
    const foundUser = users.find((u: any) => u.email === email);
    
    if (!foundUser) {
      throw new Error('User not found. Please register first.');
    }
    
    if (foundUser.password !== password) {
      throw new Error('Invalid password');
    }
    
    // Remove password before storing in current user
    const { password: _, ...userWithoutPassword } = foundUser;
    
    setUser(userWithoutPassword);
    localStorage.setItem('mockUser', JSON.stringify(userWithoutPassword));
  };

  const register = async (formData: FormData | any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let userData: any;
    
    if (formData instanceof FormData) {
      userData = {
        uid: Date.now().toString(),
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        phone: formData.get('phone'),
        age: parseInt(formData.get('age') as string),
        organisation: formData.get('organisation'),
        bio: formData.get('bio'),
        github_link: formData.get('github_link'),
        linkedin_link: formData.get('linkedin_link'),
        portfolio_link: formData.get('portfolio_link'),
        leetcode_profile: formData.get('leetcode_profile'),
        kaggle_link: formData.get('kaggle_link'),
        devfolio_link: formData.get('devfolio_link'),
        resume_link: 'mock-resume-url.pdf',
        profile_picture: 'mock-profile-pic.jpg',
        isAdmin: false,
        isLooking: false,
      };
    } else {
      userData = {
        uid: Date.now().toString(),
        ...formData,
        isAdmin: false,
        isLooking: false,
      };
    }
    
    // Store in "users database" (localStorage)
    const storedUsers = localStorage.getItem('mockUsers');
    let users: any[] = [];
    
    if (storedUsers) {
      users = JSON.parse(storedUsers);
    }
    
    // Check if email already exists
    if (users.find((u: any) => u.email === userData.email)) {
      throw new Error('Email already registered');
    }
    
    users.push(userData);
    localStorage.setItem('mockUsers', JSON.stringify(users));
    
    // Auto-login after registration
    const { password, ...userWithoutPassword } = userData;
    setUser(userWithoutPassword);
    localStorage.setItem('mockUser', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('mockUser');
  };

  const refreshUser = async () => {
    // In mock mode, just reload from localStorage
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  };

  return (
    <MockAuthContext.Provider
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
    </MockAuthContext.Provider>
  );
}

export function useMockAuth() {
  const context = useContext(MockAuthContext);
  if (context === undefined) {
    throw new Error('useMockAuth must be used within a MockAuthProvider');
  }
  return context;
}

