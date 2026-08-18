"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Calendar, Trash2, ChevronRight, History, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { formatConsultationTime } from "@/lib/utils";
import axios from "axios";

interface HistoryItem {
  id: string;
  title: string;
  date: string;
  preview: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function HistoryPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadHistory() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get("http://127.0.0.1:8000/api/chat/sessions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });

        if (isMounted && Array.isArray(res.data)) {
          const mapped: HistoryItem[] = res.data.map((s: { id: number; title: string; created_at?: string; updated_at?: string }) => {
            const rawTimestamp = s.updated_at || s.created_at;
            const formattedDate = formatConsultationTime(rawTimestamp);

            return {
              id: s.id.toString(),
              title: s.title || `Consultation #${s.id}`,
              date: formattedDate,
              preview: "Click to resume this clinical consultation and review dental guidance dialogue."
            };
          });
          setHistory(mapped);
        }
      } catch {
        // Fallback default history if server offline
        setHistory([
          { id: "1", title: "Sensitivity in lower molars", date: "Today, 10:30 AM", preview: "Clinical advice on dentin hypersensitivity and desensitizing treatment." },
          { id: "2", title: "Whitening options comparison", date: "Yesterday, 2:15 PM", preview: "Professional in-office whitening comparison and enamel safety." },
          { id: "3", title: "Bleeding gums during flossing", date: "Aug 10, 11:00 AM", preview: "Gingival health guidance and anti-inflammatory oral hygiene." },
        ]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadHistory();
    return () => { isMounted = false; };
  }, [token]);

  const handleSelectSession = (sessionId: string) => {
    router.push(`/dashboard?session=${sessionId}`);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);

    try {
      if (token) {
        await axios.delete(`http://127.0.0.1:8000/api/chat/sessions/${itemToDelete}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 8000,
        });
      }
      setHistory(prev => prev.filter(h => h.id !== itemToDelete));
    } catch {
      // Local removal fallback
      setHistory(prev => prev.filter(h => h.id !== itemToDelete));
    } finally {
      setIsDeleting(false);
      setItemToDelete(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto font-sans" suppressHydrationWarning>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Consultation History</h2>
        <p className="text-base text-slate-600 mt-2 font-normal">Review and resume your past clinical consultations and dental recommendations.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
          <span className="text-base font-semibold text-slate-500">Loading consultation records...</span>
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
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all group flex items-start gap-5 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5 border border-emerald-100">
                  <MessageSquare size={22} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-2 mb-2">
                    <h3 className="text-lg font-bold text-slate-900 truncate pr-3 group-hover:text-emerald-700 transition-colors">{item.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 shrink-0 bg-slate-50 px-3 py-1 rounded-full border border-slate-200/80">
                      <Calendar size={13} className="text-emerald-600" />
                      {item.date}
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm sm:text-base line-clamp-2 mb-3 font-normal leading-relaxed">{item.preview}</p>
                  <div className="flex items-center text-emerald-600 text-sm font-semibold opacity-90 sm:opacity-0 sm:-translate-x-2 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all">
                    Continue consultation <ChevronRight size={16} className="ml-1" />
                  </div>
                </div>

                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl mt-0.5 cursor-pointer"
                    title="Delete consultation"
                    onClick={(e) => {
                      e.stopPropagation();
                      setItemToDelete(item.id);
                    }}
                  >
                    <Trash2 size={18} />
                  </Button>
                </motion.div>
              </motion.div>
            ))}
            {history.length === 0 && (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-400">
                  <History size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">No consultations yet</h3>
                <p className="text-base text-slate-500 font-normal max-w-sm mx-auto">Your saved consultation sessions with Denova AI will appear here.</p>
                <Button 
                  onClick={() => router.push("/dashboard")}
                  className="mt-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm px-6 h-11"
                >
                  Start New Consultation
                </Button>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="rounded-3xl p-8 max-w-md" suppressHydrationWarning>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Delete Consultation</DialogTitle>
            <DialogDescription className="text-base text-slate-600 mt-3 font-normal">
              Are you sure you want to delete this consultation session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 flex gap-3 sm:justify-end">
            <Button variant="outline" className="rounded-xl h-12 px-6 text-sm font-semibold" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              disabled={isDeleting}
              className="rounded-xl h-12 px-6 bg-red-600 hover:bg-red-700 text-sm font-semibold cursor-pointer" 
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
