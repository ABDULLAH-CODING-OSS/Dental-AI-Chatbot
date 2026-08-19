"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type UserRole = "patient" | "admin";

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface AuthContextType {
  token: string | null;
  role: UserRole | null;
  fullName: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (token: string, role: UserRole, fullName: string, email?: string) => void;
  logout: () => void;
  setAuthData: (token: string, role: UserRole, fullName: string, email?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load session from localStorage on initial mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("token");
      const savedRole = localStorage.getItem("role") as UserRole | null;
      const savedName = localStorage.getItem("name");
      const savedEmail = localStorage.getItem("email");

      if (savedToken) {
        const userRole = (savedRole === "admin" ? "admin" : "patient") as UserRole;
        const userName = savedName || "Patient";
        const userEmail = savedEmail || (userRole === "admin" ? "admin@denovadental.com" : "patient@denovadental.com");

        setToken(savedToken);
        setRole(userRole);
        setFullName(userName);

        const initials = userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        setUser({
          name: userName,
          email: userEmail,
          role: userRole,
          avatar: initials || (userRole === "admin" ? "AT" : "JD"),
        });
      }
    } catch (error) {
      console.error("Failed to load auth state from localStorage:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newToken: string, newRole: UserRole, newFullName: string, email?: string) => {
    const userEmail = email || (newRole === "admin" ? "admin@denovadental.com" : "patient@denovadental.com");
    
    // Save to localStorage so it persists across page refreshes
    localStorage.setItem("token", newToken);
    localStorage.setItem("role", newRole);
    localStorage.setItem("name", newFullName);
    localStorage.setItem("email", userEmail);

    setToken(newToken);
    setRole(newRole);
    setFullName(newFullName);
    
    const initials = newFullName
      ? newFullName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : newRole === "admin" ? "AT" : "JD";

    setUser({
      name: newFullName,
      email: userEmail,
      role: newRole,
      avatar: initials
    });
  }, []);

  const logout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    setToken(null);
    setRole(null);
    setFullName(null);
    setUser(null);
  }, []);

  const setAuthData = useCallback((newToken: string, newRole: UserRole, newFullName: string, email?: string) => {
    login(newToken, newRole, newFullName, email);
  }, [login]);

  return (
    <AuthContext.Provider value={{ token, role, fullName, user, isLoading, login, logout, setAuthData }}>
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
