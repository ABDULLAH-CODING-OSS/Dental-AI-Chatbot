"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Tag, 
  ArrowRight, 
  Search, 
  DollarSign, 
  Stethoscope, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  TrendingUp,
  Layers,
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
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/app/context/AuthContext";
import axios from "axios";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface DoctorPricing {
  id: number;
  name: string;
  specialty: string;
  email: string;
  phone?: string | null;
  consultation_fee: number;
}

export default function AdminPricingPage() {
  const router = useRouter();
  const { token, logout, isLoading: authLoading } = useAuth();

  const [doctors, setDoctors] = useState<DoctorPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPricing = useCallback(async () => {
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
      setErrorMessage("Unable to load doctor pricing tiers. Please check your connection and try again.");
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
      fetchPricing();
    }
  }, [token, authLoading, router, fetchPricing]);

  const filteredDoctors = useMemo(() => {
    return doctors.filter(doc => {
      const q = searchQuery.toLowerCase();
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.specialty.toLowerCase().includes(q) ||
        doc.email.toLowerCase().includes(q)
      );
    });
  }, [doctors, searchQuery]);

  const pricingStats = useMemo(() => {
    if (doctors.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0 };
    }
    const fees = doctors.map(d => d.consultation_fee || 0);
    const sum = fees.reduce((a, b) => a + b, 0);
    return {
      count: doctors.length,
      avg: sum / doctors.length,
      min: Math.min(...fees),
      max: Math.max(...fees),
    };
  }, [doctors]);

  return (
    <div className="space-y-8 pb-16 font-sans" suppressHydrationWarning>
      {/* Notice Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 shadow-2xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Tag size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Per-Doctor Pricing Model</h3>
            <p className="text-xs sm:text-sm text-slate-600 font-normal">
              Pricing is currently managed per-doctor via the Doctors page.
            </p>
          </div>
        </div>

        <Link href="/admin/doctors">
          <Button className="rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs sm:text-sm font-bold h-10 px-4 shadow-sm cursor-pointer self-start sm:self-auto">
            <span>Manage on Doctors Page</span>
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        </Link>
      </div>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              Consultation Pricing Catalog
            </h1>
            <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold px-2.5 py-0.5">
              Live Rates
            </Badge>
          </div>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Review fee schedules and pricing tiers for all clinical specialists in the Denova network.
          </p>
        </div>

        <Button 
          variant="outline" 
          size="sm"
          onClick={fetchPricing} 
          disabled={loading}
          className="h-11 px-4 rounded-xl text-xs font-bold text-slate-700 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw size={14} className={`mr-1.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Pricing Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign size={22} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Consultation</span>
              <p className="text-2xl font-extrabold text-slate-900">${pricingStats.avg.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <TrendingUp size={22} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fee Range</span>
              <p className="text-2xl font-extrabold text-slate-900">
                ${pricingStats.min.toFixed(0)} - ${pricingStats.max.toFixed(0)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Layers size={22} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Doctors with Fee Schedule</span>
              <p className="text-2xl font-extrabold text-slate-900">{pricingStats.count}</p>
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
            onClick={fetchPricing}
            className="text-red-800 hover:bg-red-100 font-semibold text-xs h-8 px-3 rounded-lg cursor-pointer"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Search Filter */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input 
            placeholder="Search pricing by doctor name or clinical specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-sm"
          />
        </div>
      </div>

      {/* Pricing Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-9 h-9 animate-spin text-purple-700" />
            <span className="text-sm font-semibold text-slate-500">Loading pricing rates...</span>
          </div>
        ) : filteredDoctors.length === 0 ? (
          <div className="text-center py-24 p-6">
            <div className="w-16 h-16 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Tag size={30} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Pricing Records Found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {searchQuery ? "No doctors matched your search criteria." : "No pricing data available."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 border-b border-slate-200">
                <TableRow>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Doctor</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Clinical Specialty</TableHead>
                  <TableHead className="font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Contact / Email</TableHead>
                  <TableHead className="text-right font-bold text-slate-700 text-xs uppercase tracking-wider py-4">Consultation Fee</TableHead>
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
                      <div className="flex items-center gap-1.5 text-slate-600 text-sm font-medium">
                        <Mail size={14} className="text-slate-400 shrink-0" />
                        <span>{doc.email}</span>
                      </div>
                    </TableCell>

                    <TableCell className="text-right py-4">
                      <span className="font-extrabold text-base text-slate-900 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl inline-block">
                        ${doc.consultation_fee.toFixed(2)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
