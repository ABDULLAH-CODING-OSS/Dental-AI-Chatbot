"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Bell, 
  Menu, 
  AlertTriangle, 
  CheckCircle2, 
  ExternalLink, 
  LogOut,
  Settings as SettingsIcon,
  Stethoscope
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import axios from "axios";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  "/admin": {
    title: "Executive Control Center",
    subtitle: "Real-time clinical triage analytics and system metrics."
  },
  "/admin/users": {
    title: "User Directory & Access Controls",
    subtitle: "Manage patient records, administrative roles, and verification status."
  },
  "/admin/chat-logs": {
    title: "AI Consultation Logs & Triage",
    subtitle: "Clinical dialogue audits, symptom classification, and emergency escalations."
  },
  "/admin/appointments": {
    title: "Appointments & Referral Management",
    subtitle: "Partner clinic scheduling, referrals, and booking status controls."
  },
  "/admin/doctors": {
    title: "Clinical Doctors Directory",
    subtitle: "Manage provider profiles, dental specialties, contact info, and consultation fees."
  },
  "/admin/pricing": {
    title: "Service & Consultation Pricing",
    subtitle: "Overview of current dental consultation rates and provider pricing tiers."
  },
  "/admin/clinics": {
    title: "Partner Dental Clinics Directory",
    subtitle: "Practice locations, operating hours, and referral routing."
  },
  "/admin/services": {
    title: "Dental Services Catalog",
    subtitle: "Manage services and base prices available for appointment booking."
  },
  "/admin/settings": {
    title: "System & AI Model Settings",
    subtitle: "Configure safety guardrails, triage sensitivity, and integration keys."
  },
};

export function AdminHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [notifications, setNotifications] = useState<Array<{ id: number; title: string; message: string; read: boolean }>>([]);

  const currentInfo = PAGE_TITLES[pathname] || {
    title: "Admin Portal",
    subtitle: "Denova Dental AI Clinical Management"
  };

  const fetchAdminNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/notifications/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });

      if (Array.isArray(res.data)) {
        setNotifications(res.data.slice(0, 5));
        const unread = res.data.filter((n: { read: boolean | number }) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logout();
        router.push("/login");
      }
    }
  }, [token, logout, router]);

  useEffect(() => {
    fetchAdminNotifications();

    const handleNotificationsUpdated = () => {
      fetchAdminNotifications();
    };

    window.addEventListener("notifications-updated", handleNotificationsUpdated);
    return () => {
      window.removeEventListener("notifications-updated", handleNotificationsUpdated);
    };
  }, [fetchAdminNotifications]);

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
              <Button variant="ghost" size="icon" className="text-slate-600 cursor-pointer">
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

        {/* Notifications Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer outline-none">
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-4.5 h-4.5 px-1 rounded-full bg-purple-600 text-white text-[10px] font-extrabold shadow-sm ring-2 ring-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 shadow-xl border border-slate-200 rounded-2xl">
            <DropdownMenuLabel className="flex items-center justify-between text-sm font-bold text-slate-900 px-3 py-2">
              <span>Admin Notifications</span>
              {unreadCount > 0 ? (
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-400">All Read</span>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1.5 py-1 text-sm">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                    <p className="font-bold text-slate-800 text-xs">{n.title}</p>
                    <p className="text-slate-600 text-xs leading-snug line-clamp-2">{n.message}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 text-center py-3">No recent notifications</p>
              )}
            </div>
            <DropdownMenuSeparator />
            <Link href="/dashboard/notifications" className="block text-center text-xs font-bold text-purple-700 hover:underline py-1.5">
              Open Full Notifications
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User / Admin Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 px-2.5 py-1.5 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition-all cursor-pointer outline-none shrink-0">
              <div className="hidden sm:flex flex-col text-right justify-center min-w-0">
                <span className="text-sm font-bold text-slate-900 leading-tight truncate max-w-35">
                  {user?.name || "Administrator"}
                </span>
                <span className="text-[11px] font-semibold text-purple-700 leading-tight mt-0.5">
                  Super Administrator
                </span>
              </div>
              <Avatar className="h-9 w-9 border-2 border-purple-200 ring-2 ring-purple-50 shrink-0">
                <AvatarFallback className="bg-purple-600 text-white font-bold text-sm">
                  {user?.avatar || "AD"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border border-slate-200 rounded-2xl">
            <div className="px-3 py-2.5">
              <p className="text-sm font-bold text-slate-900">{user?.name || "Administrator"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || "admin@denovadental.com"}</p>
              <Badge variant="outline" className="mt-2 bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
                Super Administrator
              </Badge>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-sm cursor-pointer rounded-xl py-2 font-medium">
              <Link href="/admin/settings" className="w-full flex items-center gap-2.5">
                <SettingsIcon size={15} />
                Admin Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/dashboard")}
              className="text-sm cursor-pointer rounded-xl py-2 font-medium text-emerald-700 focus:bg-emerald-50 focus:text-emerald-800"
            >
              <span>Switch to Patient App</span>
              <ExternalLink size={14} className="ml-auto" />
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
