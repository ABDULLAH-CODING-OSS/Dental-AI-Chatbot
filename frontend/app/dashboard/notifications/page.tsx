"use client";

import { motion } from "framer-motion";
import { Bell, Calendar, Stethoscope, CheckCircle2 } from "lucide-react";

const notifications = [
  { id: 1, type: "appointment", title: "Upcoming Appointment", message: "Dr. Smith - Tomorrow at 10:00 AM", time: "2 hours ago", unread: true, icon: Calendar },
  { id: 2, type: "system", title: "New Feature Available", message: "Denova now supports image uploads for symptom analysis.", time: "1 day ago", unread: true, icon: Stethoscope },
  { id: 3, type: "reminder", title: "Daily Habit Reminder", message: "Don't forget to floss tonight!", time: "2 days ago", unread: false, icon: CheckCircle2 },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function NotificationsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Notifications</h2>
        <p className="text-slate-500 mt-2 font-medium">Stay updated on your appointments and health reminders.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
        {notifications.map((notif) => (
          <motion.div 
            key={notif.id}
            variants={itemVariants}
            whileHover={{ scale: 1.01 }}
            className={`flex items-start gap-5 p-6 rounded-2xl border transition-all cursor-pointer ${
              notif.unread ? "bg-white border-emerald-100 shadow-sm hover:shadow-md" : "bg-slate-50 border-slate-100 hover:border-slate-200"
            }`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              notif.unread ? "bg-emerald-100 text-emerald-600 shadow-inner" : "bg-slate-200 text-slate-500"
            }`}>
              <notif.icon size={24} />
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className={`text-lg truncate pr-4 ${notif.unread ? "font-bold text-slate-900" : "font-semibold text-slate-700"}`}>
                  {notif.title}
                </h3>
                <span className="text-xs font-semibold text-slate-400 shrink-0 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">{notif.time}</span>
              </div>
              <p className={`text-sm ${notif.unread ? "text-slate-600 font-medium" : "text-slate-500 font-medium"}`}>
                {notif.message}
              </p>
            </div>
            {notif.unread && (
              <div className="w-3 h-3 bg-emerald-500 rounded-full shrink-0 mt-2 shadow-[0_0_10px_rgb(16,185,129,0.5)]" />
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
