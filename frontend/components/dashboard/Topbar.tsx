"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Search, ShieldCheck, LogOut, Settings as SettingsIcon } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import axios from "axios";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function Topbar() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/notifications/me`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });

      if (Array.isArray(res.data)) {
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
    fetchUnreadCount();

    const handleNotificationsUpdated = () => {
      fetchUnreadCount();
    };

    window.addEventListener("notifications-updated", handleNotificationsUpdated);
    return () => {
      window.removeEventListener("notifications-updated", handleNotificationsUpdated);
    };
  }, [fetchUnreadCount]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur-md sticky top-0 z-20 font-sans" suppressHydrationWarning>
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-sm hidden sm:block">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search symptoms, treatments, or clinics..."
            suppressHydrationWarning
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        {/* System Status badge */}
        <div className="hidden lg:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-xs font-semibold text-emerald-800">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          AI Assistant: Online
        </div>

        {/* Real Notification Bell with Dynamic Unread Badge */}
        <Link href="/dashboard/notifications" title="View notifications">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/60 transition-colors cursor-pointer">
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold shadow-sm ring-2 ring-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
        </Link>

        {/* User Profile Dropdown Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button suppressHydrationWarning className="flex items-center gap-2.5 p-1 pl-2 pr-1 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer outline-none">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-slate-800 leading-tight">{user?.name || "Patient"}</span>
                <span className="text-xs text-slate-500 font-medium capitalize">{user?.role || "Patient"}</span>
              </div>
              <Avatar className="h-9 w-9 border border-emerald-200">
                <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-sm">
                  {user?.avatar || "PT"}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border border-slate-200 rounded-2xl" suppressHydrationWarning>
            <div className="px-3 py-2">
              <p className="text-sm font-bold text-slate-900">{user?.name || "Patient"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || "patient@denovadental.com"}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-sm cursor-pointer rounded-xl py-2 font-medium">
              <Link href="/dashboard/settings" className="w-full flex items-center gap-2.5">
                <SettingsIcon size={15} />
                Account Settings
              </Link>
            </DropdownMenuItem>

            {/* Admin Console link ONLY visible if the user role is admin */}
            {user?.role === "admin" && (
              <DropdownMenuItem asChild className="text-sm cursor-pointer rounded-xl py-2 font-semibold text-purple-700 focus:bg-purple-50 focus:text-purple-800">
                <Link href="/admin" className="w-full flex items-center gap-2.5">
                  <ShieldCheck size={15} />
                  Admin Console
                </Link>
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-sm text-red-600 cursor-pointer rounded-xl py-2 font-semibold focus:bg-red-50 focus:text-red-700">
              <LogOut size={15} className="mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
