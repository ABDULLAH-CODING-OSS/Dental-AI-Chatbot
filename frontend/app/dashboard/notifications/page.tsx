"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bell, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw, 
  Inbox,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/context/AuthContext";
import { formatConsultationTime } from "@/lib/utils";
import axios from "axios";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.06 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function NotificationsPage() {
  const router = useRouter();
  const { token, isLoading, logout } = useAuth();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fetchedTokenRef = useRef<string | null>(null);

  const fetchNotifications = useCallback(async (authToken: string) => {
    const url = `${BACKEND_BASE_URL}/api/notifications/me`;
    const config = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      timeout: 30000,
    };

    console.log("Fetching notifications now");
    console.log("Request URL:", url);
    console.log("Request Headers:", config.headers);
    console.log("Request Config:", config);

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await axios.get(url, config);
      console.log("Notifications fetch success, status:", res.status, "data length:", Array.isArray(res.data) ? res.data.length : res.data);
      console.log("Notifications data:", JSON.stringify(res.data));

      if (Array.isArray(res.data)) {
        setNotifications(res.data);
      }
    } catch (err: unknown) {
      console.error("Notifications fetch catch error:", err);
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          logout();
          router.push("/login");
          return;
        }
        console.error("Notifications fetch non-200 response data:", status, err.response?.data);
      }
      setErrorMessage("Unable to load notifications. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [logout, router]);

  // Wait for AuthContext to resolve, then fire fetch ONCE per resolved token
  useEffect(() => {
    if (isLoading) return;
    if (!token) {
      router.push("/login");
      return;
    }
    if (fetchedTokenRef.current === token) return;
    fetchedTokenRef.current = token;
    fetchNotifications(token);
  }, [token, isLoading, fetchNotifications, router]);

  const handleRefresh = () => {
    if (token) {
      fetchNotifications(token);
    }
  };

  const handleMarkAsRead = async (notifId: number, currentRead: boolean) => {
    if (currentRead || !token) return;

    // Optimistically update UI
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, read: true } : n))
    );

    try {
      await axios.patch(`${BACKEND_BASE_URL}/api/notifications/${notifId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 15000,
      });

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notifications-updated"));
      }
    } catch (err: unknown) {
      console.error("Mark notification as read error:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          logout();
          router.push("/login");
          return;
        }
      }
      // Revert if request failed
      setNotifications(prev =>
        prev.map(n => (n.id === notifId ? { ...n, read: false } : n))
      );
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto font-sans" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Notifications</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-0.5 text-xs font-bold">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="text-sm md:text-base text-slate-600 mt-1.5 font-normal">
            Stay informed about your scheduled appointments, clinical updates, and care reminders.
          </p>
        </div>

        <Button 
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="rounded-xl h-10 px-4 text-xs font-bold text-slate-700 self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            className="text-red-800 hover:bg-red-100 font-semibold text-xs h-8 px-3 rounded-lg cursor-pointer"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
          <span className="text-sm sm:text-base font-semibold text-slate-500">Loading your notifications...</span>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-3.5">
          <AnimatePresence>
            {notifications.map((notif) => {
              const isUnread = !notif.read;
              return (
                <motion.div 
                  key={notif.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.006 }}
                  onClick={() => handleMarkAsRead(notif.id, notif.read)}
                  className={`flex items-start gap-4 sm:gap-5 p-5 sm:p-6 rounded-2xl border transition-all cursor-pointer ${
                    isUnread 
                      ? "bg-white border-emerald-200/90 shadow-sm hover:shadow-md ring-1 ring-emerald-500/20" 
                      : "bg-slate-50/70 border-slate-200/70 hover:bg-slate-50"
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                    isUnread 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200" 
                      : "bg-slate-100 text-slate-400 border-slate-200"
                  }`}>
                    <Calendar size={20} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-base sm:text-lg truncate ${
                          isUnread ? "font-extrabold text-slate-900" : "font-semibold text-slate-700"
                        }`}>
                          {notif.title}
                        </h3>
                        {isUnread && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-400 shrink-0 bg-white sm:bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        {formatConsultationTime(notif.created_at)}
                      </span>
                    </div>
                    <p className={`text-xs sm:text-sm leading-relaxed ${
                      isUnread ? "text-slate-700 font-medium" : "text-slate-500 font-normal"
                    }`}>
                      {notif.message}
                    </p>

                    {isUnread && (
                      <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                        <Check size={13} />
                        <span>Click to mark as read</span>
                      </div>
                    )}
                  </div>

                  {/* Unread Glowing Dot */}
                  {isUnread && (
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 mt-2 ring-4 ring-emerald-100 animate-pulse" />
                  )}
                </motion.div>
              );
            })}

            {notifications.length === 0 && !errorMessage && (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 p-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <Inbox size={30} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1.5">No notifications</h3>
                <p className="text-sm text-slate-500 font-normal max-w-sm mx-auto">
                  You're all caught up! Updates regarding your clinical bookings and consultations will show here.
                </p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
