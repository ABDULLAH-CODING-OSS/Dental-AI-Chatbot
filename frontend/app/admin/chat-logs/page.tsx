"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  MessageSquareText, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  User, 
  Copy, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Stethoscope, 
  X, 
  Eye 
} from "lucide-react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableHead, 
  TableRow, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { MOCK_CHAT_SESSIONS, ChatSession } from "@/lib/admin-mock-data";

export default function AdminChatLogsPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(MOCK_CHAT_SESSIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [isTranscriptOpen, setIsTranscriptOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesSearch = 
        s.sessionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" || s.flagStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchQuery, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const paginatedSessions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSessions.slice(start, start + pageSize);
  }, [filteredSessions, currentPage, pageSize]);

  const handleCopyTranscript = () => {
    if (!selectedSession) return;
    const formatted = selectedSession.messages
      .map((m) => `[${m.time}] ${m.sender === 'user' ? selectedSession.userName : 'Denova AI Assistant'}: ${m.text}`)
      .join("\n\n");
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm border border-purple-500/30 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical Chat Logs & Transcripts
            </h1>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-semibold px-2.5 py-0.5">
              {filteredSessions.length} Sessions Logged
            </Badge>
          </div>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Audit conversational interactions, triage safety guardrails, and clinical AI recommendations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => showNotification("Refreshed live conversation stream")}
            className="h-10 px-4 text-sm font-semibold border-slate-300 text-slate-700"
          >
            <Sparkles size={15} className="mr-2 text-purple-600" />
            Live Sync
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by session ID, patient name, or dental topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <span className="font-bold text-slate-600">Triage Flag:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer font-medium"
            >
              <option value="All">All Flags</option>
              <option value="Urgent">Urgent / Emergency</option>
              <option value="Clinical Review">Clinical Review</option>
              <option value="Safety Flag">Safety Guardrail</option>
              <option value="Normal">Normal</option>
            </select>
          </div>

          {(searchQuery || statusFilter !== "All") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("All");
              }}
              className="text-sm text-purple-700 hover:bg-purple-50 font-bold"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Chat Sessions Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        ) : paginatedSessions.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
              <MessageSquareText size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Chat Sessions Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              No conversational logs match your current search query and triage status filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-36 text-xs font-bold uppercase tracking-wider text-slate-500">Session ID</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Patient / User</TableHead>
                  <TableHead className="w-72 text-xs font-bold uppercase tracking-wider text-slate-500">Inquiry / Topic</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Triage Status</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Messages</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Duration</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Timestamp</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-slate-500">Transcript</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSessions.map((session) => (
                  <TableRow 
                    key={session.id} 
                    onClick={() => {
                      setSelectedSession(session);
                      setIsTranscriptOpen(true);
                    }}
                    className="hover:bg-purple-50/50 cursor-pointer transition-colors"
                  >
                    <TableCell className="font-mono text-sm font-bold text-purple-900">
                      {session.sessionId}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">
                          {session.userName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {session.userEmail}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <span className="text-sm font-bold text-slate-800 line-clamp-1">
                        {session.topic}
                      </span>
                      <span className="text-xs text-slate-600 block mt-0.5">
                        Outcome: <strong className="text-purple-700">{session.outcome}</strong>
                      </span>
                    </TableCell>

                    <TableCell>
                      <Badge className={`text-xs font-semibold ${
                        session.flagStatus === 'Urgent'
                          ? 'bg-amber-100 text-amber-800 border-amber-200'
                          : session.flagStatus === 'Safety Flag'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : session.flagStatus === 'Clinical Review'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {session.flagStatus === 'Urgent' && <AlertTriangle size={12} className="mr-1 inline" />}
                        {session.flagStatus}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-sm text-slate-700">
                      <span className="font-semibold bg-slate-100 px-2.5 py-1 rounded-lg">
                        {session.messageCount} msgs
                      </span>
                    </TableCell>

                    <TableCell className="text-sm text-slate-600 font-mono">
                      {session.duration}
                    </TableCell>

                    <TableCell className="text-sm text-slate-600">
                      <span className="block font-semibold text-slate-800">{session.date}</span>
                      <span className="text-xs text-slate-600">{session.time}</span>
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSession(session);
                          setIsTranscriptOpen(true);
                        }}
                        className="text-xs font-bold border-purple-200 text-purple-700 hover:bg-purple-100 rounded-xl"
                      >
                        <Eye size={14} className="mr-1.5" />
                        Inspect
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-sm text-slate-600 font-medium">
          <div>
            Showing <strong className="text-slate-900">{filteredSessions.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{" "}
            <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredSessions.length)}</strong> of{" "}
            <strong className="text-slate-900">{filteredSessions.length}</strong> chat sessions
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-9 px-3"
            >
              <ChevronLeft size={16} className="mr-1" /> Prev
            </Button>
            <span className="text-sm font-bold text-slate-800 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-9 px-3"
            >
              Next <ChevronRight size={16} className="ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Transcript Inspection Dialog */}
      <Dialog open={isTranscriptOpen} onOpenChange={setIsTranscriptOpen}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] flex flex-col p-0 overflow-hidden rounded-3xl">
          {selectedSession && (
            <>
              <div className="p-6 border-b border-slate-100 bg-slate-50/80">
                <div className="flex items-center justify-between pr-6">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                        {selectedSession.sessionId}
                      </span>
                      <Badge className={`text-xs ${
                        selectedSession.flagStatus === 'Urgent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {selectedSession.flagStatus}
                      </Badge>
                    </div>
                    <DialogTitle className="text-lg font-bold text-slate-900 mt-2">
                      {selectedSession.topic}
                    </DialogTitle>
                    <DialogDescription className="text-sm text-slate-500 mt-1">
                      Patient: {selectedSession.userName} ({selectedSession.userEmail}) • {selectedSession.date} at {selectedSession.time}
                    </DialogDescription>
                  </div>
                </div>
              </div>

              {/* Chat Bubble Transcript View */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/40">
                {selectedSession.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-600 font-semibold">
                      {msg.sender === 'user' ? (
                        <>
                          <span>{selectedSession.userName}</span>
                          <User size={14} className="text-slate-400" />
                        </>
                      ) : (
                        <>
                          <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center">
                            <Stethoscope size={12} />
                          </div>
                          <span className="font-bold text-purple-900">Denova AI Assistant</span>
                        </>
                      )}
                      <span>• {msg.time}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-br-xs'
                          : 'bg-white border border-purple-100 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.triageTag && (
                        <div className="mb-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold">
                          <Sparkles size={13} />
                          {msg.triageTag}
                        </div>
                      )}
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dialog Footer */}
              <div className="p-5 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyTranscript}
                  className="h-10 px-4 text-sm font-semibold text-slate-700 w-full sm:w-auto"
                >
                  <Copy size={15} className="mr-2" />
                  {copied ? "Transcript Copied!" : "Copy Full Transcript"}
                </Button>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <Button
                    size="sm"
                    className="h-10 px-5 bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold w-full sm:w-auto rounded-xl"
                    onClick={() => {
                      showNotification(`Transcript #${selectedSession.sessionId} marked as reviewed.`);
                      setIsTranscriptOpen(false);
                    }}
                  >
                    Mark Reviewed
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
