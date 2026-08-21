"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, RefreshCw, Search, UserRound } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type ChatSession = {
  id: number | string;
  patientName: string;
  patientEmail: string;
  title: string;
  messageCount: number;
  createdDate: string;
};

type TranscriptMessage = {
  id?: number | string;
  sender: string;
  content: string;
  timestamp?: string;
};

function normalizeSession(session: Record<string, unknown>): ChatSession {
  const rawDate = session.created_at || session.createdAt || session.timestamp;
  return {
    id: (session.id as number | string) ?? "unknown",
    patientName: String(session.patient_name || session.patientName || session.user_name || session.userName || "Unknown patient"),
    patientEmail: String(session.patient_email || session.patientEmail || session.user_email || session.userEmail || ""),
    title: String(session.title || session.session_title || session.sessionTitle || "Untitled consultation"),
    messageCount: Number(session.message_count ?? session.messageCount ?? 0) || 0,
    createdDate: rawDate ? new Date(String(rawDate)).toLocaleString() : "Not available",
  };
}

function normalizeTranscriptMessage(message: Record<string, unknown>): TranscriptMessage {
  return {
    id: message.id as number | string | undefined,
    sender: String(message.sender || message.role || "assistant"),
    content: String(message.content || message.text || ""),
    timestamp: message.timestamp ? new Date(String(message.timestamp)).toLocaleString() : undefined,
  };
}

export default function AdminChatLogsPage() {
  const router = useRouter();
  const { token, logout, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [transcript, setTranscript] = useState<TranscriptMessage[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);

  const fetchSessions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/api/admin/chats/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      setSessions(Array.isArray(response.data) ? response.data.map(normalizeSession) : []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setErrorMessage("Unable to load chat sessions. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [logout, router, token]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
      return;
    }
    if (token) void fetchSessions();
  }, [authLoading, fetchSessions, router, token]);

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sessions;
    return sessions.filter((session) => session.patientName.toLowerCase().includes(query) || session.patientEmail.toLowerCase().includes(query));
  }, [searchQuery, sessions]);

  const handleViewTranscript = async (session: ChatSession) => {
    if (!token) return;
    setSelectedSession(session);
    setTranscript([]);
    setTranscriptLoading(true);
    setIsTranscriptOpen(true);
    setErrorMessage(null);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/api/admin/chats/sessions/${session.id}/transcript`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      const messages = Array.isArray(response.data) ? response.data : response.data?.messages;
      setTranscript(Array.isArray(messages) ? messages.map(normalizeTranscriptMessage) : []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setErrorMessage(axios.isAxiosError(error) ? error.response?.data?.detail || "Unable to load transcript." : "Unable to load transcript.");
    } finally {
      setTranscriptLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clinical Chat Logs & Transcripts</h1>
          <p className="mt-1 text-sm text-slate-600">Review patient consultation sessions and read-only transcripts.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void fetchSessions()} disabled={loading}><RefreshCw size={15} className="mr-2" />Refresh</Button>
      </div>

      {errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{errorMessage}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 p-5">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by patient name or email" className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Patient Name</th><th className="p-4">Patient Email</th><th className="p-4">Session Title</th><th className="p-4">Message Count</th><th className="p-4">Created Date</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="p-6"><Skeleton className="h-8 w-full" /></td></tr> : filteredSessions.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">No chat sessions found.</td></tr> : filteredSessions.map((session) => <tr key={session.id} className="border-t border-slate-100"><td className="p-4 font-semibold text-slate-900">{session.patientName}</td><td className="p-4 text-slate-600">{session.patientEmail}</td><td className="p-4 text-slate-700">{session.title}</td><td className="p-4 text-slate-600">{session.messageCount}</td><td className="p-4 text-slate-600">{session.createdDate}</td><td className="p-4 text-right"><Button type="button" variant="outline" size="sm" onClick={() => void handleViewTranscript(session)}><Eye size={14} className="mr-1.5" />View Transcript</Button></td></tr>)}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden rounded-2xl p-0">
          <DialogHeader className="border-b border-slate-200 p-5">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900"><UserRound size={18} className="text-emerald-600" />{selectedSession?.title || "Transcript"}</DialogTitle>
            <DialogDescription className="text-sm text-slate-600">{selectedSession?.patientName} · {selectedSession?.patientEmail}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[65vh] space-y-3 overflow-y-auto bg-slate-50 p-5">
            {transcriptLoading ? <Skeleton className="h-24 w-full" /> : transcript.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No transcript messages found.</p> : transcript.map((message, index) => {
              const isUser = message.sender.toLowerCase() === "user" || message.sender.toLowerCase() === "patient";
              return <div key={message.id ?? index} className={`flex ${isUser ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-xl border p-3 ${isUser ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-white"}`}><div className="mb-1 flex items-center justify-between gap-4 text-xs font-semibold uppercase tracking-wide text-slate-500"><span>{isUser ? "Patient" : "Assistant"}</span>{message.timestamp && <span className="font-normal normal-case tracking-normal">{message.timestamp}</span>}</div><p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">{message.content}</p></div></div>;
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
