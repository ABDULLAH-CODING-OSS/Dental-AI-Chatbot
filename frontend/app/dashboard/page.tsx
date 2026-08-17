"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Send, AlertCircle, FileText, ChevronDown, ChevronUp, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";

const BACKEND_CHAT_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "http://127.0.0.1:8000/api/chat/";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: string[];
  isError?: boolean;
};

export default function DashboardChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial_welcome",
      role: "ai",
      content: "Hello! I'm Denova, your AI dental assistant. How can I help you with your smile today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const toggleSources = (msgId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;
    
    const userMsg: Message = { 
      id: `user_${Date.now()}`, 
      role: "user", 
      content: trimmedInput 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await axios.post(BACKEND_CHAT_URL, {
        message: trimmedInput
      }, {
        headers: {
          "Content-Type": "application/json"
        },
        timeout: 30000
      });

      const { answer, context } = response.data || {};

      // Parse context chunks if available
      let sourceChunks: string[] = [];
      if (context && typeof context === "string") {
        sourceChunks = context
          .split(/\n\s*\n/)
          .map(chunk => chunk.trim())
          .filter(chunk => chunk.length > 0);
      }

      const aiMsg: Message = {
        id: `ai_${Date.now()}`,
        role: "ai",
        content: answer || "I received your query but no answer was provided.",
        sources: sourceChunks.length > 0 ? sourceChunks : undefined
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch {
      // Clean user-facing error bubble on failure
      const errorMsg: Message = {
        id: `err_${Date.now()}`,
        role: "ai",
        content: "Something went wrong, please try again.",
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-slate-50 font-sans">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pb-48 scroll-smooth">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 flex flex-col gap-8">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
              >
                {/* Avatar */}
                {msg.role === "ai" && (
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600 shrink-0 flex items-center justify-center text-white shadow-sm mt-1">
                    <Stethoscope size={20} />
                  </div>
                )}
                
                <div className={`flex flex-col gap-3.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                  {/* Bubble */}
                  <div className={`
                    p-5 rounded-3xl text-base leading-relaxed shadow-sm font-medium
                    ${msg.role === "user" 
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgb(5,150,105,0.2)]" 
                      : msg.isError 
                        ? "bg-red-50 text-red-600 border border-red-100 rounded-tl-sm flex items-center gap-2"
                        : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm"
                    }
                  `}>
                    {msg.isError && <AlertCircle size={20} className="shrink-0 text-red-500" />}
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  </div>

                  {/* Sources Collapsible Snippets Section */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="w-full max-w-xl space-y-2 mt-0.5">
                      <button
                        type="button"
                        onClick={() => toggleSources(msg.id)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors shadow-2xs cursor-pointer select-none"
                      >
                        <BookOpen size={14} className="text-emerald-600" />
                        <span>Sources & Clinical Evidence ({msg.sources.length})</span>
                        {expandedSources[msg.id] ? (
                          <ChevronUp size={14} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={14} className="text-slate-400" />
                        )}
                      </button>

                      {/* Expanded Snippets */}
                      {expandedSources[msg.id] && (
                        <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          {msg.sources.map((chunk, i) => (
                            <div 
                              key={i} 
                              className="p-3.5 rounded-2xl bg-white/90 border border-slate-200 shadow-2xs text-xs text-slate-700 leading-relaxed font-medium space-y-1"
                            >
                              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-1">
                                <FileText size={12} className="text-emerald-600 shrink-0" />
                                <span>Reference Chunk #{i + 1}</span>
                              </div>
                              <p className="whitespace-pre-wrap text-slate-600 pt-0.5">{chunk}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            
            {/* Thinking State */}
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex gap-4 max-w-[85%]"
              >
                <motion.div 
                  animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-10 h-10 rounded-2xl bg-emerald-50 shrink-0 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm mt-1"
                >
                  <Stethoscope size={20} />
                </motion.div>
                <div className="flex items-center gap-1.5 p-5 py-6 rounded-3xl bg-white border border-slate-100 rounded-tl-sm shadow-sm h-fit">
                  <motion.div animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-2 h-2 rounded-full bg-slate-400" />
                  <motion.div animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2 h-2 rounded-full bg-slate-400" />
                  <motion.div animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2 h-2 rounded-full bg-slate-400" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent pt-20 pb-8 px-4">
        <div className="max-w-4xl mx-auto relative">
          <div className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 focus-within:ring-4 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all duration-300 flex items-end overflow-hidden">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Denova anything..."
              className="min-h-[72px] max-h-[200px] border-0 focus-visible:ring-0 resize-none py-5 px-6 text-base font-medium text-slate-900 bg-transparent"
              disabled={isTyping}
            />
            <div className="p-3 shrink-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="h-12 w-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all"
                >
                  <Send size={20} className={input.trim() && !isTyping ? "ml-1" : ""} />
                </Button>
              </motion.div>
            </div>
          </div>
          <div className="text-center mt-4">
            <span className="text-xs font-semibold text-slate-400">Denova AI can make mistakes. Consider verifying important health information.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
