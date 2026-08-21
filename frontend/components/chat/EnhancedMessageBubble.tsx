"use client";

import { memo } from "react";
import { AlertCircle, AlertTriangle, Stethoscope } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ReceiptCard, ReceiptData } from "./ReceiptCard";
import { SlotPicker } from "./SlotPicker";
import { ListingsContainer, ClinicInfo, DoctorInfo, ServiceInfo } from "./ListingsCard";
import { parseMessageContent } from "./messageParser";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
  sources?: string[];
  isError?: boolean;
  isRateLimit?: boolean;
  receipt?: Record<string, any>;
  timestamp?: string;
};

interface EnhancedMessageBubbleProps {
  msg: Message;
  onSlotSelect?: (slot: string) => void;
}

const MarkdownContent = memo(function MarkdownContent({ content }: { content: string }) {
  const prepareMarkdown = (text: string) => {
    const normalized = text.replace(/<br\s*\/?>(?!\n)/gi, "\n");
    const codeFenceCount = (normalized.match(/```/g) || []).length;
    return codeFenceCount % 2 === 0 ? normalized : `${normalized}\n\n\`\`\``;
  };

  return (
    <div className="chat-message-content prose prose-slate max-w-none text-slate-800">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ ...props }) => <h1 className="text-2xl font-semibold text-slate-900 mt-4 mb-2" {...props} />,
          h2: ({ ...props }) => <h2 className="text-xl font-semibold text-slate-900 mt-3 mb-2" {...props} />,
          h3: ({ ...props }) => <h3 className="text-lg font-semibold text-slate-900 mt-2 mb-1" {...props} />,
          table: ({ ...props }) => (
            <div className="my-4 w-full overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-sm border-collapse" {...props} />
            </div>
          ),
          thead: ({ ...props }) => (
            <thead className="bg-slate-100 border-b border-slate-200 text-slate-900 font-semibold uppercase text-xs tracking-wider" {...props} />
          ),
          tbody: ({ ...props }) => <tbody className="divide-y divide-slate-100 bg-white text-slate-700" {...props} />,
          th: ({ ...props }) => (
            <th className="px-4 py-3 font-semibold text-slate-800 border-r border-slate-200 last:border-r-0" {...props} />
          ),
          td: ({ ...props }) => (
            <td className="px-4 py-3 align-top text-slate-600 border-r border-slate-100 last:border-r-0" {...props} />
          ),
        }}
      >
        {prepareMarkdown(content)}
      </ReactMarkdown>
    </div>
  );
});

/**
 * Enhanced message bubble that renders structured UI elements
 * (receipts, slot pickers, formatted lists) alongside natural text.
 * This component focuses on rendering the chat bubble content only.
 * Action bar and sources are handled by the parent component.
 */
export const EnhancedMessageBubble = memo(function EnhancedMessageBubble({
  msg,
  onSlotSelect,
}: EnhancedMessageBubbleProps) {
  if (msg.role === "user") {
    return (
      <div className={`flex gap-4 flex-row-reverse`}>
        <div className={`p-5 sm:p-6 rounded-3xl rounded-tr-sm font-normal bg-linear-to-br from-emerald-600 to-teal-700 text-white text-base shadow-[0_4px_16px_rgb(5,150,105,0.22)] chat-message-content`}>
          <span className="whitespace-pre-wrap">{msg.content}</span>
        </div>
      </div>
    );
  }

  // Handle error/rate limit messages
  if (msg.isError || msg.isRateLimit) {
    return (
      <div className="flex gap-4">
        <div className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center text-white shadow-sm mt-1 ${msg.isRateLimit ? "bg-amber-600" : "bg-red-500"}`}>
          {msg.isRateLimit ? <AlertTriangle size={22} /> : <AlertCircle size={22} />}
        </div>
        <div className={`p-5 sm:p-6 rounded-3xl rounded-tl-sm shadow-sm font-normal ${msg.isRateLimit ? "bg-amber-50 text-amber-900 border border-amber-200" : "bg-red-50 text-red-700 border border-red-200"} flex items-start gap-3`}>
          {msg.isRateLimit ? <AlertTriangle size={22} className="shrink-0 text-amber-600 mt-0.5" /> : <AlertCircle size={22} className="shrink-0 text-red-500" />}
          <span className="whitespace-pre-wrap">{msg.content}</span>
        </div>
      </div>
    );
  }

  // Parse the message content
  const parsed = parseMessageContent(msg.content, msg.receipt);

  // Determine if we should render the main message bubble
  // Skip it entirely if message is only slots/listings and has no significant intro text
  const hasSignificantText = parsed.mainText && parsed.mainText.trim().length > 0;
  const shouldRenderBubble = hasSignificantText || (!parsed.slots && !parsed.listings && !parsed.receipt);

  return (
    <>
      {/* Main message bubble with text content - skip if only slots/listings/receipt */}
      {shouldRenderBubble && (
        <div className="flex gap-4">
          <div className="w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center text-white bg-emerald-600 shadow-sm mt-1">
            <Stethoscope size={22} />
          </div>

          <div className={`flex flex-col gap-2.5 min-w-0`}>
            <div className={`p-4 sm:p-5 rounded-2xl text-sm font-normal bg-white border border-slate-200/90 text-slate-800 rounded-tl-sm shadow-xs`}>
              <MarkdownContent content={parsed.mainText || msg.content} />
            </div>
          </div>
        </div>
      )}

      {/* Structured UI Elements Below the Message Bubble */}
      {(parsed.receipt || parsed.slots || parsed.listings) && (
        <div className="flex gap-4 md:ml-16">
          <div className="flex flex-col gap-4 w-full">
            {/* Receipt card */}
            {parsed.receipt && <ReceiptCard receipt={parsed.receipt} />}

            {/* Slot picker - renders instead of message bubble when slots detected */}
            {parsed.slots && (
              <SlotPicker
                doctorName={parsed.slots.doctorName}
                date={parsed.slots.date}
                slots={parsed.slots.times}
                onSlotSelect={(slot) => {
                  if (onSlotSelect) {
                    onSlotSelect(slot);
                  }
                }}
              />
            )}

            {/* Listings - render instead of message bubble when listings detected */}
            {parsed.listings && (
              <ListingsContainer
                title={
                  parsed.listings.type === "clinics"
                    ? "Available Clinics"
                    : parsed.listings.type === "doctors"
                      ? "Available Doctors"
                      : "Available Services"
                }
                type={parsed.listings.type}
                items={parsed.listings.items}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
});
