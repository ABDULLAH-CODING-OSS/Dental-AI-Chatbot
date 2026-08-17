"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { token, role, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!token) {
        router.push("/login");
      } else if (role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [token, role, isLoading, router]);

  if (isLoading || !token || role !== "admin") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-100/80" suppressHydrationWarning>
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-purple-600 border-t-transparent"></div>
          <p className="text-sm font-semibold text-slate-700">Verifying administrative credentials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-100/60 font-sans text-slate-900 text-sm antialiased selection:bg-purple-500 selection:text-white" suppressHydrationWarning>
      {/* Desktop Persistent Sidebar */}
      <div className="hidden lg:flex h-full shrink-0">
        <AdminSidebar />
      </div>

      {/* Main Content Viewport */}
      <div className="flex flex-1 flex-col h-full overflow-hidden min-w-0">
        <AdminHeader />
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8" suppressHydrationWarning>
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
