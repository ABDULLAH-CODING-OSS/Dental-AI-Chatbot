"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  MessageSquareText, 
  CalendarCheck, 
  Stethoscope,
  Tag,
  BriefcaseBusiness,
  Building2, 
  SlidersHorizontal, 
  LogOut, 
  ShieldCheck
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

const adminNavItems = [
  { name: "Overview / Analytics", href: "/admin", icon: LayoutDashboard, badge: undefined },
  { name: "Users", href: "/admin/users", icon: Users, badge: undefined },
  { name: "Chat Logs", href: "/admin/chat-logs", icon: MessageSquareText, badge: "Live" },
  { name: "Appointments", href: "/admin/appointments", icon: CalendarCheck, badge: undefined },
  { name: "Doctors", href: "/admin/doctors", icon: Stethoscope, badge: "New" },
  { name: "Pricing", href: "/admin/pricing", icon: Tag, badge: undefined },
  { name: "Services", href: "/admin/services", icon: BriefcaseBusiness, badge: "New" },
  { name: "Clinics", href: "/admin/clinics", icon: Building2, badge: undefined },
  { name: "Settings", href: "/admin/settings", icon: SlidersHorizontal, badge: undefined },
];

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  const handleExitAdmin = () => {
    if (onCloseMobile) onCloseMobile();
    router.push("/dashboard");
  };

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white shadow-xs select-none font-sans">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100 bg-white shrink-0">
        <Link href="/admin" className="flex items-center gap-3 group" onClick={handleNavClick}>
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20 transition-transform group-hover:scale-105">
            <Stethoscope size={20} className="stroke-[2.2]" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">Denova</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 border border-purple-200">
                Admin
              </span>
            </div>
            <span className="text-xs font-medium text-slate-500">Clinical Management</span>
          </div>
        </Link>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1.5">
        <div className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
          Platform Controls
        </div>
        
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link key={item.name} href={item.href} onClick={handleNavClick}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-purple-50 text-purple-800 shadow-xs border border-purple-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1 rounded-lg transition-colors ${
                    isActive ? "text-purple-700 bg-purple-100/80" : "text-slate-400 group-hover:text-slate-600"
                  }`}>
                    <item.icon size={19} />
                  </div>
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    item.badge === "Live"
                      ? "bg-emerald-100 text-emerald-700 animate-pulse"
                      : item.badge === "New"
                      ? "bg-purple-100 text-purple-700"
                      : isActive 
                      ? "bg-purple-200 text-purple-800" 
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile */}
      <div className="p-4 pt-5 mt-auto border-t border-slate-200/80 bg-slate-50/50 space-y-3 shrink-0">
        <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <Avatar className="h-9 w-9 border border-purple-200 ring-2 ring-purple-50 shrink-0">
            <AvatarFallback className="bg-purple-600 text-white font-bold text-sm">
              {user?.avatar || "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-sm font-bold text-slate-900 truncate">{user?.name || "Administrator"}</span>
              <ShieldCheck size={14} className="text-purple-600 shrink-0" />
            </div>
            <span className="text-xs text-slate-500 truncate">Super Admin</span>
          </div>
        </div>

        <button
          onClick={handleExitAdmin}
          className="flex w-full items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-purple-700 hover:bg-purple-50/80 border border-slate-200 hover:border-purple-200 transition-colors cursor-pointer"
        >
          <LogOut size={13} />
          Exit Admin Console
        </button>
      </div>
    </aside>
  );
}
