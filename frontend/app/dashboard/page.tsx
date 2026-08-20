"use client";

import { memo, useCallback, useState, useRef, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, 
  Send, 
  AlertCircle, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  AlertTriangle, 
  Loader2,
  Copy,
  Check,
  Pencil
} from "lucide-react";
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
  timestamp?: string;
};

type MessageItemProps = {
  msg: Message;
  formattedContent: string;
};

const MessageItem = memo(function MessageItem({ msg, formattedContent }: MessageItemProps) {
  return (
    <div className="flex gap-4">
      {msg.role === "ai" && (
        <div className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center text-white shadow-sm mt-1 ${
          msg.isRateLimit ? "bg-amber-600" : msg.isError ? "bg-red-500" : "bg-emerald-600"
        }`}>
          {msg.isRateLimit ? <AlertTriangle size={22} /> : <Stethoscope size={22} />}
        </div>
      )}

      <div className={`flex flex-col gap-2.5 min-w-0 ${msg.role === "user" ? "items-end" : "items-start"}`}>
        <div className={`
          p-5 sm:p-6 rounded-3xl text-base leading-relaxed shadow-sm font-normal
          ${msg.role === "user"
            ? "bg-linear-to-br from-emerald-600 to-teal-700 text-white rounded-tr-sm shadow-[0_4px_16px_rgb(5,150,105,0.22)]"
            : msg.isRateLimit
              ? "bg-amber-50 text-amber-900 border border-amber-200 rounded-tl-sm flex items-start gap-3"
              : msg.isError
                ? "bg-red-50 text-red-700 border border-red-200 rounded-tl-sm flex items-center gap-3 font-medium"
                : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-sm shadow-xs"
          }
        `}>
          {msg.isRateLimit ? <AlertTriangle size={22} className="shrink-0 text-amber-600 mt-0.5" /> : null}
          {msg.isError ? <AlertCircle size={22} className="shrink-0 text-red-500" /> : null}
          {msg.role === "user" ? (
            <span className="whitespace-pre-wrap font-medium text-base leading-relaxed tracking-normal">{msg.content}</span>
          ) : msg.isError || msg.isRateLimit ? (
            <span className="whitespace-pre-wrap text-base">{msg.content}</span>
          ) : (
            <div className="prose prose-slate max-w-none text-slate-800 text-base leading-relaxed prose-p:my-2.5 prose-p:leading-relaxed prose-p:first:mt-0 prose-p:last:mb-0 prose-strong:font-bold prose-strong:text-slate-900 prose-ul:my-2.5 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-2.5 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-1 prose-headings:font-bold prose-headings:text-slate-900 prose-headings:my-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{formattedContent}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

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
      content: "Hello! I'm Denova, your AI dental assistant. How can I help you with your oral health and smile today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(20);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollToBottom = useCallback((targetId?: string, behavior: ScrollBehavior = "smooth") => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      const target = targetId ? document.getElementById(`msg-${targetId}`) : messagesEndRef.current;
      target?.scrollIntoView({ behavior, block: targetId ? "start" : "nearest" });
      scrollTimeoutRef.current = null;
    }, 500);
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

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
      setDisplayedCount(20);
      setMessages([
        {
          id: "initial_welcome",
          role: "ai",
          content: "Hello! I'm Denova, your AI dental assistant. How can I help you with your oral health and smile today?",
        }
      ]);
      return;
    }

    let isMounted = true;
    async function loadSessionMessages() {
      setLoadingSession(true);
      setDisplayedCount(20);
      setMessages([]);
      try {
        const res = await axios.get(`http://127.0.0.1:8000/api/chat/sessions/${sessionQuery}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 10000,
        });

        if (isMounted && Array.isArray(res.data)) {
          const loaded: Message[] = res.data.map((m: { sender: string; content: string; timestamp?: string }, idx: number) => ({
            id: `loaded_${sessionQuery}_${idx}`,
            role: m.sender === "user" ? "user" : "ai",
            content: m.content,
            timestamp: m.timestamp,
          }));
          setMessages(loaded.length > 0 ? loaded : [{
            id: "empty_session",
            role: "ai",
            content: "This consultation does not have any messages yet.",
          }]);
          // Scroll to bottom on initial session load
          scrollToBottom(undefined, "auto");
        }
      } catch {
        if (isMounted) {
          setMessages([{
            id: "session_load_error",
            role: "ai",
            content: "I couldn't load this consultation. Please try selecting it again.",
            isError: true,
          }]);
        }
      } finally {
        if (isMounted) setLoadingSession(false);
      }
    }

    loadSessionMessages();
    return () => { isMounted = false; };
  }, [scrollToBottom, sessionQuery, token]);

  const toggleSources = useCallback((msgId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  }, []);

  const handleCopyResponse = useCallback(async (msgId: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(msgId);
      setTimeout(() => {
        setCopiedId(prev => (prev === msgId ? null : prev));
      }, 2000);
    } catch {
      // Fallback copy if clipboard API is restricted
      const textarea = document.createElement("textarea");
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedId(msgId);
      setTimeout(() => {
        setCopiedId(prev => (prev === msgId ? null : prev));
      }, 2000);
    }
  }, []);

  const handleEditUserMessage = useCallback((content: string) => {
    setInput(content);
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = content.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 50);
  }, []);

  const handleLoadMore = () => {
    setDisplayedCount(prev => prev + 20);
  };

  const visibleMessages = messages.slice(-displayedCount);

  const handleSend = async () => {
    const trimmedInput = input.trim();
    if (!trimmedInput || isTyping) return;

    if (!token) {
      router.push("/login");
      return;
    }
    
    const userMsgId = `user_${Date.now()}`;
    const userMsg: Message = { 
      id: userMsgId, 
      role: "user", 
      content: trimmedInput 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Smoothly scroll down to reveal the user message and thinking indicator
    scrollToBottom();

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

      // Notify Sidebar to immediately update and reorder recent sessions list to top
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("chat-session-updated", { 
          detail: { sessionId: session_id || currentSessionId } 
        }));
      }

      // Parse context chunks if available
      let sourceChunks: string[] = [];
      if (context && typeof context === "string") {
        sourceChunks = context
          .split(/\n\s*\n/)
          .map(chunk => chunk.trim())
          .filter(chunk => chunk.length > 0);
      }

      const aiMsgId = `ai_${Date.now()}`;
      const aiMsg: Message = {
        id: aiMsgId,
        role: "ai",
        content: answer || "I received your query but no answer was provided.",
        sources: sourceChunks.length > 0 ? sourceChunks : undefined
      };

      setMessages(prev => [...prev, aiMsg]);

      // FIX AUTO-SCROLL: Anchor to the top of Denova's newly generated response
      // so the user sees the start/top of the response first, rather than jumping to the bottom!
      scrollToBottom(aiMsgId);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        // Handle 429 Rate-Limit response specifically with backend's detail text
        if (status === 429) {
          const rateLimitDetail = 
            (typeof err.response?.data?.detail === "string" ? err.response.data.detail : null) ||
            err.response?.data?.message ||
            "You've reached your daily limit of messages. Please try again tomorrow.";

          const errorId = `rate_${Date.now()}`;
          setMessages(prev => [...prev, {
            id: errorId,
            role: "ai",
            content: rateLimitDetail,
            isError: true,
            isRateLimit: true
          }]);

          scrollToBottom(errorId);
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
      const errorId = `err_${Date.now()}`;
      const errorMsg: Message = {
        id: errorId,
        role: "ai",
        content: "Something went wrong while consulting the clinical assistant. Please try again.",
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);

      scrollToBottom(errorId);
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
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto pb-48 scroll-smooth"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 flex flex-col gap-8">
          {loadingSession ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
              <span className="text-base font-semibold text-slate-500">Loading consultation messages...</span>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {displayedCount < messages.length && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLoadMore}
                    className="rounded-xl border-slate-200 bg-white text-sm font-semibold text-slate-600 hover:text-emerald-700"
                  >
                    Load older messages
                  </Button>
                </div>
              )}
              {visibleMessages.map((msg) => {
                const formattedContent = msg.content
                  ? msg.content.replace(/<br\s*\/?>/gi, "\n")
                  : "";

                return (
                  <motion.div
                    key={msg.id}
                    id={`msg-${msg.id}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`scroll-mt-6 flex flex-col gap-4 max-w-[90%] md:max-w-[85%] ${
                      msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                    }`}
                  >
                    <MessageItem msg={msg} formattedContent={formattedContent} />

                      {/* Action Bar: Copy Response for Assistant, Edit Query for User */}
                      <div className="flex items-center gap-2 px-1">
                        {msg.role === "ai" && !msg.isError && (
                          <button
                            type="button"
                            onClick={() => handleCopyResponse(msg.id, msg.content)}
                            title={copiedId === msg.id ? "Copied response to clipboard!" : "Copy response"}
                            aria-label={copiedId === msg.id ? "Copied response to clipboard" : "Copy response"}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-emerald-500 select-none ${
                              copiedId === msg.id
                                ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
                            }`}
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check size={14} className="text-emerald-600 animate-in zoom-in-50 duration-150" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={14} className="text-slate-500" />
                                <span>Copy Response</span>
                              </>
                            )}
                          </button>
                        )}

                        {msg.role === "user" && (
                          <button
                            type="button"
                            onClick={() => handleEditUserMessage(msg.content)}
                            title="Edit and modify this query"
                            aria-label="Edit and modify this query"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-all cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-emerald-500 select-none"
                          >
                            <Pencil size={13} className="text-emerald-600" />
                            <span>Edit Query</span>
                          </button>
                        )}
                      </div>

                      {/* Sources Collapsible Snippets Section */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="w-full max-w-2xl space-y-2 mt-1">
                          <button
                            type="button"
                            onClick={() => toggleSources(msg.id)}
                            suppressHydrationWarning
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-800 transition-colors shadow-2xs cursor-pointer select-none"
                          >
                            <BookOpen size={15} className="text-emerald-600" />
                            <span>Clinical Sources & Evidence ({msg.sources.length})</span>
                            {expandedSources[msg.id] ? (
                              <ChevronUp size={15} className="text-slate-400" />
                            ) : (
                              <ChevronDown size={15} className="text-slate-400" />
                            )}
                          </button>

                          {/* Expanded Snippets */}
                          {expandedSources[msg.id] && (
                            <div className="space-y-2 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                              {msg.sources.map((chunk, i) => (
                                <div 
                                  key={i} 
                                  className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs text-xs sm:text-sm text-slate-700 leading-relaxed font-normal space-y-1.5"
                                >
                                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 border-b border-slate-100 pb-1.5">
                                    <FileText size={14} className="text-emerald-600 shrink-0" />
                                    <span>Evidence Reference #{i + 1}</span>
                                  </div>
                                  <p className="whitespace-pre-wrap text-slate-600 pt-0.5">{chunk}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
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
                    className="w-11 h-11 rounded-2xl bg-emerald-50 shrink-0 flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-sm mt-1"
                  >
                    <Stethoscope size={22} />
                  </motion.div>
                  <div className="flex items-center gap-2 p-5 py-6 rounded-3xl bg-white border border-slate-200 rounded-tl-sm shadow-sm h-fit">
                    <span className="text-sm font-medium text-slate-500 mr-2">Denova is analyzing clinical data...</span>
                    <motion.div animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <motion.div animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <motion.div animate={{ y: [0, -5, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} className="h-6" />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-slate-50 via-slate-50/95 to-transparent pt-16 pb-7 px-4 pointer-events-none">
        <div className="max-w-4xl mx-auto relative pointer-events-auto">
          <div className="relative bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-200 focus-within:ring-4 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 transition-all duration-300 flex items-end overflow-hidden">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Denova anything about dental symptoms, treatments, or care..."
              className="min-h-19 max-h-55 border-0 focus-visible:ring-0 resize-none py-5 px-6 text-base font-medium text-slate-900 bg-transparent placeholder:text-slate-400"
              disabled={isTyping || loadingSession}
            />
            <div className="p-3 shrink-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping || loadingSession}
                  size="icon"
                  className="h-12 w-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <Send size={20} className={input.trim() && !isTyping ? "ml-0.5" : ""} />
                </Button>
              </motion.div>
            </div>
          </div>
          <div className="text-center mt-3">
            <span className="text-xs font-semibold text-slate-400">Denova AI provides clinical dental information. Always consult a licensed dentist for emergencies or formal diagnoses.</span>
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
