"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bell, 
  Menu, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink,
  ShieldCheck,
  Settings as SettingsIcon,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/lib/auth-context";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": { title: "Executive Overview", subtitle: "Real-time telemetry, clinical triage activity & platform health" },
  "/admin/users": { title: "User Directory & Access", subtitle: "Manage registered patients, dental practitioners & staff privileges" },
  "/admin/chat-logs": { title: "Chat Sessions & Transcripts", subtitle: "Review conversational interactions, safety flags & AI triage" },
  "/admin/appointments": { title: "Appointment Requests", subtitle: "Track, confirm and coordinate clinic booking requests" },
  "/admin/clinics": { title: "Partner Clinics", subtitle: "Manage verified local dental practices, facilities, and directories" },
  "/admin/settings": { title: "System & Guardrail Settings", subtitle: "Rate limits, clinical thresholds, system guardrails & preferences" },
};

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentInfo = PAGE_TITLES[pathname] || {
    title: "Admin Portal",
    subtitle: "Denova Dental AI Management"
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md font-sans">
      {/* Left: Mobile Toggle & Page Info */}
      <div className="flex items-center gap-3.5">
        <div className="lg:hidden">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-600">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64 border-r border-slate-200">
              <AdminSidebar onCloseMobile={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
              {currentInfo.title}
            </h1>
            <Badge variant="outline" className="hidden sm:inline-flex bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
              Admin Mode
            </Badge>
          </div>
          <p className="hidden md:block text-xs md:text-sm text-slate-500 font-medium mt-0.5">
            {currentInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Live System Indicator */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Status: <strong className="text-slate-900 font-bold">Optimal</strong></span>
        </div>

        {/* Notifications Dropdown with clean bell & badge alignment */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer outline-none">
              <Bell size={20} />
              <span className="absolute top-2 right-2 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-purple-600"></span>
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-84 p-2 shadow-xl border border-slate-200 rounded-2xl">
            <DropdownMenuLabel className="flex items-center justify-between text-sm font-bold text-slate-900 px-3 py-2">
              <span>Admin Notifications</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">3 New</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1.5 py-1 text-sm">
              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 flex items-start gap-3 cursor-pointer hover:bg-purple-100/70 transition-colors">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800 text-sm">Urgent Triage Alert</p>
                  <p className="text-slate-600 text-xs leading-snug">Session #SES-8942 flagged for acute facial swelling.</p>
                  <span className="text-xs text-slate-600 mt-1 block font-medium">15 mins ago</span>
                </div>
              </div>
              <div className="p-3 rounded-xl hover:bg-slate-50 flex items-start gap-3 cursor-pointer transition-colors">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="font-bold text-slate-800 text-sm">New Clinic Registered</p>
                  <p className="text-slate-600 text-xs leading-snug">Apex Emergency Dental updated operating hours.</p>
                  <span className="text-xs text-slate-600 mt-1 block font-medium">1 hour ago</span>
                </div>
              </div>
            </div>
            <DropdownMenuSeparator />
            <Link href="/admin/chat-logs" className="block text-center text-sm font-bold text-purple-700 hover:underline py-2">
              View All Triage Logs
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User / Admin Profile Dropdown with clean spacing */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 px-2.5 py-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer outline-none shrink-0">
              <div className="hidden sm:flex flex-col text-right justify-center min-w-0">
                <span className="text-sm font-bold text-slate-900 leading-tight truncate max-w-[140px]">
                  {user?.name || "Dr. Aris Thorne"}
                </span>
                <span className="text-[11px] font-semibold text-purple-700 leading-tight mt-0.5">
                  Super Administrator
                </span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-purple-200 ring-2 ring-purple-50 shrink-0">
                <AvatarFallback className="bg-purple-600 text-white font-bold text-sm">
                  {user?.avatar || "AT"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border border-slate-200 rounded-2xl">
            <div className="px-3 py-2.5">
              <p className="text-sm font-bold text-slate-900">{user?.name || "Dr. Aris Thorne"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || "admin@denovadental.com"}</p>
              <Badge variant="outline" className="mt-2 bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
                🛡️ Super Administrator
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-sm cursor-pointer rounded-xl py-2 font-medium">
              <Link href="/admin/settings" className="w-full flex items-center gap-2.5">
                <SettingsIcon size={15} />
                Admin Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-sm cursor-pointer rounded-xl py-2 font-medium text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800">
              <Link href="/dashboard" className="w-full flex items-center justify-between">
                <span>Switch to Patient App</span>
                <ExternalLink size={14} />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-sm text-red-600 cursor-pointer rounded-xl py-2 font-semibold focus:bg-red-50 focus:text-red-700">
              <LogOut size={15} className="mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
