"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  Plus,
  Stethoscope,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

const patientBookings = [
  {
    id: "APT-1092",
    clinicName: "Denova Premier Dental - Downtown",
    doctor: "Dr. Alexander Wright, DDS",
    service: "Comprehensive Dental Exam & Cleaning",
    date: "Tomorrow, Aug 18, 2026",
    time: "10:00 AM",
    status: "confirmed",
    address: "742 Evergreen Terrace, Suite 400",
    phone: "+1 (555) 800-3366",
    instructions: "Please arrive 10 minutes early. Avoid coffee 2 hours prior."
  },
  {
    id: "APT-1088",
    clinicName: "BrightSmile Orthodontics",
    doctor: "Dr. Emily Taylor, Orthodontist",
    service: "Invisalign Routine Tray Progress Check",
    date: "Aug 28, 2026",
    time: "02:30 PM",
    status: "pending",
    address: "320 Lexington Ave, Suite 8B",
    phone: "+1 (555) 777-BRACE",
    instructions: "Bring Trays #4 through #7 for compliance review."
  }
];

export default function PatientAppointmentsPage() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto pb-24 space-y-8 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Appointments
          </h1>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            View scheduled clinic visits, dentist referrals, and booking status.
          </p>
        </div>

        <Link href="/dashboard">
          <Button className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm">
            <Sparkles size={16} className="mr-2" />
            Book via AI Consultation
          </Button>
        </Link>
      </div>

      {/* Content */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
        {patientBookings.map((apt) => (
          <motion.div key={apt.id} variants={itemVariants}>
            <Card className="border border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden hover:shadow-md transition-all">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <CalendarIcon size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{apt.service}</h3>
                      <p className="text-sm text-slate-500 font-medium">{apt.doctor} • {apt.clinicName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                      {apt.id}
                    </span>
                    <Badge className={`text-xs font-bold capitalize ${
                      apt.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse'
                    }`}>
                      {apt.status}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <Clock size={18} className="text-emerald-600 shrink-0" />
                    <div>
                      <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Scheduled Date & Time</span>
                      <span className="font-bold text-slate-900">{apt.date} at {apt.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <MapPin size={18} className="text-emerald-600 shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Clinic Location</span>
                      <span className="font-bold text-slate-900 truncate block">{apt.address}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 text-xs sm:text-sm text-emerald-950 font-medium">
                  <strong>Patient Instructions:</strong> {apt.instructions}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
                    <Phone size={14} className="text-slate-400" />
                    <span>Clinic Inquiries: <strong className="text-slate-800">{apt.phone}</strong></span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => showNotification("Reschedule request submitted to clinic.")}
                      className="h-10 text-xs sm:text-sm font-semibold rounded-xl"
                    >
                      Reschedule
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => showNotification("Appointment reminder sent to your email.")}
                      className="h-10 text-xs sm:text-sm font-semibold rounded-xl text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                    >
                      Add to Calendar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
