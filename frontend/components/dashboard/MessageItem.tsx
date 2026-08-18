"use client";

import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Stethoscope, 
  AlertCircle, 
  FileText, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  AlertTriangle, 
  Copy, 
  Check,
  RotateCcw,
  RefreshCw
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: string[];
  isError?: boolean;
  isRateLimit?: boolean;
  timestamp?: string;
  retryQuery?: string;
};

interface MessageItemProps {
  msg: Message;
  isExpanded: boolean;
  isCopied: boolean;
  onToggleSources: (id: string) => void;
  onCopy: (id: string, content: string) => void;
  onRetry?: (query: string) => void;
  onResetQuota?: () => void;
}

/**
 * Memoized Message Item Component.
 * Stable animations and memoization prevent flickering and layout shift.
 */
export const MessageItem = memo(function MessageItem({
  msg,
  isExpanded,
  isCopied,
  onToggleSources,
  onCopy,
  onRetry,
  onResetQuota,
}: MessageItemProps) {
  const formattedContent = useMemo(() => {
    return msg.content ? msg.content.replace(/<br\s*\/?>/gi, "\n") : "";
  }, [msg.content]);

  return (
    <motion.div
      id={`msg-${msg.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`scroll-mt-6 flex gap-4 max-w-[90%] md:max-w-[85%] ${
        msg.role === "user" ? "ml-auto flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      {msg.role === "ai" && (
        <div
          className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center text-white shadow-sm mt-1 ${
            msg.isRateLimit
              ? "bg-amber-600"
              : msg.isError
              ? "bg-red-500"
              : "bg-emerald-600"
          }`}
        >
          {msg.isRateLimit ? <AlertTriangle size={22} /> : <Stethoscope size={22} />}
        </div>
      )}

      <div className={`flex flex-col gap-2.5 min-w-0 ${msg.role === "user" ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div
          className={`p-5 sm:p-6 rounded-3xl text-base leading-relaxed shadow-sm font-normal ${
            msg.role === "user"
              ? "bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-sm shadow-[0_4px_16px_rgb(5,150,105,0.22)]"
              : msg.isRateLimit
              ? "bg-amber-50 text-amber-900 border border-amber-200 rounded-tl-sm flex flex-col gap-3"
              : msg.isError
              ? "bg-red-50 text-red-700 border border-red-200 rounded-tl-sm flex flex-col gap-2 font-medium"
              : "bg-white border border-slate-200/90 text-slate-800 rounded-tl-sm shadow-xs"
          }`}
        >
          {msg.isRateLimit && (
            <div className="flex items-center gap-2 font-bold text-amber-800">
              <AlertTriangle size={20} className="shrink-0 text-amber-600" />
              <span>Daily Consultation Limit Reached</span>
            </div>
          )}

          {msg.isError && !msg.isRateLimit && (
            <div className="flex items-center gap-2 font-semibold text-red-800 mb-1">
              <AlertCircle size={20} className="shrink-0 text-red-600" />
              <span>Response Error</span>
            </div>
          )}

          {/* Message Content */}
          {msg.role === "user" ? (
            <span className="whitespace-pre-wrap font-medium text-base leading-relaxed tracking-normal">
              {msg.content}
            </span>
          ) : msg.isRateLimit ? (
            <div className="space-y-3">
              <p className="whitespace-pre-wrap text-base text-amber-900 font-normal leading-relaxed">{msg.content}</p>
              {onResetQuota && (
                <div className="pt-1 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onResetQuota}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    <RefreshCw size={15} />
                    <span>Reset Daily Limit</span>
                  </button>
                  <span className="text-xs font-medium text-amber-700">Resets message counter to 100 messages.</span>
                </div>
              )}
            </div>
          ) : msg.isError ? (
            <div className="space-y-2">
              <p className="whitespace-pre-wrap text-base">{msg.content}</p>
              {msg.retryQuery && onRetry && (
                <button
                  type="button"
                  onClick={() => onRetry(msg.retryQuery!)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold transition-colors cursor-pointer mt-1"
                >
                  <RotateCcw size={13} />
                  <span>Retry Question</span>
                </button>
              )}
            </div>
          ) : (
            <div className="prose prose-slate max-w-none text-slate-800 text-base leading-relaxed prose-p:my-2.5 prose-p:leading-relaxed prose-p:first:mt-0 prose-p:last:mb-0 prose-strong:font-bold prose-strong:text-slate-900 prose-ul:my-2.5 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-2.5 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-1 prose-headings:font-bold prose-headings:text-slate-900 prose-headings:my-3">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ ...props }) => (
                    <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-2 tracking-tight" {...props} />
                  ),
                  h2: ({ ...props }) => (
                    <h2 className="text-xl font-bold text-slate-900 mt-3 mb-2" {...props} />
                  ),
                  h3: ({ ...props }) => (
                    <h3 className="text-lg font-bold text-slate-900 mt-2 mb-1" {...props} />
                  ),
                  table: ({ ...props }) => (
                    <div className="my-4 w-full overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                      <table className="w-full text-left text-sm border-collapse" {...props} />
                    </div>
                  ),
                  thead: ({ ...props }) => (
                    <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-900 font-bold uppercase text-xs tracking-wider" {...props} />
                  ),
                  tbody: ({ ...props }) => (
                    <tbody className="divide-y divide-slate-100 bg-white text-slate-700" {...props} />
                  ),
                  tr: ({ ...props }) => (
                    <tr className="hover:bg-slate-50/70 transition-colors" {...props} />
                  ),
                  th: ({ ...props }) => (
                    <th className="px-4 py-3.5 font-bold text-slate-800 border-r border-slate-200/70 last:border-r-0" {...props} />
                  ),
                  td: ({ ...props }) => (
                    <td className="px-4 py-3.5 align-top leading-relaxed text-slate-600 font-medium border-r border-slate-100 last:border-r-0" {...props} />
                  ),
                  p: ({ ...props }) => (
                    <p className="my-2.5 leading-relaxed text-base first:mt-0 last:mb-0" {...props} />
                  ),
                  ul: ({ ...props }) => (
                    <ul className="my-2.5 list-disc list-outside pl-6 space-y-1 text-base" {...props} />
                  ),
                  ol: ({ ...props }) => (
                    <ol className="my-2.5 list-decimal list-outside pl-6 space-y-1 text-base" {...props} />
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

        {/* Action Bar: Copy Response for Assistant */}
        {msg.role === "ai" && !msg.isError && !msg.isRateLimit && (
          <div className="flex items-center gap-2 px-1">
            <button
              type="button"
              onClick={() => onCopy(msg.id, msg.content)}
              title={isCopied ? "Copied structured response to clipboard!" : "Copy response (Structured format)"}
              aria-label={isCopied ? "Copied response to clipboard" : "Copy response in structured format"}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer shadow-2xs focus-visible:ring-2 focus-visible:ring-emerald-500 select-none ${
                isCopied
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                  : "bg-white hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              {isCopied ? (
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
          </div>
        )}

        {/* Sources Collapsible Snippets Section */}
        {msg.sources && msg.sources.length > 0 && (
          <div className="w-full max-w-2xl space-y-2 mt-1">
            <button
              type="button"
              onClick={() => onToggleSources(msg.id)}
              suppressHydrationWarning
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-800 transition-colors shadow-2xs cursor-pointer select-none"
            >
              <BookOpen size={15} className="text-emerald-600" />
              <span>Clinical Sources & Evidence ({msg.sources.length})</span>
              {isExpanded ? (
                <ChevronUp size={15} className="text-slate-400" />
              ) : (
                <ChevronDown size={15} className="text-slate-400" />
              )}
            </button>

            {/* Expanded Snippets */}
            {isExpanded && (
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
      </div>
    </motion.div>
  );
});
