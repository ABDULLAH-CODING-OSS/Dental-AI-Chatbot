"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  CalendarCheck, 
  Search, 
  CheckCircle2, 
  Phone, 
  Mail, 
  AlertCircle,
  Eye,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Loader2,
  RefreshCw,
  Stethoscope,
  Clock,
  User,
  CreditCard
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/context/AuthContext";
import { formatDateOnly, formatTimeOnly } from "@/lib/utils";
import axios from "axios";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface AdminAppointment {
  id: number;
  doctor_id?: number | null;
  dentist_name: string;
  patient_name?: string | null;
  patient_relation?: string | null;
  patient_age?: number | null;
  appointment_date: string;
  status: "pending" | "confirmed" | "cancelled" | string;
  price: number;
  notes?: string | null;
}

export default function AdminAppointmentsPage() {
  const router = useRouter();
  const { token, logout, isLoading: authLoading } = useAuth();

  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [selectedApt, setSelectedApt] = useState<AdminAppointment | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/appointments/admin/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      });

      if (Array.isArray(res.data)) {
        setAppointments(res.data);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setErrorMessage("Unable to load appointments. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [token, logout, router]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
      return;
    }
    if (token) {
      fetchAppointments();
    }
  }, [token, authLoading, router, fetchAppointments]);

  const counts = useMemo(() => {
    return {
      all: appointments.length,
      pending: appointments.filter(a => a.status === "pending").length,
      confirmed: appointments.filter(a => a.status === "confirmed").length,
      cancelled: appointments.filter(a => a.status === "cancelled").length,
    };
  }, [appointments]);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const q = searchQuery.toLowerCase();
      const bookingRef = `apt-${apt.id}`.toLowerCase();
      const patient = (apt.patient_name || "").toLowerCase();
      const dentist = (apt.dentist_name || "").toLowerCase();
      const notes = (apt.notes || "").toLowerCase();

      const matchesSearch = 
        bookingRef.includes(q) ||
        patient.includes(q) ||
        dentist.includes(q) ||
        notes.includes(q);

      const matchesTab = activeTab === "all" || apt.status === activeTab;
      return matchesSearch && matchesTab;
    });
  }, [appointments, searchQuery, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filteredAppointments.length / pageSize));
  const paginatedAppointments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAppointments.slice(start, start + pageSize);
  }, [filteredAppointments, currentPage, pageSize]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    if (!token) return;
    setUpdatingId(id);

    try {
      const res = await axios.patch(`${BACKEND_BASE_URL}/api/appointments/admin/${id}/status`, {
        status: newStatus
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 20000,
      });

      const updated = res.data;
      setAppointments(prev =>
        prev.map(a => (a.id === id ? { ...a, status: updated.status } : a))
      );

      if (selectedApt && selectedApt.id === id) {
        setSelectedApt(prev => (prev ? { ...prev, status: updated.status } : null));
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notifications-updated"));
      }

      const label = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      showNotification(`Booking status updated to "${label}".`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      showNotification("Failed to update appointment status. Please try again.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans" suppressHydrationWarning>
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
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              Clinical Appointment Requests
            </h1>
            {counts.pending > 0 && (
              <Badge className="bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-0.5">
                {counts.pending} Pending Review
              </Badge>
            )}
          </div>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Real-time consultation referrals and booking workflow pipeline for partner dental clinics.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchAppointments} 
          disabled={loading}
          className="h-11 px-4 rounded-xl text-xs font-bold text-slate-700 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
          <div className="flex items-center gap-3">
            <AlertCircle size={18} className="text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchAppointments}
            className="text-red-800 hover:bg-red-100 font-semibold text-xs h-8 px-3 rounded-lg cursor-pointer"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100/90 rounded-2xl">
          {[
            { id: "all", label: "All Bookings", count: counts.all },
            { id: "pending", label: "Pending", count: counts.pending },
            { id: "confirmed", label: "Confirmed", count: counts.confirmed },
            { id: "cancelled", label: "Cancelled", count: counts.cancelled },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setCurrentPage(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white text-purple-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive ? "bg-purple-100 text-purple-800" : "bg-slate-200 text-slate-600"
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search ref #, patient, doctor..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-purple-700" />
            <span className="text-sm font-semibold text-slate-500">Loading appointments data...</span>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-24 p-6">
            <div className="w-16 h-16 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <CalendarCheck size={30} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Appointments Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery ? "No bookings matched your search query." : "No appointment requests in this category."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Ref #</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Patient Profile</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Assigned Doctor</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Date & Time</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Fee</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Status</TableHead>
                  <TableHead className="text-right font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {paginatedAppointments.map((apt) => {
                  const refCode = `APT-${String(apt.id).padStart(6, "0")}`;
                  const formattedDate = formatDateOnly(apt.appointment_date);
                  const formattedTime = formatTimeOnly(apt.appointment_date);

                  return (
                    <TableRow key={apt.id} className="hover:bg-slate-50/70 transition-colors">
                      <TableCell className="font-mono text-xs font-bold text-purple-700 py-4">
                        {refCode}
                      </TableCell>

                      <TableCell className="py-4">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{apt.patient_name || "Patient"}</p>
                          <span className="text-xs text-slate-500 font-medium">
                            {apt.patient_relation || "Self"}
                            {apt.patient_age ? ` • ${apt.patient_age} yrs` : ""}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-2">
                          <Stethoscope size={15} className="text-purple-600 shrink-0" />
                          <span className="font-bold text-slate-800 text-sm">{apt.dentist_name}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{formattedDate}</p>
                          <span className="text-xs text-slate-500 font-medium">{formattedTime}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <span className="font-bold text-emerald-700 text-sm">
                          ${typeof apt.price === 'number' ? apt.price.toFixed(2) : apt.price}
                        </span>
                      </TableCell>

                      <TableCell className="py-4">
                        <Badge className={`text-xs font-bold capitalize px-2.5 py-0.5 ${
                          apt.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : apt.status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                          {apt.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {apt.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                disabled={updatingId === apt.id}
                                onClick={() => handleUpdateStatus(apt.id, "confirmed")}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-8 px-2.5 cursor-pointer shadow-xs"
                                title="Confirm Booking"
                              >
                                <Check size={14} className="mr-1" />
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={updatingId === apt.id}
                                onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                                className="text-red-600 hover:bg-red-50 border-red-200 text-xs font-bold rounded-xl h-8 px-2.5 cursor-pointer"
                                title="Cancel Booking"
                              >
                                <X size={14} />
                              </Button>
                            </>
                          )}

                          {apt.status === "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={updatingId === apt.id}
                              onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                              className="text-red-600 hover:bg-red-50 border-red-200 text-xs font-bold rounded-xl h-8 px-2.5 cursor-pointer"
                            >
                              Cancel
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedApt(apt);
                              setIsDetailsOpen(true);
                            }}
                            className="text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl h-8 w-8 p-0 cursor-pointer"
                            title="View full intake notes"
                          >
                            <Eye size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {filteredAppointments.length > 0 && (
          <div className="p-5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-sm text-slate-600 font-medium">
            <div>
              Showing <strong className="text-slate-900">{(currentPage - 1) * pageSize + 1}</strong> to{" "}
              <strong className="text-slate-900">{Math.min(currentPage * pageSize, filteredAppointments.length)}</strong> of{" "}
              <strong className="text-slate-900">{filteredAppointments.length}</strong> bookings
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="h-9 px-3 rounded-xl cursor-pointer"
              >
                <ChevronLeft size={16} className="mr-1" /> Prev
              </Button>
              <span className="text-xs font-bold text-slate-800 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="h-9 px-3 rounded-xl cursor-pointer"
              >
                Next <ChevronRight size={16} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Appointment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-lg p-6 sm:p-8 rounded-3xl" suppressHydrationWarning>
          {selectedApt && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                  <span className="font-mono text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-xl">
                    APT-{String(selectedApt.id).padStart(6, "0")}
                  </span>
                  <Badge className={`capitalize text-xs font-bold ${
                    selectedApt.status === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : selectedApt.status === 'pending'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedApt.status}
                  </Badge>
                </div>
                <DialogTitle className="text-xl font-bold text-slate-900 mt-3">
                  Appointment Details
                </DialogTitle>
                <DialogDescription className="text-sm text-slate-500 mt-1">
                  Scheduled for {formatDateOnly(selectedApt.appointment_date)} at {formatTimeOnly(selectedApt.appointment_date)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-3 text-sm">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Patient Information</span>
                  <p className="font-extrabold text-slate-900 text-base">{selectedApt.patient_name || "Patient"}</p>
                  <div className="flex flex-wrap items-center gap-4 text-slate-600 font-medium text-xs">
                    <span>Relation: <strong className="text-slate-800">{selectedApt.patient_relation || "Self"}</strong></span>
                    {selectedApt.patient_age && (
                      <span>Age: <strong className="text-slate-800">{selectedApt.patient_age} years</strong></span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
                  <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px]">Assigned Doctor & Rate</span>
                  <p className="font-bold text-slate-900 text-sm">{selectedApt.dentist_name}</p>
                  <p className="text-emerald-700 font-bold text-sm">
                    Fee: ${typeof selectedApt.price === 'number' ? selectedApt.price.toFixed(2) : selectedApt.price}
                  </p>
                </div>

                {selectedApt.notes && (
                  <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-1.5">
                    <span className="text-purple-700 font-bold uppercase tracking-wider text-[11px]">Intake / Clinical Notes</span>
                    <p className="text-slate-700 leading-relaxed text-sm font-medium">{selectedApt.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0 mt-4">
                {selectedApt.status === "pending" && (
                  <Button
                    className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl mr-2 cursor-pointer"
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
                  className="h-11 px-5 text-sm font-semibold rounded-xl cursor-pointer"
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
