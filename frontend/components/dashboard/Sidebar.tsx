"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { 
  MessageSquare, 
  Calendar, 
  Clock, 
  Settings, 
  HelpCircle, 
  Bell, 
  LogOut, 
  Stethoscope,
  Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/app/context/AuthContext";
import axios from "axios";

interface ChatSession {
  id: number;
  title: string;
  created_at?: string;
}

const navItems = [
  { name: "Chat Consultation", href: "/dashboard", icon: MessageSquare },
  { name: "Consultation History", href: "/dashboard/history", icon: Clock },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "FAQ", href: "/dashboard/faq", icon: HelpCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSessionParam = searchParams.get("session");
  const router = useRouter();
  const { user, token, logout } = useAuth();
  
  const [mounted, setMounted] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    async function fetchSessions() {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/chat/sessions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 8000,
        });
        if (isMounted && Array.isArray(res.data)) {
          setSessions(res.data.slice(0, 8));
        }
      } catch {
        // Fallback gracefully without breaking UI if offline
      }
    }

    fetchSessions();
    return () => { isMounted = false; };
  }, [token, pathname, currentSessionParam]);

  const handleNewChat = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white shadow-xs select-none font-sans" suppressHydrationWarning>
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Stethoscope size={20} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Denova</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5" suppressHydrationWarning>
        {/* New Chat Button */}
        <button
          onClick={handleNewChat}
          suppressHydrationWarning
          className="w-full flex items-center justify-center gap-2 mb-4 py-2.5 px-3 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={18} />
          New Consultation
        </button>

        {navItems.map((item) => {
          const isActive = pathname === item.href && (!currentSessionParam || item.href !== "/dashboard");
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-800 shadow-xs" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon size={19} className={isActive ? "text-emerald-600" : "text-slate-400"} />
                {item.name}
              </motion.div>
            </Link>
          );
        })}

        {/* Dynamic Recent Chat Sessions Section */}
        {mounted && sessions.length > 0 && (
          <div className="pt-4 mt-4 border-t border-slate-100 space-y-1">
            <span className="px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Consultations</span>
            <div className="mt-2 space-y-1">
              {sessions.map((session) => {
                const isSessionActive = pathname === "/dashboard" && currentSessionParam === session.id.toString();
                return (
                  <Link key={session.id} href={`/dashboard?session=${session.id}`}>
                    <div 
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors truncate ${
                        isSessionActive
                          ? "bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/50"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <span className="truncate">{session.title || `Session #${session.id}`}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer Profile */}
      <div className="p-4 border-t border-slate-100 space-y-2" suppressHydrationWarning>
        <Link href="/dashboard/settings">
          <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
            <Avatar className="h-9 w-9 border border-slate-200 shadow-xs">
              <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold text-sm">
                {mounted && user?.avatar ? user.avatar : "JD"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-sm font-bold text-slate-900 truncate">{mounted && user?.name ? user.name : "John Doe"}</span>
              <span className="text-xs text-slate-500 truncate">{mounted && user?.email ? user.email : "john@example.com"}</span>
            </div>
          </div>
        </Link>
        <button 
          onClick={logout}
          suppressHydrationWarning
          className="flex w-full items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </div>
  );
}
