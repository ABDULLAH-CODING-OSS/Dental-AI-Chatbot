"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Building2, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Star, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  AlertTriangle
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
import { MOCK_CLINICS, Clinic } from "@/lib/admin-mock-data";

export default function AdminClinicsPage() {
  const [clinics, setClinics] = useState<Clinic[]>(MOCK_CLINICS);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState<string>("All");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeClinic, setActiveClinic] = useState<Clinic | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    specialties: "General Dentistry, Cosmetic Dentistry",
    rating: 4.8,
    status: "Partner Clinic" as Clinic['status'],
    operatingHours: "Mon-Fri: 8:00 AM - 5:00 PM",
    emergencyAvailable: true
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredClinics = useMemo(() => {
    return clinics.filter((clinic) => {
      const matchesSearch = 
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = 
        specialtyFilter === "All" || 
        clinic.specialties.some(s => s.toLowerCase().includes(specialtyFilter.toLowerCase()));
      return matchesSearch && matchesSpecialty;
    });
  }, [clinics, searchQuery, specialtyFilter]);

  const handleOpenAdd = () => {
    setFormData({
      name: "",
      address: "",
      city: "Downtown Medical Hub",
      phone: "+1 (555) 000-0000",
      email: "contact@newclinic.com",
      specialties: "General Dentistry, Emergency Triage",
      rating: 4.9,
      status: "Partner Clinic",
      operatingHours: "Mon-Fri: 8:00 AM - 6:00 PM",
      emergencyAvailable: true
    });
    setIsAddOpen(true);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;

    const newClinic: Clinic = {
      id: `cln_${Date.now()}`,
      name: formData.name,
      address: formData.address,
      city: formData.city,
      phone: formData.phone,
      email: formData.email,
      specialties: formData.specialties.split(",").map(s => s.trim()),
      rating: Number(formData.rating),
      reviewCount: 1,
      status: formData.status,
      operatingHours: formData.operatingHours,
      emergencyAvailable: formData.emergencyAvailable
    };

    setClinics([newClinic, ...clinics]);
    setIsAddOpen(false);
    showNotification(`Clinic "${newClinic.name}" added successfully!`);
  };

  const handleOpenEdit = (clinic: Clinic) => {
    setActiveClinic(clinic);
    setFormData({
      name: clinic.name,
      address: clinic.address,
      city: clinic.city,
      phone: clinic.phone,
      email: clinic.email,
      specialties: clinic.specialties.join(", "),
      rating: clinic.rating,
      status: clinic.status,
      operatingHours: clinic.operatingHours,
      emergencyAvailable: clinic.emergencyAvailable
    });
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClinic) return;

    setClinics((prev) =>
      prev.map((c) =>
        c.id === activeClinic.id
          ? {
              ...c,
              name: formData.name,
              address: formData.address,
              city: formData.city,
              phone: formData.phone,
              email: formData.email,
              specialties: formData.specialties.split(",").map(s => s.trim()),
              rating: Number(formData.rating),
              status: formData.status,
              operatingHours: formData.operatingHours,
              emergencyAvailable: formData.emergencyAvailable
            }
          : c
      )
    );

    setIsEditOpen(false);
    showNotification(`Clinic "${formData.name}" updated successfully!`);
  };

  const handleConfirmDelete = () => {
    if (!activeClinic) return;
    setClinics((prev) => prev.filter((c) => c.id !== activeClinic.id));
    setIsDeleteOpen(false);
    showNotification(`Clinic "${activeClinic.name}" removed from platform.`);
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
              Partner Dental Clinics & Facilities
            </h1>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-semibold px-2.5 py-0.5">
              {filteredClinics.length} Verified Practices
            </Badge>
          </div>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Manage certified dental clinics, emergency referral routing, operating schedules, and specialties.
          </p>
        </div>

        <Button
          size="sm"
          onClick={handleOpenAdd}
          className="h-10 px-5 bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold shadow-xs rounded-xl"
        >
          <Plus size={16} className="mr-2" />
          Add New Clinic
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by clinic name, street address, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-700">
          <span className="font-bold text-slate-600">Specialty:</span>
          <select
            value={specialtyFilter}
            onChange={(e) => setSpecialtyFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer font-medium"
          >
            <option value="All">All Specialties</option>
            <option value="General">General Dentistry</option>
            <option value="Emergency">Emergency Triage</option>
            <option value="Endodontics">Endodontics</option>
            <option value="Orthodontics">Orthodontics</option>
            <option value="Cosmetic">Cosmetic</option>
            <option value="Pediatric">Pediatric</option>
          </select>
        </div>
      </div>

      {/* Clinics Data Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-2xl" />
            ))}
          </div>
        ) : filteredClinics.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto border border-purple-100">
              <Building2 size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No Clinics Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              No partner dental facilities match "{searchQuery}".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-72 text-xs font-bold uppercase tracking-wider text-slate-500">Clinic Name & Location</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Specialties</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Info</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Operating Hours</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Rating</TableHead>
                  <TableHead className="text-xs font-bold uppercase tracking-wider text-slate-500">Status</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-wider text-slate-500">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClinics.map((clinic) => (
                  <TableRow key={clinic.id} className="hover:bg-purple-50/40 transition-colors">
                    <TableCell>
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-sm shrink-0 border border-purple-100 mt-0.5">
                          <Building2 size={20} />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-slate-900 text-sm truncate">
                            {clinic.name}
                          </span>
                          <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 font-medium">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            {clinic.address}, {clinic.city}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {clinic.specialties.map((spec, i) => (
                          <span
                            key={i}
                            className="text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex flex-col text-xs text-slate-600 gap-1 font-medium">
                        <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" /> {clinic.phone}</span>
                        <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" /> {clinic.email}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-slate-400" />
                        <span className="text-xs font-medium">{clinic.operatingHours}</span>
                      </div>
                      {clinic.emergencyAvailable && (
                        <span className="text-xs font-bold text-emerald-600 block mt-1">
                          ● 24/7 Triage Ready
                        </span>
                      )}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                        <Star size={15} className="fill-amber-400 text-amber-400" />
                        <span>{clinic.rating.toFixed(1)}</span>
                        <span className="text-xs text-slate-500 font-normal">({clinic.reviewCount})</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge className="text-xs font-semibold bg-purple-100 text-purple-800 border-purple-200">
                        {clinic.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenEdit(clinic)}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-xl"
                          title="Edit Clinic"
                        >
                          <Edit3 size={16} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setActiveClinic(clinic);
                            setIsDeleteOpen(true);
                          }}
                          className="h-8 w-8 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl"
                          title="Delete Clinic"
                        >
                          <Trash2 size={16} />
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

      {/* Add Clinic Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-lg p-6 sm:p-8 rounded-3xl">
          <form onSubmit={handleSaveAdd}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Register New Partner Clinic
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                Enter practice information, specialty clinical areas, and emergency referral contacts.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-5 text-sm">
              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Clinic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Emergency Dental Care"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 742 Evergreen Terrace, Suite 400"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">City / District</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Specialties (comma-separated)</label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Operating Hours</label>
                <input
                  type="text"
                  value={formData.operatingHours}
                  onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="h-11 px-5 text-sm font-semibold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-11 px-6 bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold rounded-xl"
              >
                Add Partner Clinic
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Clinic Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-lg p-6 sm:p-8 rounded-3xl">
          <form onSubmit={handleSaveEdit}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Edit Partner Clinic Details
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-500 mt-1">
                Update address, specialty service tags, and operating schedule.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-5 text-sm">
              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Clinic Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Street Address</label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>

              <div className="col-span-2 space-y-1.5">
                <label className="font-bold text-slate-700">Specialties</label>
                <input
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => setFormData({ ...formData, specialties: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-purple-600 outline-none"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
                className="h-11 px-5 text-sm font-semibold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-11 px-6 bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold rounded-xl"
              >
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-md p-6 sm:p-8 rounded-3xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle size={24} />
            </div>
            <DialogTitle className="text-xl font-bold text-slate-900">
              Remove Clinic Listing
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to remove <strong className="text-slate-900">{activeClinic?.name}</strong>? Automated patient booking referrals to this practice will be disabled.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteOpen(false)}
              className="h-11 px-5 text-sm font-semibold rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmDelete}
              className="h-11 px-5 text-sm bg-red-600 hover:bg-red-700 font-bold rounded-xl"
            >
              Confirm Removal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
