"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Trash2, 
  Calendar, 
  History, 
  ChevronRight, 
  Loader2, 
  AlertCircle, 
  RefreshCw, 
  Plus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/context/AuthContext";
import { formatConsultationTime } from "@/lib/utils";
import axios from "axios";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  rawDate: string;
  preview: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.05 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function HistoryPage() {
  const router = useRouter();
  const { token, isLoading, logout } = useAuth();
  
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<HistoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fetchedTokenRef = useRef<string | null>(null);

  const fetchHistory = useCallback(async (authToken: string) => {
    const url = `${BACKEND_BASE_URL}/api/chat/sessions`;
    const config = {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      timeout: 30000,
    };

    console.log("Fetching history now");
    console.log("Request URL:", url);
    console.log("Request Headers:", config.headers);
    console.log("Request Config:", config);

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await axios.get(url, config);
      console.log("History fetch success, status:", res.status, "data length:", Array.isArray(res.data) ? res.data.length : res.data);
      console.log("History data:", JSON.stringify(res.data));

      if (Array.isArray(res.data)) {
        const mapped: HistoryItem[] = res.data.map((s: { id: number; title: string; created_at: string; updated_at?: string }) => {
          const rawTimestamp = s.updated_at || s.created_at;
          const formattedDate = formatConsultationTime(rawTimestamp);

          return {
            id: s.id.toString(),
            title: s.title || `Consultation #${s.id}`,
            date: formattedDate,
            rawDate: rawTimestamp,
            preview: "Click to continue this clinical consultation dialogue with Denova AI."
          };
        });
        setHistory(mapped);
      }
    } catch (err: unknown) {
      console.error("History fetch catch error:", err);
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          logout();
          router.push("/login");
          return;
        }
        console.error("History fetch non-200 response data:", status, err.response?.data);
      }
      setErrorMessage("Unable to load consultation history. Please check your connection and try again.");
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
    fetchHistory(token);
  }, [token, isLoading, fetchHistory, router]);

  const handleRefresh = () => {
    if (token) {
      fetchHistory(token);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    router.push(`/dashboard?session=${sessionId}`);
  };

  const handleDelete = async () => {
    if (!itemToDelete || !token) return;
    setIsDeleting(true);

    try {
      await axios.delete(`${BACKEND_BASE_URL}/api/chat/sessions/${itemToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 20000,
      });

      setHistory(prev => prev.filter(h => h.id !== itemToDelete.id));

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("chat-session-updated", { 
          detail: { sessionId: itemToDelete.id } 
        }));
      }
    } catch (err: unknown) {
      console.error("Delete history session error:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          logout();
          router.push("/login");
          return;
        }
      }
      setErrorMessage("Failed to delete the consultation session. Please try again.");
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto font-sans" suppressHydrationWarning>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 border-b border-slate-200/80 pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Consultation History</h2>
          <p className="text-sm md:text-base text-slate-600 mt-1.5 font-normal">
            Review, continue, and manage your previous clinical consultations with Denova AI.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="rounded-xl h-11 px-4 text-xs font-bold text-slate-700 cursor-pointer"
          >
            <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => router.push("/dashboard")}
            className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-5 h-11 shadow-sm cursor-pointer"
          >
            <Plus size={16} className="mr-2" />
            New Consultation
          </Button>
        </div>
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
            <RefreshCw size={13} className="mr-1" /> Retry
          </Button>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
          <span className="text-sm sm:text-base font-semibold text-slate-500">Loading consultation records...</span>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4">
          <AnimatePresence>
            {history.map((item) => (
              <motion.div 
                key={item.id}
                variants={itemVariants}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                onClick={() => handleSelectSession(item.id)}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-200 transition-all group flex items-start gap-4 sm:gap-5 cursor-pointer"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <MessageSquare size={22} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-2 mb-1.5">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate pr-3 group-hover:text-emerald-700 transition-colors">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 shrink-0 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/80">
                      <Calendar size={13} className="text-emerald-600" />
                      {item.date}
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm line-clamp-2 mb-3 font-normal leading-relaxed">
                    {item.preview}
                  </p>
                  <div className="flex items-center text-emerald-600 text-xs sm:text-sm font-semibold opacity-90 sm:opacity-0 sm:-translate-x-2 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all">
                    Continue consultation <ChevronRight size={15} className="ml-1" />
                  </div>
                </div>

                <div className="shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                    title="Delete consultation"
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(item);
                    }}
                  >
                    <Trash2 size={17} />
                  </Button>
                </div>
              </motion.div>
            ))}

            {history.length === 0 && !errorMessage && (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 p-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <History size={30} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1.5">No saved consultations yet</h3>
                <p className="text-sm text-slate-500 font-normal max-w-sm mx-auto mb-6">
                  Every time you consult with Denova AI, your session dialogue is safely preserved here.
                </p>
                <Button 
                  onClick={() => router.push("/dashboard")}
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 h-11 shadow-sm cursor-pointer"
                >
                  Start New Consultation
                </Button>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="rounded-3xl p-6 sm:p-8 max-w-md" suppressHydrationWarning>
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">Delete Consultation</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-slate-600 mt-2.5 font-normal leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{itemToDelete?.title}"</strong>? All consultation messages will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <Button 
              variant="outline" 
              className="min-w-0 flex-1 rounded-xl h-11 px-3 text-center text-sm font-semibold whitespace-normal leading-tight cursor-pointer" 
              onClick={() => setItemToDelete(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              disabled={isDeleting}
              className="min-w-0 flex-1 rounded-xl h-11 px-3 text-center text-sm font-bold whitespace-normal leading-tight cursor-pointer" 
              onClick={handleDelete}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
