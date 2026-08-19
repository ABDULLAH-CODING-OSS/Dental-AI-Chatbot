"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Stethoscope, 
  Sparkles, 
  Loader2, 
  RefreshCw, 
  XCircle, 
  CalendarCheck 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
import Link from "next/link";
import axios from "axios";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface AppointmentItem {
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const { token, logout, isLoading: authLoading } = useAuth();

  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [aptToCancel, setAptToCancel] = useState<AppointmentItem | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Helper to always obtain the freshest auth token
  const getAuthToken = useCallback(() => {
    if (token) return token;
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  }, [token]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchAppointments = useCallback(async () => {
    const currentToken = getAuthToken();
    if (!currentToken) {
      if (!authLoading) {
        router.push("/login");
      }
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/appointments/me`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        timeout: 30000,
      });

      if (Array.isArray(res.data)) {
        setAppointments(res.data);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 401) {
          logout();
          router.push("/login");
          return;
        }
        console.error("Appointments fetch non-200 error:", status, err.response?.data);
      }
      setErrorMessage("Unable to load your appointments. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [getAuthToken, authLoading, logout, router]);

  // Re-fetch on mount every time the page is navigated to
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleConfirmCancel = async () => {
    const currentToken = getAuthToken();
    if (!aptToCancel || !currentToken) return;
    setIsCancelling(true);

    try {
      await axios.delete(`${BACKEND_BASE_URL}/api/appointments/${aptToCancel.id}`, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
        },
        timeout: 20000,
      });

      // Update state locally
      setAppointments(prev =>
        prev.map(a => (a.id === aptToCancel.id ? { ...a, status: "cancelled" } : a))
      );

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("notifications-updated"));
      }

      showNotification("Appointment has been cancelled successfully.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          logout();
          router.push("/login");
          return;
        }
      }
      showNotification("Failed to cancel appointment. Please try again.");
    } finally {
      setIsCancelling(false);
      setAptToCancel(null);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-24 space-y-8 font-sans" suppressHydrationWarning>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            View scheduled dentist visits, booking confirmations, and consultation receipts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchAppointments} 
            disabled={loading}
            className="h-11 px-4 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Link href="/dashboard">
            <Button className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm cursor-pointer">
              <Sparkles size={16} className="mr-2" />
              Book via AI Consultation
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
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

      {/* Loading state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-9 h-9 animate-spin text-emerald-600" />
          <span className="text-sm sm:text-base font-semibold text-slate-500">Loading your scheduled appointments...</span>
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
          <AnimatePresence>
            {appointments.map((apt) => {
              const formattedDate = formatDateOnly(apt.appointment_date);
              const formattedTime = formatTimeOnly(apt.appointment_date);
              const isCancelled = apt.status === "cancelled";

              return (
                <motion.div key={apt.id} variants={itemVariants}>
                  <Card className={`border bg-white shadow-xs rounded-3xl overflow-hidden hover:shadow-md transition-all ${
                    isCancelled ? "border-slate-200/70 opacity-75" : "border-slate-200 hover:border-emerald-200"
                  }`}>
                    <CardContent className="p-6 sm:p-8 space-y-6">
                      {/* Top Row: Doctor, ID, Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-3.5">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold border ${
                            isCancelled 
                              ? "bg-slate-100 text-slate-400 border-slate-200" 
                              : "bg-emerald-100 text-emerald-700 border-emerald-200"
                          }`}>
                            <Stethoscope size={22} />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{apt.dentist_name}</h3>
                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                              Patient: <strong className="text-slate-800">{apt.patient_name || "Patient"}</strong>
                              {apt.patient_relation && (
                                <span className="ml-1 text-slate-400">({apt.patient_relation})</span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80">
                            APT-{String(apt.id).padStart(6, "0")}
                          </span>
                          <Badge className={`text-xs font-bold capitalize px-3 py-1 ${
                            apt.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : apt.status === 'pending'
                              ? 'bg-amber-100 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>
                            {apt.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-sm text-slate-700">
                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <CalendarIcon size={18} className="text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">Scheduled Date</span>
                            <span className="font-bold text-slate-900">{formattedDate || "Date TBD"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <Clock size={18} className="text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">Time</span>
                            <span className="font-bold text-slate-900">{formattedTime || "Time TBD"}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                          <CreditCard size={18} className="text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-[11px] text-slate-400 block font-bold uppercase tracking-wider">Consultation Fee</span>
                            <span className="font-bold text-slate-900">${typeof apt.price === 'number' ? apt.price.toFixed(2) : apt.price}</span>
                          </div>
                        </div>
                      </div>

                      {/* Intake Notes */}
                      {apt.notes && (
                        <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs sm:text-sm text-emerald-950 font-medium">
                          <strong>Consultation Notes:</strong> {apt.notes}
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
                        <div className="text-xs text-slate-500 font-medium">
                          Created through Denova AI Clinical Triage
                        </div>

                        {!isCancelled && (
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => setAptToCancel(apt)}
                              className="h-10 text-xs font-bold rounded-xl text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300 cursor-pointer"
                            >
                              <XCircle size={14} className="mr-1.5" />
                              Cancel Appointment
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {appointments.length === 0 && !errorMessage && (
              <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 p-6">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
                  <CalendarCheck size={30} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1.5">No scheduled appointments</h3>
                <p className="text-sm text-slate-500 font-normal max-w-sm mx-auto mb-6">
                  You do not have any appointments yet. You can book an appointment seamlessly through an AI consultation.
                </p>
                <Link href="/dashboard">
                  <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 h-11 shadow-sm cursor-pointer">
                    Book an Appointment
                  </Button>
                </Link>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog open={!!aptToCancel} onOpenChange={(open) => !open && setAptToCancel(null)}>
        <DialogContent className="rounded-3xl p-6 sm:p-8 max-w-md" suppressHydrationWarning>
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">Cancel Appointment</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-slate-600 mt-2.5 font-normal leading-relaxed">
              Are you sure you want to cancel your appointment with <strong className="text-slate-900">{aptToCancel?.dentist_name}</strong> on <strong className="text-slate-900">{aptToCancel && formatDateOnly(aptToCancel.appointment_date)}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <Button 
              variant="outline" 
              className="rounded-xl h-11 px-5 text-sm font-semibold cursor-pointer" 
              onClick={() => setAptToCancel(null)}
            >
              Keep Appointment
            </Button>
            <Button 
              variant="destructive" 
              disabled={isCancelling}
              className="rounded-xl h-11 px-5 bg-red-600 hover:bg-red-700 text-sm font-bold cursor-pointer" 
              onClick={handleConfirmCancel}
            >
              {isCancelling ? "Cancelling..." : "Yes, Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
