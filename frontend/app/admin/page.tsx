"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { 
  Users, 
  MessageSquare, 
  MessageSquareText, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  CalendarCheck,
  Building2,
  ChevronRight,
  SlidersHorizontal
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MOCK_STATS, 
  MOCK_DAILY_CHATS_30D, 
  MOCK_TOPIC_DATA, 
  MOCK_CHAT_SESSIONS 
} from "@/lib/admin-mock-data";

function CountUpNumber({ targetValue, prefix = "", suffix = "" }: { targetValue: number; prefix?: string; suffix?: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return Math.floor(latest).toLocaleString();
  });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(count, targetValue, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1]
    });
    const unsubscribe = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [targetValue, count, rounded]);

  return <span>{prefix}{display}{suffix}</span>;
}

export default function AdminOverviewPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d">("30d");

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  const chartData = React.useMemo(() => {
    if (timeRange === "7d") {
      return MOCK_DAILY_CHATS_30D.slice(-7);
    }
    if (timeRange === "90d") {
      return MOCK_DAILY_CHATS_30D.map((item, i) => ({
        ...item,
        messages: Math.round(item.messages * (0.85 + (i / 30) * 0.4)),
        activeChats: Math.round(item.activeChats * (0.85 + (i / 30) * 0.4))
      }));
    }
    return MOCK_DAILY_CHATS_30D;
  }, [timeRange]);

  const statCards = [
    {
      id: "users",
      title: MOCK_STATS.totalUsers.title,
      value: MOCK_STATS.totalUsers.value,
      change: MOCK_STATS.totalUsers.change,
      trend: MOCK_STATS.totalUsers.trend,
      timeframe: MOCK_STATS.totalUsers.timeframe,
      description: MOCK_STATS.totalUsers.description,
      icon: Users,
      accentBg: "bg-purple-50 text-purple-700 border-purple-100",
    },
    {
      id: "activeChats",
      title: MOCK_STATS.activeChatsToday.title,
      value: MOCK_STATS.activeChatsToday.value,
      change: MOCK_STATS.activeChatsToday.change,
      trend: MOCK_STATS.activeChatsToday.trend,
      timeframe: MOCK_STATS.activeChatsToday.timeframe,
      description: MOCK_STATS.activeChatsToday.description,
      icon: MessageSquareText,
      accentBg: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      id: "messages",
      title: MOCK_STATS.totalMessages.title,
      value: MOCK_STATS.totalMessages.value,
      change: MOCK_STATS.totalMessages.change,
      trend: MOCK_STATS.totalMessages.trend,
      timeframe: MOCK_STATS.totalMessages.timeframe,
      description: MOCK_STATS.totalMessages.description,
      icon: MessageSquare,
      accentBg: "bg-violet-50 text-violet-700 border-violet-100",
    },
    {
      id: "appointments",
      title: MOCK_STATS.appointmentsPending.title,
      value: MOCK_STATS.appointmentsPending.value,
      change: MOCK_STATS.appointmentsPending.change,
      trend: MOCK_STATS.appointmentsPending.trend,
      timeframe: MOCK_STATS.appointmentsPending.timeframe,
      description: MOCK_STATS.appointmentsPending.description,
      icon: CalendarCheck,
      accentBg: "bg-amber-50 text-amber-700 border-amber-100",
    },
  ];

  const urgentChatLogs = MOCK_CHAT_SESSIONS.filter(s => s.flagStatus === "Urgent" || s.flagStatus === "Safety Flag");

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Top Banner with high-contrast, fully visible action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-500/30 text-purple-200 border border-purple-400/30">
              Executive Console
            </span>
            <span className="text-xs sm:text-sm text-purple-200 font-medium">
              Clinical Intelligence Engine Active
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Denova Clinical Intelligence Overview
          </h2>
          <p className="text-sm sm:text-base text-purple-200/90 max-w-2xl font-normal leading-relaxed">
            Real-time telemetry across patient AI consultations, clinic referrals, safety triage guardrails, and appointment pipelines.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <Link href="/admin/chat-logs">
            <Button size="sm" className="h-10 px-4 bg-white text-purple-900 hover:bg-purple-100 font-bold shadow-xs text-sm rounded-xl transition-all">
              <Activity size={16} className="mr-2 text-purple-700" />
              Live Triage Stream
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button size="sm" className="h-10 px-4 bg-purple-800/80 hover:bg-purple-800 text-white border border-purple-400/40 text-sm font-bold shadow-xs rounded-xl transition-all">
              <SlidersHorizontal size={15} className="mr-2 text-purple-300" />
              System Settings
            </Button>
          </Link>
        </div>
      </div>

      {/* 1. Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: idx * 0.08, ease: "easeOut" }}
          >
            <Card className="border border-slate-200 bg-white hover:shadow-md hover:border-purple-200 transition-all rounded-3xl group">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-500 tracking-wider uppercase">
                    {card.title}
                  </span>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-2xs transition-transform group-hover:scale-105 ${card.accentBg}`}>
                    <card.icon size={21} />
                  </div>
                </div>

                <div className="mt-4">
                  {isLoading ? (
                    <Skeleton className="h-9 w-32 my-1" />
                  ) : (
                    <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      <CountUpNumber targetValue={card.value} />
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5 font-bold">
                    {card.trend === "up" ? (
                      <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        <ArrowUpRight size={14} className="stroke-[2.5] mr-0.5" />
                        +{card.change}%
                      </span>
                    ) : (
                      <span className="flex items-center text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                        <ArrowDownRight size={14} className="stroke-[2.5] mr-0.5" />
                        {card.change}%
                      </span>
                    )}
                    <span className="text-slate-600 font-medium">{card.timeframe}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages Over Time */}
        <Card className="lg:col-span-2 border border-slate-200 bg-white shadow-xs rounded-3xl">
          <CardHeader className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <CardTitle className="text-lg font-bold text-slate-900">
                  Daily Chat & Consultation Volume
                </CardTitle>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
                  Live Analytics
                </Badge>
              </div>
              <CardDescription className="text-sm text-slate-500">
                Total conversational interactions and active patient dialogues over time
              </CardDescription>
            </div>

            <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-semibold shrink-0">
              {(["7d", "30d", "90d"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimeRange(period)}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    timeRange === period
                      ? "bg-white text-purple-700 shadow-xs font-bold"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {period === "7d" ? "Last 7 Days" : period === "30d" ? "Last 30 Days" : "Last 90 Days"}
                </button>
              ))}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="h-80 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-2xl" />
              </div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <defs>
                      <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.28} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="indigoGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis 
                      dataKey="formattedDate" 
                      tickLine={false} 
                      axisLine={{ stroke: "#e2e8f0" }} 
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      dy={6}
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "#64748b", fontSize: 12 }}
                      tickFormatter={(val) => `${(val / 1000).toFixed(1)}k`}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl text-sm border border-slate-800 space-y-1.5">
                              <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{label}</p>
                              <p className="text-purple-300 flex items-center justify-between gap-6">
                                <span>Total Messages:</span>
                                <strong className="font-mono font-bold text-white">{payload[0]?.value?.toLocaleString()}</strong>
                              </p>
                              <p className="text-indigo-300 flex items-center justify-between gap-6">
                                <span>Active Chats:</span>
                                <strong className="font-mono font-bold text-white">{payload[1]?.value?.toLocaleString()}</strong>
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="messages" 
                      stroke="#7c3aed" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#purpleGradient)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="activeChats" 
                      stroke="#4f46e5" 
                      strokeWidth={2} 
                      fillOpacity={1} 
                      fill="url(#indigoGradient)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-100 text-sm text-slate-500">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-purple-600"></span>
                  <span className="font-semibold text-slate-700">Messages</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-indigo-600"></span>
                  <span className="font-semibold text-slate-700">Active Consultations</span>
                </div>
              </div>
              <span className="text-slate-600 font-medium">Real-time sync</span>
            </div>
          </CardContent>
        </Card>

        {/* Top Dental Topics */}
        <Card className="border border-slate-200 bg-white shadow-xs rounded-3xl flex flex-col justify-between">
          <CardHeader className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg font-bold text-slate-900">
                Top Dental Topics Asked
              </CardTitle>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs font-semibold">
                Topic Analysis
              </Badge>
            </div>
            <CardDescription className="text-sm text-slate-500 mt-1">
              Distribution of clinical questions asked by patients
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 flex-1 flex flex-col justify-between">
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <Skeleton className="h-full w-full rounded-2xl" />
              </div>
            ) : (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={MOCK_TOPIC_DATA} 
                    layout="vertical" 
                    margin={{ top: 5, right: 20, left: 15, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis 
                      type="category" 
                      dataKey="shortName" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: "#334155", fontSize: 12, fontWeight: 600 }}
                      width={90}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-sm border border-slate-800 space-y-1">
                              <p className="font-bold text-purple-300">{data.topic}</p>
                              <p className="text-slate-200">Queries: <strong className="text-white font-mono">{data.count.toLocaleString()}</strong> ({data.percentage}%)</p>
                              <p className="text-amber-300 text-xs mt-0.5 font-medium">Urgency Escalation: {data.urgencyRate}%</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                      {MOCK_TOPIC_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-500 flex items-center justify-between">
              <span>Primary: <strong className="text-purple-700">Cavities (28.5%)</strong></span>
              <Link href="/admin/chat-logs" className="text-purple-700 font-bold hover:underline">
                View all logs →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Bottom Row: High Priority Flags & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Chat Logs Spotlight */}
        <Card className="lg:col-span-2 border border-slate-200 bg-white shadow-xs rounded-3xl">
          <CardHeader className="p-6 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
                <AlertTriangle size={20} />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  Recent High-Priority Safety Flags
                </CardTitle>
                <CardDescription className="text-sm text-slate-500">
                  Conversations flagged for acute emergency swelling or safety triage
                </CardDescription>
              </div>
            </div>

            <Link href="/admin/chat-logs">
              <Button variant="ghost" size="sm" className="text-sm font-bold text-purple-700 hover:bg-purple-50">
                All Logs ({MOCK_CHAT_SESSIONS.length})
              </Button>
            </Link>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-slate-100">
            {urgentChatLogs.map((session) => (
              <div 
                key={session.id} 
                className="p-5 hover:bg-purple-50/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs sm:text-sm font-bold text-slate-700">{session.sessionId}</span>
                    <Badge className={`text-xs font-semibold ${
                      session.flagStatus === 'Urgent' 
                        ? 'bg-amber-100 text-amber-800 border-amber-200' 
                        : 'bg-rose-100 text-rose-800 border-rose-200'
                    }`}>
                      {session.flagStatus}
                    </Badge>
                    <span className="text-xs sm:text-sm text-slate-600 font-medium">• {session.time}</span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-slate-800">
                    {session.topic}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-2">
                    <span>Patient: <strong className="text-slate-700">{session.userName}</strong></span>
                    <span>•</span>
                    <span>Outcome: <strong className="text-purple-700">{session.outcome}</strong></span>
                  </p>
                </div>

                <Link href="/admin/chat-logs" className="shrink-0">
                  <Button size="sm" variant="outline" className="border-purple-200 text-purple-700 hover:bg-purple-100 font-semibold text-xs sm:text-sm">
                    Inspect Transcript
                  </Button>
                </Link>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Operations */}
        <Card className="border border-slate-200 bg-white shadow-xs rounded-3xl flex flex-col justify-between">
          <CardHeader className="p-6 border-b border-slate-100">
            <CardTitle className="text-lg font-bold text-slate-900">
              Admin Quick Actions
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Rapid administrative shortcuts & operations
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-3 flex-1">
            <Link href="/admin/clinics" className="block">
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-purple-700">Add / Edit Partner Clinic</p>
                    <p className="text-xs text-slate-500">Register dental emergency practices</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

            <Link href="/admin/appointments" className="block">
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                    <CalendarCheck size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-purple-700">Review Pending Bookings</p>
                    <p className="text-xs text-slate-500">38 requests awaiting confirmation</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

            <Link href="/admin/users" className="block">
              <div className="p-4 rounded-2xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/50 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 group-hover:text-purple-700">User Access Controls</p>
                    <p className="text-xs text-slate-500">Manage doctor & patient roles</p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          </CardContent>

          <div className="p-5 border-t border-slate-100 bg-slate-50/60 rounded-b-3xl flex items-center justify-between text-xs sm:text-sm text-slate-600">
            <span className="flex items-center gap-2 font-medium">
              <ShieldCheck size={16} className="text-purple-600" />
              HIPAA & GDPR Compliant
            </span>
            <span className="font-mono text-xs text-slate-600 font-semibold">Denova-Clinical-AI</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
