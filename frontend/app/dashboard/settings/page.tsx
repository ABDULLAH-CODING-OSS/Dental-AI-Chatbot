"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Lock, 
  Bell, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  AlertTriangle,
  Save,
  KeyRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function SettingsPage() {
  const router = useRouter();
  const { user, token, role, fullName, setAuthData, logout } = useAuth();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile Form State
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");

  // Password State
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsAlerts: true,
    careTips: false,
  });

  // Account Delete Dialog State
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.name || fullName) {
      setProfileName(user?.name || fullName || "");
    }
    if (user?.email) {
      setProfileEmail(user.email);
    }
  }, [user, fullName]);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      showNotification("Please enter a valid name.");
      return;
    }

    if (token && role) {
      setAuthData(token, role, profileName.trim(), profileEmail.trim());
    }
    showNotification("Profile settings updated successfully.");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!passwords.currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    showNotification("Password changed successfully.");
  };

  const handleDeleteAccount = () => {
    setIsDeleteDialogOpen(false);
    logout();
    router.push("/login");
  };

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-24 space-y-8 font-sans" suppressHydrationWarning>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm border border-emerald-500/30 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-sm md:text-base text-slate-600 font-medium mt-1">
          Manage your personal profile information, security credentials, and communication preferences.
        </p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* 1. Profile Information Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Personal Information</h2>
              <p className="text-sm text-slate-500 font-medium">Update your account name and registered contact email</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-5 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-slate-700">Full Name</Label>
              <Input
                id="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                placeholder="e.g. John Doe"
                className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-700">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                placeholder="name@example.com"
                className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
                required
              />
            </div>

            <div className="pt-2">
              <Button type="submit" className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm cursor-pointer">
                <Save size={15} className="mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </motion.div>

        {/* 2. Security & Password Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Security & Password</h2>
              <p className="text-sm text-slate-500 font-medium">Update your account password to keep your consultations secure</p>
            </div>
          </div>

          {passwordError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={15} className="shrink-0 text-red-600" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-xs font-bold uppercase tracking-wider text-slate-700">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password" className="text-xs font-bold uppercase tracking-wider text-slate-700">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password" className="text-xs font-bold uppercase tracking-wider text-slate-700">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-300 text-slate-800 hover:bg-slate-50 text-sm cursor-pointer">
                <KeyRound size={15} className="mr-2" />
                Update Password
              </Button>
            </div>
          </form>
        </motion.div>

        {/* 3. Notification Preferences Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
              <p className="text-sm text-slate-500 font-medium">Configure reminder channels for appointments and urgent triage</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 text-sm block">Email Appointment Confirmations</span>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">Receive schedule details and calendar invites directly in your inbox.</p>
              </div>
              <Switch
                checked={notifications.emailReminders}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, emailReminders: checked });
                  showNotification(`Email notifications ${checked ? 'enabled' : 'disabled'}.`);
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 text-sm block">SMS Urgent Triage Alerts</span>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">Get text notifications if an AI triage assessment flags an urgent condition.</p>
              </div>
              <Switch
                checked={notifications.smsAlerts}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, smsAlerts: checked });
                  showNotification(`SMS alerts ${checked ? 'enabled' : 'disabled'}.`);
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 text-sm block">Care Reminders & Oral Health Tips</span>
                <p className="text-xs sm:text-sm text-slate-500 font-normal">Receive occasional preventative hygiene guidance and seasonal dental care tips.</p>
              </div>
              <Switch
                checked={notifications.careTips}
                onCheckedChange={(checked) => {
                  setNotifications({ ...notifications, careTips: checked });
                  showNotification(`Care reminders ${checked ? 'enabled' : 'disabled'}.`);
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* 4. Danger Zone Card */}
        <motion.div variants={itemVariants} className="bg-red-50/50 rounded-3xl p-6 sm:p-8 border border-red-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-red-700">Danger Zone</h2>
              <p className="text-sm text-red-600/90 font-medium">Irreversible actions regarding your account and medical chat history</p>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed">
            Permanently delete your account and all associated consultation transcripts, booked appointments, and personal health data.
          </p>

          <div className="pt-2">
            <Button 
              type="button"
              variant="destructive" 
              className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 shadow-sm transition-colors text-sm cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 size={16} className="mr-2" />
              Delete Account Permanently
            </Button>
          </div>
        </motion.div>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-3xl p-6 sm:p-8 max-w-md" suppressHydrationWarning>
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle size={24} />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Confirm Account Deletion
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to permanently delete your account? This action cannot be undone and will purge all consultation transcripts, dental triage logs, and appointment records.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button 
              variant="outline" 
              className="rounded-xl h-11 px-5 font-semibold text-sm cursor-pointer" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="rounded-xl h-11 px-5 bg-red-600 hover:bg-red-700 font-bold text-sm cursor-pointer" 
              onClick={handleDeleteAccount}
            >
              Yes, Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
