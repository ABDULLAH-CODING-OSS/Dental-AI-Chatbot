"use client";

import React, { useState } from "react";
import { 
  SlidersHorizontal, 
  ShieldCheck, 
  Cpu, 
  CheckCircle2, 
  Sparkles,
  Save,
  RotateCcw,
  BookOpen
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { MOCK_ADMIN_SETTINGS } from "@/lib/admin-mock-data";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(MOCK_ADMIN_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      showNotification("Platform guardrails & rate-limiting configuration saved!");
    }, 600);
  };

  const handleResetDefaults = () => {
    setSettings(MOCK_ADMIN_SETTINGS);
    showNotification("Settings reset to clinical defaults.");
  };

  return (
    <div className="space-y-8 pb-16 font-sans" suppressHydrationWarning>
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
            <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
              System & Guardrail Settings
            </h1>
            <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs font-semibold px-2.5 py-0.5">
              Clinical Intelligence Engine
            </Badge>
          </div>
          <p className="text-sm md:text-base text-slate-600 font-medium">
            Configure dialogue rate limits, clinical disclaimer rules, medical triage sensitivity, and routing radius.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            className="h-10 px-4 text-sm font-semibold border-slate-300 text-slate-700"
          >
            <RotateCcw size={15} className="mr-2" />
            Reset Defaults
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8" suppressHydrationWarning>
        {/* Section 1: Clinical AI Engine & Verified Evidence Base Panel */}
        <Card className="border border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                <Cpu size={22} />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg md:text-xl font-bold text-slate-900">
                  Clinical AI Intelligence & Evidence Base
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 font-medium">
                  Active diagnostic engine and medical knowledge telemetry
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Core Intelligence Box */}
              <div className="p-5 rounded-2xl border border-purple-100 bg-purple-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-700 flex items-center gap-1.5">
                    <Sparkles size={14} /> Core Intelligence Engine
                  </span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold">
                    Live / Operational
                  </Badge>
                </div>
                <p className="text-base font-extrabold text-slate-900">
                  Denova Clinical AI (Medical-Grade)
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  High-throughput conversational AI optimized for real-time dental symptom triage and clinical guidance.
                </p>
              </div>

              {/* Verified Sources Box */}
              <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <BookOpen size={14} /> Verified Dental Sources
                  </span>
                  <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 text-xs font-semibold">
                    Active Corpus
                  </Badge>
                </div>
                <p className="text-base font-extrabold text-slate-900">
                  Curated Dental Health Literature
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Grounded in authoritative evidence from MedlinePlus, CDC, and NIDCR dental health guidelines.
                </p>
              </div>
            </div>

            {/* Geolocation Routing Radius Slider */}
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-sm font-bold text-slate-900 block">
                    Emergency Clinic Geolocation Routing Radius
                  </label>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Maximum search distance for automated patient referrals to 24/7 dental emergency facilities.
                  </p>
                </div>
                <span className="font-mono font-extrabold text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-xl self-start sm:self-auto shrink-0">
                  {settings.routingRadiusMiles} miles
                </span>
              </div>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={settings.routingRadiusMiles}
                onChange={(e) => setSettings({ ...settings, routingRadiusMiles: Number(e.target.value) })}
                className="w-full accent-purple-600 cursor-pointer mt-2"
                suppressHydrationWarning
              />
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Rate Limiting & Capacity */}
        <Card className="border border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
                <SlidersHorizontal size={22} />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg md:text-xl font-bold text-slate-900">
                  Rate-Limiting & Capacity Controls
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 font-medium">
                  Prevent abuse and control conversational throughput thresholds
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Max Messages / Day */}
              <div className="space-y-3 p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-slate-900 text-sm block">Max Messages Per User / Day</label>
                    <span className="text-xs sm:text-sm text-slate-500">Cap on daily chatbot prompts per patient</span>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-xl shrink-0">
                    {settings.maxMessagesPerUserPerDay} msgs
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={150}
                  step={5}
                  value={settings.maxMessagesPerUserPerDay}
                  onChange={(e) => setSettings({ ...settings, maxMessagesPerUserPerDay: Number(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer"
                  suppressHydrationWarning
                />
              </div>

              {/* Max Sessions / Hour */}
              <div className="space-y-3 p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-slate-900 text-sm block">Max Sessions Per Hour</label>
                    <span className="text-xs sm:text-sm text-slate-500">Limit on concurrent new chat initiations</span>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-xl shrink-0">
                    {settings.maxChatbotSessionsPerHour} sessions
                  </span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={30}
                  step={1}
                  value={settings.maxChatbotSessionsPerHour}
                  onChange={(e) => setSettings({ ...settings, maxChatbotSessionsPerHour: Number(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer"
                  suppressHydrationWarning
                />
              </div>

              {/* Response Length Limit */}
              <div className="space-y-3 p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-slate-900 text-sm block">Max Response Length Limit</label>
                    <span className="text-xs sm:text-sm text-slate-500">Maximum response length generation</span>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-xl shrink-0">
                    {settings.maxTokenLimitPerResponse} units
                  </span>
                </div>
                <input
                  type="range"
                  min={256}
                  max={2048}
                  step={128}
                  value={settings.maxTokenLimitPerResponse}
                  onChange={(e) => setSettings({ ...settings, maxTokenLimitPerResponse: Number(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer"
                  suppressHydrationWarning
                />
              </div>

              {/* Retention */}
              <div className="space-y-3 p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-slate-900 text-sm block">Data Retention Period</label>
                    <span className="text-xs sm:text-sm text-slate-500">HIPAA compliant encrypted session storage</span>
                  </div>
                  <span className="font-mono font-extrabold text-sm text-purple-700 bg-purple-100 px-3 py-1 rounded-xl shrink-0">
                    {settings.retentionDays} days
                  </span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={365}
                  step={30}
                  value={settings.retentionDays}
                  onChange={(e) => setSettings({ ...settings, retentionDays: Number(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer"
                  suppressHydrationWarning
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 3: Clinical Safety & Guardrails */}
        <Card className="border border-slate-200 bg-white shadow-xs rounded-3xl overflow-hidden">
          <CardHeader className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                <ShieldCheck size={22} />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-lg md:text-xl font-bold text-slate-900">
                  Clinical Safety & Emergency Guardrails
                </CardTitle>
                <CardDescription className="text-sm text-slate-500 font-medium">
                  Medical safety protocols, disclaimer mandates, and automated triage triggers
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
              <div className="space-y-1 pr-4 min-w-0 flex-1">
                <span className="font-bold text-slate-900 text-sm md:text-base block">Mandatory Clinical Disclaimer</span>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Append standard medical guidance disclaimers to all AI triage dialogues to ensure full compliance with health information standards.
                </p>
              </div>
              <div className="shrink-0">
                <Switch
                  checked={settings.clinicalDisclaimerEnforced}
                  onCheckedChange={(checked) => setSettings({ ...settings, clinicalDisclaimerEnforced: checked })}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
              <div className="space-y-1 pr-4 min-w-0 flex-1">
                <span className="font-bold text-slate-900 text-sm md:text-base block">Automated Emergency Referral Trigger</span>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Immediately highlight 24/7 partner emergency clinics when symptoms like swelling, airway compromise, or acute infection are detected.
                </p>
              </div>
              <div className="shrink-0">
                <Switch
                  checked={settings.emergencyTriageAutoEscalate}
                  onCheckedChange={(checked) => setSettings({ ...settings, emergencyTriageAutoEscalate: checked })}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40">
              <div className="space-y-1 pr-4 min-w-0 flex-1">
                <span className="font-bold text-slate-900 text-sm md:text-base block">Urgent Triage Email Alerts</span>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  Send immediate notification emails to on-call clinical admins when an emergency level safety flag is triggered.
                </p>
              </div>
              <div className="shrink-0">
                <Switch
                  checked={settings.emailAlertsUrgent}
                  onCheckedChange={(checked) => setSettings({ ...settings, emailAlertsUrgent: checked })}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border border-amber-200 bg-amber-50/40">
              <div className="space-y-1 pr-4 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-950 text-sm md:text-base block">System Maintenance Mode</span>
                  <Badge className="bg-amber-200 text-amber-900 text-xs font-bold">Restricted</Badge>
                </div>
                <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed font-medium">
                  Temporarily pause public user chat queries while performing database updates or knowledge corpus re-indexing.
                </p>
              </div>
              <div className="shrink-0">
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-6 border-t border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs sm:text-sm text-slate-500 font-medium">
              Changes apply instantly across real-time clinical consultation pipelines.
            </span>

            <Button
              type="submit"
              disabled={isSaving}
              className="h-11 px-6 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-bold shadow-sm w-full sm:w-auto"
            >
              <Save size={16} className="mr-2" />
              {isSaving ? "Saving Configuration..." : "Save System Settings"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
