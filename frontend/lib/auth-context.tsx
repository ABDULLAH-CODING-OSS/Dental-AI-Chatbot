"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "patient" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

// In-memory mock authentication store (NO localStorage/sessionStorage per requirements)
// Default mock user is provided so the prototype is easily navigatable during evaluation
const DEFAULT_MOCK_USER: AuthUser = {
  id: "usr_mock_01",
  name: "Dr. Aris Thorne",
  email: "admin@denovadental.com",
  role: "admin",
  avatar: "AT"
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(DEFAULT_MOCK_USER);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = (email: string, role?: UserRole) => {
    setIsLoading(true);
    const assignedRole: UserRole = role || (email.toLowerCase().includes("admin") ? "admin" : "patient");
    const name = assignedRole === "admin" ? "Dr. Aris Thorne" : "John Doe";
    setUser({
      id: `usr_${Date.now()}`,
      name,
      email,
      role: assignedRole,
      avatar: assignedRole === "admin" ? "AT" : "JD"
    });
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    setUser({
      ...user,
      role: newRole,
      name: newRole === "admin" ? "Dr. Aris Thorne" : "John Doe",
      email: newRole === "admin" ? "admin@denovadental.com" : "john@example.com",
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
