"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, MessageSquare, MessageSquareText, Users } from "lucide-react";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
type TimeRange = "7d" | "30d" | "90d";
type Appointment = { id: number; user_id?: number | null; appointment_date: string; status: string };
type DailyVolume = { date: string; message_count: number };

function dateRangeStart(range: TimeRange): number {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

export default function AdminOverviewPage() {
  const router = useRouter();
  const { token, logout, isLoading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [chatStats, setChatStats] = useState<{ active_chats_today: number; total_messages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>("30d");
  const [dailyVolume, setDailyVolume] = useState<DailyVolume[]>([]);
  const [dailyVolumeLoading, setDailyVolumeLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/api/appointments/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      setAppointments(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setError("Unable to load overview data.");
    } finally {
      setIsLoading(false);
    }
  }, [logout, router, token]);

  const fetchAdminMetrics = useCallback(async () => {
    if (!token) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [usersResponse, statsResponse] = await Promise.all([
        axios.get(`${BACKEND_BASE_URL}/api/admin/users/`, { headers, timeout: 30000 }),
        axios.get(`${BACKEND_BASE_URL}/api/admin/chats/stats`, { headers, timeout: 30000 }),
      ]);
      setTotalUsers(Array.isArray(usersResponse.data) ? usersResponse.data.length : 0);
      setChatStats(statsResponse.data || null);
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setError("Unable to load overview analytics.");
    }
  }, [logout, router, token]);

  const fetchDailyVolume = useCallback(async () => {
    if (!token) return;
    const days = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
    setDailyVolumeLoading(true);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/api/admin/chats/daily-volume?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      const values = Array.isArray(response.data) ? response.data : response.data?.data;
      setDailyVolume(Array.isArray(values) ? values.map((item: Record<string, unknown>) => ({
        date: String(item.date || item.day || ""),
        message_count: Number(item.message_count ?? item.messages ?? item.count ?? 0),
      })) : []);
    } catch (requestError: unknown) {
      if (axios.isAxiosError(requestError) && requestError.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setError("Unable to load daily volume.");
    } finally {
      setDailyVolumeLoading(false);
    }
  }, [logout, router, timeRange, token]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
      return;
    }
    if (token) {
      void fetchAppointments();
      void fetchAdminMetrics();
      void fetchDailyVolume();
    }
  }, [authLoading, fetchAdminMetrics, fetchAppointments, fetchDailyVolume, router, token]);

  const filteredAppointments = useMemo(() => {
    const start = dateRangeStart(timeRange);
    return appointments.filter((appointment) => {
      const timestamp = Date.parse(appointment.appointment_date);
      return Number.isNaN(timestamp) || timestamp >= start;
    });
  }, [appointments, timeRange]);

  const pendingAppointments = filteredAppointments.filter((appointment) => appointment.status === "pending").length;
  const cards = [
    { title: "Total Users", value: totalUsers, description: "Registered users", icon: Users },
    { title: "Active Chats Today", value: chatStats?.active_chats_today ?? null, description: "Chats active today", icon: MessageSquareText },
    { title: "Total Messages", value: chatStats?.total_messages ?? null, description: "Messages across consultations", icon: MessageSquare },
    { title: "Appointments Pending", value: pendingAppointments, description: `Pending appointments in the selected ${timeRange} range`, icon: CalendarCheck },
  ];

  return (
    <div className="space-y-8 pb-16 font-sans">
      <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Clinical Intelligence Overview</h1>
        <p className="text-sm text-slate-600">A clear view of consultations, patients, and appointment activity.</p>
      </div>
      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{error}</div>}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card key={card.title} className="border border-slate-200 bg-white shadow-xs">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.title}</span>
                <card.icon size={20} className="text-slate-500" />
              </div>
              <div className="mt-4 text-2xl font-semibold text-slate-900">
                {isLoading ? <Skeleton className="h-8 w-20" /> : card.value === null ? "Data not yet available" : card.value.toLocaleString()}
              </div>
              <p className="mt-2 text-xs text-slate-500">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-slate-200 bg-white shadow-xs">
        <CardHeader className="flex flex-col gap-3 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-slate-900">Daily Chat & Consultation Volume</CardTitle>
            <CardDescription className="mt-1 text-sm">Message activity across the selected period.</CardDescription>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <Button key={range} type="button" variant={timeRange === range ? "secondary" : "ghost"} size="sm" onClick={() => setTimeRange(range)}>
                {range}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {dailyVolumeLoading ? <Skeleton className="h-72 w-full rounded-lg" /> : dailyVolume.length === 0 ? <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">Not yet available</div> : <div className="h-72 w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={dailyVolume} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><defs><linearGradient id="dailyVolumeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.28} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} /><XAxis dataKey="date" tickLine={false} axisLine={{ stroke: "#cbd5e1" }} tick={{ fill: "#64748b", fontSize: 12 }} /><YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} /><Tooltip formatter={(value) => [value, "Messages"]} /><Area type="monotone" dataKey="message_count" name="Messages" stroke="#059669" strokeWidth={2.5} fill="url(#dailyVolumeFill)" /></AreaChart></ResponsiveContainer></div>}
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-xs">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900">Top Dental Topics</CardTitle>
          <CardDescription className="text-sm">Not yet available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600">
            Not yet available
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/appointments"><Button variant="outline">Review appointments</Button></Link>
        <Link href="/admin/users"><Button variant="outline">User access controls</Button></Link>
      </div>
    </div>
  );
}
