"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Calendar, Trash2, ChevronRight, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const initialHistory = [
  { id: "1", title: "Sensitivity in lower molars", date: "Today, 10:30 AM", preview: "Based on the symptoms you described, it's possible you're experiencing dentin..." },
  { id: "2", title: "Whitening options comparison", date: "Yesterday, 2:15 PM", preview: "Professional in-office whitening generally provides the fastest and most dramatic..." },
  { id: "3", title: "Bleeding gums during flossing", date: "Aug 10, 2026", preview: "Occasional bleeding when you start flossing is normal, but if it persists..." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function HistoryPage() {
  const [history, setHistory] = useState(initialHistory);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const handleDelete = () => {
    if (itemToDelete) {
      setHistory(prev => prev.filter(h => h.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Chat History</h2>
        <p className="text-slate-500 mt-2 font-medium">Review your past conversations and medical guidance.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid gap-4">
        <AnimatePresence>
          {history.map((item) => (
            <motion.div 
              key={item.id}
              variants={itemVariants}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex items-start gap-5 cursor-pointer"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 mt-1">
                <MessageSquare size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-slate-900 truncate pr-4">{item.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 shrink-0 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                    <Calendar size={12} />
                    {item.date}
                  </div>
                </div>
                <p className="text-slate-500 text-sm line-clamp-1 mb-3 font-medium">{item.preview}</p>
                <div className="flex items-center text-emerald-600 text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                  Continue conversation <ChevronRight size={16} className="ml-1" />
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl mt-1"
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
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-400">
                <History size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No history yet</h3>
              <p className="text-slate-500 font-medium">Your past conversations will appear here.</p>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="rounded-3xl p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Delete Conversation</DialogTitle>
            <DialogDescription className="text-base text-slate-500 mt-3 font-medium">
              Are you sure you want to delete this chat session? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 flex gap-3 sm:justify-end">
            <Button variant="outline" className="rounded-xl h-12 px-6 font-semibold" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-xl h-12 px-6 bg-red-600 hover:bg-red-700 font-semibold" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
