"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Send, AlertCircle, FileText, ChevronDown, ChevronUp, BookOpen, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const BACKEND_CHAT_URL = process.env.NEXT_PUBLIC_CHAT_API_URL || "http://127.0.0.1:8000/api/chat/";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: string[];
  isError?: boolean;
  isRateLimit?: boolean;
};

function DashboardChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionQuery = searchParams.get("session");
  const { token, logout, isLoading: authLoading } = useAuth();
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionQuery);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial_welcome",
      role: "ai",
      content: "Hello! I'm Denova, your AI dental assistant. How can I help you with your smile today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Immediate authentication guard
  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    }
  }, [token, authLoading, router]);

  // Load session messages when session query param changes
  useEffect(() => {
    setCurrentSessionId(sessionQuery);

    if (!sessionQuery || !token) {
      if (!sessionQuery) {
        setMessages([
          {
            id: "initial_welcome",
            role: "ai",
            content: "Hello! I'm Denova, your AI dental assistant. How can I help you with your smile today?",
          }
        ]);
      }
      return;
    }

    let isMounted = true;
    async function loadSessionMessages() {
      setLoadingSession(true);
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/chat/sessions/${sessionQuery}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });

        if (isMounted && Array.isArray(res.data) && res.data.length > 0) {
          const loaded: Message[] = res.data.map((m: { sender: string; content: string }, idx: number) => ({
            id: `loaded_${sessionQuery}_${idx}`,
            role: m.sender === "user" ? "user" : "ai",
            content: m.content,
          }));
          setMessages(loaded);
        }
      } catch {
        // Retain welcome if failed
      } finally {
        if (isMounted) setLoadingSession(false);
      }
    }

    loadSessionMessages();
    return () => { isMounted = false; };
  }, [sessionQuery, token]);

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

    if (!token) {
      router.push("/login");
      return;
    }
    
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
        message: trimmedInput,
        session_id: currentSessionId ? Number(currentSessionId) : undefined
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      });

      const { answer, context, session_id } = response.data || {};

      // If a new session was created by backend, update the session ID and URL
      if (session_id && (!currentSessionId || currentSessionId !== session_id.toString())) {
        setCurrentSessionId(session_id.toString());
        router.replace(`/dashboard?session=${session_id}`);
      }

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
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        // Handle 429 Rate-Limit response specifically with backend's detail text
        if (status === 429) {
          const rateLimitDetail = 
            (typeof err.response?.data?.detail === "string" ? err.response.data.detail : null) ||
            err.response?.data?.message ||
            "You've reached your daily limit of 20 messages. Please try again tomorrow.";

          setMessages(prev => [...prev, {
            id: `rate_${Date.now()}`,
            role: "ai",
            content: rateLimitDetail,
            isError: true,
            isRateLimit: true
          }]);
          return;
        }

        // Handle 401 Expired or Invalid Session specifically
        if (status === 401) {
          logout();
          router.push("/login");
          return;
        }
      }

      // Fallback clean inline error bubble for network errors, 500s, timeouts
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
    <div className="flex flex-col h-full relative bg-slate-50 font-sans" suppressHydrationWarning>
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pb-48 scroll-smooth">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 flex flex-col gap-8">
          {loadingSession ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const formattedContent = msg.content
                  ? msg.content.replace(/<br\s*\/?>/gi, "\n")
                  : "";

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    {msg.role === "ai" && (
                      <div className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center text-white shadow-sm mt-1 ${
                        msg.isRateLimit ? "bg-amber-600" : msg.isError ? "bg-red-500" : "bg-emerald-600"
                      }`}>
                        {msg.isRateLimit ? <AlertTriangle size={20} /> : <Stethoscope size={20} />}
                      </div>
                    )}
                    
                    <div className={`flex flex-col gap-3.5 ${msg.role === "user" ? "items-end" : "items-start"}`}>
                      {/* Bubble */}
                      <div className={`
                        p-5 rounded-3xl text-base leading-relaxed shadow-sm font-medium
                        ${msg.role === "user" 
                          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-sm shadow-[0_4px_15px_rgb(5,150,105,0.2)]" 
                          : msg.isRateLimit
                            ? "bg-amber-50 text-amber-900 border border-amber-200 rounded-tl-sm flex items-start gap-2.5"
                            : msg.isError 
                            ? "bg-red-50 text-red-600 border border-red-100 rounded-tl-sm flex items-center gap-2"
                            : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm"
                        }
                      `}>
                        {msg.isRateLimit ? (
                          <AlertTriangle size={20} className="shrink-0 text-amber-600 mt-0.5" />
                        ) : msg.isError ? (
                          <AlertCircle size={20} className="shrink-0 text-red-500" />
                        ) : null}

                        {/* AI message markdown parsing with GFM table support vs user plain text */}
                        {msg.role === "user" ? (
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        ) : msg.isError || msg.isRateLimit ? (
                          <span className="whitespace-pre-wrap">{msg.content}</span>
                        ) : (
                          <div className="prose prose-slate max-w-none text-slate-800 prose-p:my-2 prose-p:leading-relaxed prose-p:first:mt-0 prose-p:last:mb-0 prose-strong:font-bold prose-strong:text-slate-900 prose-ul:my-2 prose-ul:list-disc prose-ul:pl-5 prose-ol:my-2 prose-ol:list-decimal prose-ol:pl-5 prose-li:my-0.5 prose-headings:font-bold prose-headings:text-slate-900 prose-headings:my-2">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              components={{
                                table: ({ ...props }) => (
                                  <div className="my-3.5 w-full overflow-x-auto rounded-2xl border border-slate-200/90 shadow-2xs">
                                    <table className="w-full text-left text-xs sm:text-sm border-collapse" {...props} />
                                  </div>
                                ),
                                thead: ({ ...props }) => (
                                  <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-[11px] tracking-wider" {...props} />
                                ),
                                tbody: ({ ...props }) => (
                                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700 font-normal" {...props} />
                                ),
                                tr: ({ ...props }) => (
                                  <tr className="hover:bg-slate-50/70 transition-colors" {...props} />
                                ),
                                th: ({ ...props }) => (
                                  <th className="px-4 py-3 font-bold text-slate-800 border-r border-slate-200/70 last:border-r-0" {...props} />
                                ),
                                td: ({ ...props }) => (
                                  <td className="px-4 py-3 align-top leading-relaxed text-slate-600 font-medium border-r border-slate-100 last:border-r-0" {...props} />
                                ),
                                p: ({ ...props }) => (
                                  <p className="my-2 leading-relaxed first:mt-0 last:mb-0" {...props} />
                                ),
                                ul: ({ ...props }) => (
                                  <ul className="my-2 list-disc list-outside pl-5 space-y-1" {...props} />
                                ),
                                ol: ({ ...props }) => (
                                  <ol className="my-2 list-decimal list-outside pl-5 space-y-1" {...props} />
                                ),
                                strong: ({ ...props }) => (
                                  <strong className="font-bold text-slate-900" {...props} />
                                ),
                              }}
                            >
                              {formattedContent}
                            </ReactMarkdown>
                          </div>
                        )}
                      </div>

                      {/* Sources Collapsible Snippets Section */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="w-full max-w-xl space-y-2 mt-0.5">
                          <button
                            type="button"
                            onClick={() => toggleSources(msg.id)}
                            suppressHydrationWarning
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
              );
            })}
            
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
        )}
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
            disabled={isTyping || loadingSession}
          />
          <div className="p-3 shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping || loadingSession}
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

export default function DashboardChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    }>
      <DashboardChatContent />
    </Suspense>
  );
}
