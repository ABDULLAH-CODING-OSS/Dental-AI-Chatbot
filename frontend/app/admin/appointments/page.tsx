"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  CalendarCheck, 
  Search, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Mail, 
  AlertCircle,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Download
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MOCK_APPOINTMENTS, Appointment } from "@/lib/admin-mock-data";

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const counts = useMemo(() => {
    return {
      all: appointments.length,
      pending: appointments.filter(a => a.status === "pending").length,
      confirmed: appointments.filter(a => a.status === "confirmed").length,
      completed: appointments.filter(a => a.status === "completed").length,
      cancelled: appointments.filter(a => a.status === "cancelled").length,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const matchesSearch = 
        apt.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.service.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTab = activeTab === "all" || apt.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [appointments, searchQuery, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, currentPage, pageSize]);

  const handleUpdateStatus = (id: string, newStatus: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
    const label = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
    showNotification(`Booking status updated to "${label}".`);
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
              Clinic Appointment Requests
            </h1>
            <Badge className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-0.5">
              {counts.pending} Pending Review
            </Badge>
          </div>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Real-time consultation referrals and booking workflow pipeline for partner dental clinics.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => showNotification("Exporting appointment schedule...")}
            className="h-10 px-4 text-sm font-semibold border-slate-300 text-slate-700"
          >
            <Download size={15} className="mr-2 text-slate-500" />
            Export Schedule
          </Button>
        </div>
      </div>

      {/* Status Filter Tabs & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 pb-4">
          {[
            { id: "all", label: "All Bookings", count: counts.all },
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "confirmed", label: "Confirmed", count: counts.confirmed },
            { id: "completed", label: "Completed", count: counts.completed },
            { id: "cancelled", label: "Cancelled", count: counts.cancelled },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2.5 px-4 py-2 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-white text-slate-700 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-800"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient, clinic, service or booking ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
          />
        </div>
      </div>

      {/* Appointments Data Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-2xl" />
            ))}
          </div>
        ) : paginatedAppointments.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
              <CalendarCheck size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Appointments Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              No dental bookings match your search query or selected status filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32 text-xs font-bold uppercase tracking-wider text-slate-500">Ref #</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Patient Contact</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Partner Clinic</TableHead>
                  <TableHead className="w-64 text-xs font-bold uppercase tracking-wider text-slate-500">Service / Treatment</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Scheduled Time</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-slate-500">Quick Status Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAppointments.map((apt) => (
                  <TableRow key={apt.id} className="hover:bg-purple-50/40 transition-colors">
                    <TableCell className="font-mono text-sm font-bold text-purple-900">
                      {apt.bookingRef}
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">
                          {apt.patientName}
                        </span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Phone size={12} className="text-slate-400" />
                          {apt.patientPhone}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-slate-800 font-semibold">
                        <Building2 size={15} className="text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{apt.clinicName}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{apt.service}</span>
                        {apt.urgency === "Emergency" && (
                          <span className="text-xs text-red-600 font-bold flex items-center gap-1 mt-0.5">
                            <AlertCircle size={12} /> Emergency Priority
                          </span>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-slate-700">
                      <div className="flex flex-col font-medium">
                        <span className="font-bold text-slate-800">{apt.date}</span>
                        <span className="text-xs text-slate-500">{apt.time}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className={`text-xs font-semibold capitalize ${
                        apt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : apt.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                          : apt.status === 'completed'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {apt.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(apt.id, "confirmed")}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-8 px-3"
                              title="Confirm Booking"
                            >
                              <Check size={14} className="mr-1" />
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                              className="text-red-600 hover:bg-red-50 border-red-200 text-xs font-bold rounded-xl h-8 px-2.5"
                              title="Cancel Booking"
                            >
                              <X size={14} />
                            </Button>
                          </>
                        )}

                        {apt.status === "confirmed" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(apt.id, "completed")}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl h-8 px-3"
                          >
                            Mark Completed
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedApt(apt);
                            setIsDetailsOpen(true);
                          }}
                          className="text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl h-8 w-8 p-0"
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
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
            Showing <strong className="text-slate-900">{filteredAppointments.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{" "}
            <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredAppointments.length)}</strong> of{" "}
            <strong className="text-slate-900">{filteredAppointments.length}</strong> bookings
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

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-xl p-6 sm:p-8 rounded-3xl">
          {selectedApt && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-xl">
                    {selectedApt.bookingRef}
                  </span>
                  <Badge className="capitalize text-xs font-bold">
                    {selectedApt.status}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900 mt-3">
                  {selectedApt.service}
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 mt-1">
                  Scheduled for {selectedApt.date} at {selectedApt.time}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Patient Profile</span>
                  <p className="font-extrabold text-slate-900 text-base">{selectedApt.patientName}</p>
                  <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium text-xs sm:text-sm">
                    <span className="flex items-center gap-1.5"><Phone size={14} className="text-slate-400" /> {selectedApt.patientPhone}</span>
                    <span className="flex items-center gap-1.5"><Mail size={14} className="text-slate-400" /> {selectedApt.patientEmail}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-xs">Assigned Practice</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedApt.clinicName}</p>
                  <p className="text-slate-500 text-xs sm:text-sm">Priority Urgency: <strong className="text-purple-700">{selectedApt.urgency}</strong></p>
                </div>

                {selectedApt.notes && (
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                    <span className="text-purple-700 font-bold uppercase tracking-wider text-xs">Triage Intake Notes</span>
                    <p className="text-slate-700 leading-relaxed text-sm font-medium">{selectedApt.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                {selectedApt.status === "pending" && (
                  <Button
                    className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl mr-2"
                    onClick={() => {
                      handleUpdateStatus(selectedApt.id, "confirmed");
                      setIsDetailsOpen(false);
                    }}
                  >
                    Confirm Booking
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDetailsOpen(false)}
                  className="h-11 px-5 text-sm font-semibold rounded-xl"
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
