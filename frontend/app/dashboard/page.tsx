"use client";

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { formatMarkdownToStructuredText } from "@/lib/utils";
import { MessageItem, Message } from "@/components/dashboard/MessageItem";
import { ChatInputArea } from "@/components/dashboard/ChatInputArea";
import axios from "axios";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const BACKEND_CHAT_URL = `${BACKEND_BASE_URL}/api/chat/`;

const WELCOME_MESSAGE: Message = {
  id: "initial_welcome",
  role: "ai",
  content: "Hello! I'm Denova, your AI dental assistant. How can I help you with your oral health and smile today?",
};

function generateUniqueId(prefix: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomStr}`;
}

function DashboardChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionQuery = searchParams.get("session");
  const { token, logout, isLoading: authLoading } = useAuth();
  
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionQuery);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingSession, setLoadingSession] = useState(false);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Tracks the session ID that is currently loaded in state to avoid redundant re-fetches and flickering
  const currentLoadedSessionRef = useRef<string | null>(sessionQuery);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Immediate authentication guard
  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    }
  }, [token, authLoading, router]);

  // Load session messages when user switches session from sidebar or history
  useEffect(() => {
    // If the sessionQuery is already what is loaded in state, do not re-fetch (prevents flicker on new query)
    if (sessionQuery === currentLoadedSessionRef.current) {
      return;
    }

    currentLoadedSessionRef.current = sessionQuery;
    setCurrentSessionId(sessionQuery);

    if (!sessionQuery || !token) {
      setMessages([WELCOME_MESSAGE]);
      return;
    }

    let isMounted = true;
    async function loadSessionMessages() {
      setLoadingSession(true);
      try {
        const res = await axios.get(`${BACKEND_BASE_URL}/api/chat/sessions/${sessionQuery}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 30000,
        });

        if (isMounted && Array.isArray(res.data)) {
          const loaded: Message[] = res.data.map((m: { sender: string; content: string; timestamp?: string }, idx: number) => ({
            id: generateUniqueId(`loaded_${sessionQuery}_${idx}`),
            role: m.sender === "user" ? "user" : "ai",
            content: m.content || "",
            timestamp: m.timestamp,
          }));

          // Always ensure the Welcome Message persists as the first message
          setMessages([WELCOME_MESSAGE, ...loaded]);
          
          setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
          }, 100);
        }
      } catch (err) {
        console.warn("Session messages load notice (retaining welcome):", err);
        if (isMounted) {
          setMessages([WELCOME_MESSAGE]);
        }
      } finally {
        if (isMounted) setLoadingSession(false);
      }
    }

    loadSessionMessages();
    return () => { isMounted = false; };
  }, [sessionQuery, token]);

  const toggleSources = useCallback((msgId: string) => {
    setExpandedSources(prev => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  }, []);

  const handleCopyResponse = useCallback(async (msgId: string, content: string) => {
    const structuredText = formatMarkdownToStructuredText(content);
    try {
      await navigator.clipboard.writeText(structuredText);
      setCopiedId(msgId);
      setTimeout(() => {
        setCopiedId(prev => (prev === msgId ? null : prev));
      }, 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = structuredText;
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

  const handleSendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isGenerating || loadingSession) return;

    if (!token) {
      router.push("/login");
      return;
    }
    
    // 1. Optimistic Update: Append user message additively
    const userMsgId = generateUniqueId("user");
    const userMsg: Message = { 
      id: userMsgId, 
      role: "user", 
      content: trimmed 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsGenerating(true);

    // 2. Smoothly scroll to bottom to show user query and thinking state
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);

    // 3. API Execution
    try {
      const response = await axios.post(BACKEND_CHAT_URL, {
        message: trimmed,
        session_id: currentSessionId ? Number(currentSessionId) : undefined
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 60000
      });

      const { answer, context, session_id } = response.data || {};

      // If a new session was created by backend, update the session ID and URL silently without re-triggering reload
      if (session_id && (!currentSessionId || currentSessionId !== session_id.toString())) {
        currentLoadedSessionRef.current = session_id.toString();
        setCurrentSessionId(session_id.toString());
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", `/dashboard?session=${session_id}`);
        }
      }

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

      // 4. Finalize the assistant message bubble additively
      const aiMsgId = generateUniqueId("ai");
      const aiMsg: Message = {
        id: aiMsgId,
        role: "ai",
        content: answer || "I received your query, but no clinical content was provided.",
        sources: sourceChunks.length > 0 ? sourceChunks : undefined
      };

      setMessages(prev => [...prev, aiMsg]);

      // 5. Auto-scroll anchor to the top of Denova's newly generated response
      setTimeout(() => {
        const targetElement = document.getElementById(`msg-${aiMsgId}`);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        } else {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      }, 80);

    } catch (err: unknown) {
      console.error("Chat consultation error:", err);
      let errorDetail = "Error: Could not retrieve response. Please check your connection and try again.";
      let isRateLimit = false;

      if (axios.isAxiosError(err)) {
        const status = err.response?.status;

        if (status === 429) {
          isRateLimit = true;
          errorDetail = 
            (typeof err.response?.data?.detail === "string" ? err.response.data.detail : null) ||
            err.response?.data?.message ||
            "You've reached your daily limit of messages. Please try again tomorrow.";
        } else if (status === 401) {
          logout();
          router.push("/login");
          return;
        } else if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
          errorDetail = "Error: The request took longer than expected to process. Please click Retry to ask again.";
        }
      }

      const errorId = generateUniqueId("err");
      const errorMsg: Message = {
        id: errorId,
        role: "ai",
        content: errorDetail,
        isError: true,
        isRateLimit,
        retryQuery: isRateLimit ? undefined : trimmed,
      };
      setMessages(prev => [...prev, errorMsg]);

      setTimeout(() => {
        document.getElementById(`msg-${errorId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } finally {
      setIsGenerating(false);
    }
  }, [currentSessionId, isGenerating, loadingSession, logout, token]);

  const handleRetry = useCallback((retryText: string) => {
    if (retryText) {
      handleSendMessage(retryText);
    }
  }, [handleSendMessage]);

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
            <div className="flex flex-col gap-8">
              {messages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  isExpanded={Boolean(expandedSources[msg.id])}
                  isCopied={copiedId === msg.id}
                  onToggleSources={toggleSources}
                  onCopy={handleCopyResponse}
                  onRetry={handleRetry}
                />
              ))}
            
              {/* Stable Thinking / Generating State */}
              <AnimatePresence>
                {isGenerating && (
                  <motion.div
                    key="typing_indicator"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
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
            </div>
          )}
          <div ref={messagesEndRef} className="h-6" />
        </div>
      </div>

      {/* Isolated Input Area */}
      <ChatInputArea
        onSend={handleSendMessage}
        isGenerating={isGenerating}
        loadingSession={loadingSession}
      />
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
