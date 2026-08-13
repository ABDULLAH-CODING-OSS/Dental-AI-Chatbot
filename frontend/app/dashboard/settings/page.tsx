"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function SettingsPage() {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
        <p className="text-slate-500 mt-2 font-medium">Manage your profile, preferences, and security.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
        {/* Profile Details */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Profile Information</h3>
          <div className="grid gap-6 max-w-md">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-slate-700 font-semibold">Full Name</Label>
              <Input id="name" defaultValue="John Doe" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold">Email Address</Label>
              <Input id="email" type="email" defaultValue="john@example.com" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" />
            </div>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} className="pt-2">
              <Button className="h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 shadow-sm transition-colors">
                Save Changes
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Security</h3>
          <div className="grid gap-6 max-w-md">
            <div className="grid gap-2">
              <Label htmlFor="current-password" className="text-slate-700 font-semibold">Current Password</Label>
              <Input id="current-password" type="password" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password" className="text-slate-700 font-semibold">New Password</Label>
              <Input id="new-password" type="password" className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium" />
            </div>
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.97 }} className="pt-2">
              <Button variant="outline" className="h-12 rounded-xl font-bold px-8 border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm transition-colors">
                Update Password
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div variants={itemVariants} className="bg-red-50/50 rounded-3xl p-8 border border-red-100 shadow-sm">
          <h3 className="text-xl font-bold text-red-700 mb-2">Danger Zone</h3>
          <p className="text-red-600/80 font-medium mb-6">Permanently delete your account and all associated data.</p>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button 
              variant="destructive" 
              className="h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold px-8 shadow-sm transition-colors"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              Delete Account
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="rounded-3xl p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">Delete Account</DialogTitle>
            <DialogDescription className="text-base text-slate-500 mt-3 font-medium">
              Are you sure you want to permanently delete your account? This will erase all your chat history and settings. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 flex gap-3 sm:justify-end">
            <Button variant="outline" className="rounded-xl h-12 px-6 font-semibold" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="rounded-xl h-12 px-6 bg-red-600 hover:bg-red-700 font-semibold" onClick={() => setIsDeleteDialogOpen(false)}>
              Yes, Delete My Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
