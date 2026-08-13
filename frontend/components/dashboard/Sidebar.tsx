"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, MessageSquare, History, Calendar, Bell, HelpCircle, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const navItems = [
  { name: "Chat", href: "/dashboard", icon: MessageSquare },
  { name: "Chat History", href: "/dashboard/history", icon: History },
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "FAQ", href: "/dashboard/faq", icon: HelpCircle },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-100 bg-white shadow-sm">
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Stethoscope size={18} />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Denova</span>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-emerald-50 text-emerald-700 shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-emerald-600" : "text-slate-400"} />
                {item.name}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-100 space-y-2">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">JD</AvatarFallback>
          </Avatar>
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-semibold text-slate-900 truncate">John Doe</span>
            <span className="text-xs text-slate-500 truncate">john@example.com</span>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Log out
        </motion.button>
      </div>
    </div>
  );
}
