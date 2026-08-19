"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Stethoscope, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Mail, 
  Phone, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  UserCheck,
  Award,
  Sparkles
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import axios from "axios";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  email: string;
  phone?: string | null;
  consultation_fee: number;
}

export default function AdminDoctorsPage() {
  const router = useRouter();
  const { token, logout, isLoading: authLoading } = useAuth();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Add / Edit Dialog State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formName, setFormName] = useState("");
  const [formSpecialty, setFormSpecialty] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formFee, setFormFee] = useState<string>("50");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Dialog State
  const [doctorToDelete, setDoctorToDelete] = useState<Doctor | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchDoctors = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await axios.get(`${BACKEND_BASE_URL}/api/doctors/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 30000,
      });

      if (Array.isArray(res.data)) {
        setDoctors(res.data);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setErrorMessage("Unable to load doctors list. Please check your connection and try again.");
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
      fetchDoctors();
    }
  }, [token, authLoading, router, fetchDoctors]);

  const openAddDialog = () => {
    setEditingDoctor(null);
    setFormName("");
    setFormSpecialty("");
    setFormEmail("");
    setFormPhone("");
    setFormFee("50");
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditDialog = (doc: Doctor) => {
    setEditingDoctor(doc);
    setFormName(doc.name);
    setFormSpecialty(doc.specialty);
    setFormEmail(doc.email);
    setFormPhone(doc.phone || "");
    setFormFee(String(doc.consultation_fee));
    setFormError(null);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formName.trim() || !formSpecialty.trim() || !formEmail.trim()) {
      setFormError("Please fill out Doctor Name, Specialty, and Email.");
      return;
    }

    const feeNum = parseFloat(formFee);
    if (isNaN(feeNum) || feeNum < 0) {
      setFormError("Please enter a valid consultation fee amount.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    const payload = {
      name: formName.trim(),
      specialty: formSpecialty.trim(),
      email: formEmail.trim(),
      phone: formPhone.trim() || null,
      consultation_fee: feeNum,
    };

    try {
      if (editingDoctor) {
        // Edit existing
        const res = await axios.patch(`${BACKEND_BASE_URL}/api/doctors/${editingDoctor.id}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        });

        setDoctors(prev => prev.map(d => (d.id === editingDoctor.id ? res.data : d)));
        showNotification(`Dr. ${res.data.name} profile updated successfully.`);
      } else {
        // Create new
        const res = await axios.post(`${BACKEND_BASE_URL}/api/doctors/`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        });

        setDoctors(prev => [...prev, res.data]);
        showNotification(`Dr. ${res.data.name} added to clinical directory.`);
      }

      setIsFormOpen(false);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          logout();
          router.push("/login");
          return;
        }
        setFormError(err.response?.data?.detail || "Operation failed. Please check inputs.");
      } else {
        setFormError("Failed to save doctor. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!doctorToDelete || !token) return;
    setIsDeleting(true);

    try {
      await axios.delete(`${BACKEND_BASE_URL}/api/doctors/${doctorToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 20000,
      });

      setDoctors(prev => prev.filter(d => d.id !== doctorToDelete.id));
      showNotification(`Dr. ${doctorToDelete.name} was removed from the directory.`);
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      showNotification("Failed to delete doctor. Please try again.");
    } finally {
      setIsDeleting(false);
      setDoctorToDelete(null);
    }
  };

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const q = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        doc.email.toLowerCase().includes(q) ||
        (doc.phone && doc.phone.toLowerCase().includes(q))
      );
    });
  }, [doctors, searchQuery]);

  const stats = useMemo(() => {
    const total = doctors.length;
    const specialties = new Set(doctors.map(d => d.specialty)).size;
    const avgFee = total > 0 
      ? doctors.reduce((acc, d) => acc + (d.consultation_fee || 0), 0) / total 
      : 0;

    return { total, specialties, avgFee };
  }, [doctors]);

  return (
    <div className="space-y-8 pb-16 font-sans" suppressHydrationWarning>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-sm border border-purple-500/30 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical Doctors Management
            </h1>
            <Badge className="bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold px-2.5 py-0.5">
              {doctors.length} Registered
            </Badge>
          </div>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Manage practicing dentists, specialties, contact records, and consultation rates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button 
            variant="outline" 
            size="sm"
            onClick={fetchDoctors} 
            disabled={loading}
            className="h-11 px-4 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
          >
            <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button 
            onClick={openAddDialog}
            className="h-11 px-5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold shadow-sm cursor-pointer"
          >
            <Plus size={16} className="mr-2" />
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <UserCheck size={22} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Doctors</span>
              <p className="text-2xl font-extrabold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Award size={22} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Specialties Represented</span>
              <p className="text-2xl font-extrabold text-slate-900">{stats.specialties}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign size={22} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Consultation Fee</span>
              <p className="text-2xl font-extrabold text-slate-900">${stats.avgFee.toFixed(2)}</p>
            </div>
          </div>
        </Card>
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
            onClick={fetchDoctors}
            className="text-red-800 hover:bg-red-100 font-semibold text-xs h-8 px-3 rounded-lg cursor-pointer"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search by doctor name, specialty, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-sm"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-purple-700" />
            <span className="text-sm font-semibold text-slate-500">Loading clinical doctors directory...</span>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-24 p-6">
            <div className="w-16 h-16 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Stethoscope size={30} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Doctors Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
              {searchQuery ? "No doctors matched your search criteria." : "No doctors are currently registered in the system."}
            </p>
            {!searchQuery && (
              <Button onClick={openAddDialog} className="rounded-xl bg-purple-700 text-white text-xs font-bold">
                <Plus size={14} className="mr-1" /> Add First Doctor
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Doctor Name</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Specialty</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Email Address</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Phone</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Consultation Fee</TableHead>
                  <TableHead className="text-right font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-100">
                {filteredDoctors.map((doc) => (
                  <TableRow key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs border border-purple-200">
                          {doc.name.replace(/^Dr.s*/i, "").charAt(0) || "D"}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{doc.name}</p>
                          <span className="font-mono text-[11px] text-slate-400">ID: #{doc.id}</span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
                        {doc.specialty}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 text-sm font-medium">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        <span>{doc.email}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                        <Phone size={14} className="text-slate-400 shrink-0" />
                        <span>{doc.phone || "—"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-4">
                      <div className="font-bold text-emerald-700 text-sm">
                        ${doc.consultation_fee.toFixed(2)}
                      </div>
                    </TableCell>

                    <TableCell className="text-right py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(doc)}
                          className="h-8 px-2.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl cursor-pointer"
                          title="Edit doctor details"
                        >
                          <Edit3 size={15} className="mr-1" />
                          <span className="text-xs font-bold">Edit</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDoctorToDelete(doc)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer"
                          title="Delete doctor"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add / Edit Doctor Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-lg p-6 sm:p-8 rounded-3xl" suppressHydrationWarning>
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">
                {editingDoctor ? "Edit Doctor Profile" : "Add New Clinical Doctor"}
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                {editingDoctor 
                  ? "Update provider specialty, contact channels, and consultation fees."
                  : "Register a practicing dentist into the Denova AI clinical referral network."}
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            <div className="space-y-4 text-sm">
              <div className="space-y-1.5">
                <Label htmlFor="docName" className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Full Name & Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="docName"
                  placeholder="e.g. Dr. Sarah Jenkins, DDS"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="rounded-xl h-11 text-sm border-slate-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="docSpecialty" className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Clinical Specialty <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="docSpecialty"
                  placeholder="e.g. Orthodontics, Periodontics, General Dentistry"
                  value={formSpecialty}
                  onChange={(e) => setFormSpecialty(e.target.value)}
                  className="rounded-xl h-11 text-sm border-slate-200"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="docEmail" className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="docEmail"
                    type="email"
                    placeholder="doctor@denovadental.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="rounded-xl h-11 text-sm border-slate-200"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="docPhone" className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Phone Number
                  </Label>
                  <Input
                    id="docPhone"
                    placeholder="+1 (555) 019-2834"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="rounded-xl h-11 text-sm border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="docFee" className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Consultation Fee (USD) <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
                  <Input
                    id="docFee"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="50.00"
                    value={formFee}
                    onChange={(e) => setFormFee(e.target.value)}
                    className="pl-8 rounded-xl h-11 text-sm font-bold text-slate-900 border-slate-200"
                    required
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 flex gap-2 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                className="rounded-xl h-11 px-5 text-sm font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl h-11 px-6 bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold cursor-pointer"
              >
                {isSubmitting ? "Saving..." : editingDoctor ? "Update Doctor" : "Create Doctor"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!doctorToDelete} onOpenChange={(open) => !open && setDoctorToDelete(null)}>
        <DialogContent className="rounded-3xl p-6 sm:p-8 max-w-md" suppressHydrationWarning>
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold text-slate-900">Remove Doctor</DialogTitle>
            <DialogDescription className="text-sm sm:text-base text-slate-600 mt-2.5 font-normal leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">"{doctorToDelete?.name}"</strong> ({doctorToDelete?.specialty}) from the directory?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
            <Button 
              variant="outline" 
              className="rounded-xl h-11 px-5 text-sm font-semibold cursor-pointer" 
              onClick={() => setDoctorToDelete(null)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              disabled={isDeleting}
              className="rounded-xl h-11 px-5 bg-red-600 hover:bg-red-700 text-sm font-bold cursor-pointer" 
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Removing..." : "Yes, Remove Doctor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
