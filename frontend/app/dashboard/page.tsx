"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Stethoscope, Send, AlertCircle, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: { title: string; url: string }[];
  isError?: boolean;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm Denova, your AI dental assistant. How can I help you with your smile today?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim() || isTyping) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate API delay and response
    setTimeout(() => {
      // Occasional fake error for demonstration (1 in 5 chance)
      if (Math.random() > 0.8) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "ai",
          content: "Something went wrong, please try again.",
          isError: true
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "ai",
          content: "Based on the symptoms you described, it's possible you're experiencing dentin hypersensitivity. This occurs when the protective enamel wears down, exposing the underlying dentin. \n\nI recommend using a desensitizing toothpaste and scheduling a check-up if the pain persists for more than a few days.",
          sources: [
            { title: "ADA Guidelines on Hypersensitivity", url: "#" },
            { title: "Enamel Erosion Study 2024", url: "#" }
          ]
        }]);
      }
      setIsTyping(false);
    }, 2500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-slate-50">
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
                
                <div className={`flex flex-col gap-3 ${msg.role === "user" ? "items-end" : "items-start"}`}>
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
                    {msg.isError && <AlertCircle size={20} className="shrink-0" />}
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  </div>

                  {/* RAG Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {msg.sources.map((src, i) => (
                        <a key={i} href={src.url} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl text-xs font-semibold text-slate-600 hover:text-emerald-700 transition-colors shadow-sm group cursor-pointer">
                          <FileText size={12} className="text-slate-400 group-hover:text-emerald-500" />
                          {src.title}
                          <ChevronRight size={12} className="text-slate-400 group-hover:text-emerald-500 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                        </a>
                      ))}
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
