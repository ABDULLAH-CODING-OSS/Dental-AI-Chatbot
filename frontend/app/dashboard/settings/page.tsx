"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Lock, 
  Bell, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  Save, 
  Key, 
  AlertTriangle,
  Upload,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth-context";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function DashboardSettingsPage() {
  const { user, logout } = useAuth();
  
  // Profile state
  const [profile, setProfile] = useState({
    name: user?.name || "John Doe",
    email: user?.email || "john@example.com",
    phone: "+1 (555) 234-5678",
    emergencyContact: "+1 (555) 987-6543",
    preferredClinic: "Denova Premier Dental - Downtown",
    avatar: user?.avatar || "JD"
  });

  // Password state
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Notifications state
  const [notifications, setNotifications] = useState({
    emailReminders: true,
    smsAlerts: true,
    marketingUpdates: false
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showNotification("Profile details updated successfully!");
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwords.currentPassword) {
      showNotification("Please enter your current password.");
      return;
    }
    if (passwords.newPassword.length < 8) {
      showNotification("New password must be at least 8 characters long.");
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      showNotification("New passwords do not match.");
      return;
    }
    setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    showNotification("Security credentials and password updated successfully!");
  };

  const handleDeleteAccount = () => {
    setIsDeleteDialogOpen(false);
    logout();
    window.location.href = "/login";
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
      <div className="border-b border-slate-200/80 pb-6 space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm md:text-base text-slate-600 font-medium">
          Manage your personal medical profile, authentication credentials, and triage notifications.
        </p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* 1. Profile Edit Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Profile Information</h2>
              <p className="text-sm text-slate-500">Update your dental record profile and contact details</p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6" suppressHydrationWarning>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              <Avatar className="h-20 w-20 border-2 border-emerald-200 shadow-xs">
                <AvatarFallback className="bg-emerald-100 text-emerald-800 font-extrabold text-2xl">
                  {profile.avatar}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800">Profile Avatar</p>
                <p className="text-xs text-slate-500">Generated from your medical record initials.</p>
                <div className="flex gap-2 pt-1">
                  <Button type="button" variant="outline" size="sm" className="h-8 text-xs font-semibold rounded-xl" onClick={() => showNotification("Avatar upload simulated.")}>
                    <Upload size={13} className="mr-1.5" /> Change Photo
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700">Mobile Phone Number</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency" className="text-sm font-semibold text-slate-700">Emergency Contact Phone</Label>
                <Input
                  id="emergency"
                  value={profile.emergencyContact}
                  onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="clinic" className="text-sm font-semibold text-slate-700">Preferred Partner Clinic</Label>
                <Input
                  id="clinic"
                  value={profile.preferredClinic}
                  onChange={(e) => setProfile({ ...profile, preferredClinic: e.target.value })}
                  className="h-11 rounded-xl bg-slate-50/50 border-slate-200 focus:bg-white text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm">
                <Save size={16} className="mr-2" />
                Save Profile Changes
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
              <h2 className="text-lg font-bold text-slate-900">Security & Authentication</h2>
              <p className="text-sm text-slate-500">Update your account password and security credentials</p>
            </div>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-md" suppressHydrationWarning>
            <div className="space-y-2">
              <Label htmlFor="current-password" className="text-sm font-semibold text-slate-700">Current Password</Label>
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
              <Label htmlFor="new-password" className="text-sm font-semibold text-slate-700">New Password</Label>
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
              <Label htmlFor="confirm-password" className="text-sm font-semibold text-slate-700">Confirm New Password</Label>
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
              <Button type="submit" variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-300 text-slate-800 hover:bg-slate-50 text-sm">
                Update Password
              </Button>
            </div>
          </form>
        </motion.div>

        {/* 3. Notifications & Clinical Alerts Card */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
              <p className="text-sm text-slate-500">Configure reminder channels for appointments and urgent triage</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 text-sm block">Email Appointment Confirmations</span>
                <p className="text-sm text-slate-500">Receive schedule details and calendar invites directly in your inbox.</p>
              </div>
              <Switch
                checked={notifications.emailReminders}
                onCheckedChange={(checked) => setNotifications({ ...notifications, emailReminders: checked })}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-800 text-sm block">SMS Urgent Triage Alerts</span>
                <p className="text-sm text-slate-500">Get text notifications if an AI triage assessment flags an urgent condition.</p>
              </div>
              <Switch
                checked={notifications.smsAlerts}
                onCheckedChange={(checked) => setNotifications({ ...notifications, smsAlerts: checked })}
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
              className="h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 shadow-sm transition-colors text-sm"
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
        <DialogContent className="rounded-3xl p-6 sm:p-8 max-w-md">
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
              className="rounded-xl h-11 px-5 font-semibold text-sm" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              className="rounded-xl h-11 px-5 bg-red-600 hover:bg-red-700 font-bold text-sm" 
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
