"use client";

import React, { useState, useRef, useCallback, memo } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputAreaProps {
  onSend: (message: string) => void;
  isGenerating: boolean;
  loadingSession: boolean;
}

/**
 * Isolated Chat Input Component.
 * Managing local typing state inside this component ensures keystrokes
 * never re-render the message list or trigger markdown re-parsing.
 */
export const ChatInputArea = memo(function ChatInputArea({
  onSend,
  isGenerating,
  loadingSession,
}: ChatInputAreaProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating || loadingSession) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isGenerating, loadingSession, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  }, []);

  const isButtonDisabled = !input.trim() || isGenerating || loadingSession;

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50/95 to-transparent pt-16 pb-7 px-4 pointer-events-none z-10">
      <div className="max-w-4xl mx-auto relative pointer-events-auto">
        <div className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 focus-within:ring-4 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all duration-300 flex items-end overflow-hidden">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isGenerating
                ? "Denova is responding..."
                : "Ask Denova anything about dental symptoms, treatments, or care..."
            }
            className="min-h-[76px] max-h-[220px] border-0 focus-visible:ring-0 resize-none py-5 px-6 text-base font-medium text-slate-900 bg-transparent placeholder:text-slate-400"
            disabled={isGenerating || loadingSession}
          />
          <div className="p-3 shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                onClick={handleSend}
                disabled={isButtonDisabled}
                size="icon"
                className="h-12 w-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send size={20} className={!isButtonDisabled ? "ml-0.5" : ""} />
              </Button>
            </motion.div>
          </div>
        </div>
        <div className="text-center mt-3">
          <span className="text-xs font-semibold text-slate-400">
            Denova AI provides clinical dental information. Always consult a licensed dentist for emergencies or formal diagnoses.
          </span>
        </div>
      </div>
    </div>
  );
});
