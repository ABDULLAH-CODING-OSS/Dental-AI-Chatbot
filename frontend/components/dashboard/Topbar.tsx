"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, Menu } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useEffect, useState } from "react";

export function Topbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  // Close sheet on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  let pageTitle = "Chat";
  if (pathname.includes("/history")) pageTitle = "Chat History";
  else if (pathname.includes("/appointments")) pageTitle = "Appointments";
  else if (pathname.includes("/notifications")) pageTitle = "Notifications";
  else if (pathname.includes("/faq")) pageTitle = "FAQ";
  else if (pathname.includes("/settings")) pageTitle = "Settings";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between px-6 backdrop-blur-md bg-white/70 border-b border-slate-100">
      <div className="flex items-center gap-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <button className="md:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100">
              <Menu size={24} />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors rounded-full hover:bg-slate-100"
        >
          <Bell size={20} />
          <Badge className="absolute top-1 right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 hover:bg-red-600 text-[10px] rounded-full border border-white">
            3
          </Badge>
        </motion.button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="outline-none">
              <Avatar className="h-9 w-9 border border-slate-200 cursor-pointer shadow-sm">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold text-sm">JD</AvatarFallback>
              </Avatar>
            </motion.button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-lg border-slate-100 p-2">
            <DropdownMenuLabel className="font-semibold text-slate-900">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100" />
            <DropdownMenuItem asChild className="cursor-pointer focus:bg-slate-50 rounded-lg py-2">
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg py-2 mt-1">
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
