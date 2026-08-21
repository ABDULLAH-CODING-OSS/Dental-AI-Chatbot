"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Cpu, Save, ShieldCheck } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Settings = {
  daily_message_limit: number;
  clinical_disclaimer: boolean;
  emergency_triage: boolean;
};

const defaultSettings: Settings = {
  daily_message_limit: 100,
  clinical_disclaimer: true,
  emergency_triage: true,
};

function normalizeSettings(value: Record<string, unknown>): Settings {
  return {
    daily_message_limit: Number(value.daily_message_limit ?? value.dailyMessageLimit ?? defaultSettings.daily_message_limit),
    clinical_disclaimer: Boolean(value.clinical_disclaimer ?? value.clinical_disclaimer_enforced ?? value.clinicalDisclaimer ?? defaultSettings.clinical_disclaimer),
    emergency_triage: Boolean(value.emergency_triage ?? value.emergency_triage_auto_escalate ?? value.emergencyTriage ?? defaultSettings.emergency_triage),
  };
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const { token, logout, isLoading: authLoading } = useAuth();
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [savedSettings, setSavedSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/api/admin/settings/`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      const nextSettings = normalizeSettings(response.data || {});
      setSettings(nextSettings);
      setSavedSettings(nextSettings);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setErrorMessage("Unable to load settings. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [logout, router, token]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
      return;
    }
    if (token) void fetchSettings();
  }, [authLoading, fetchSettings, router, token]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    const changedFields: Partial<Settings> = {};
    if (settings.daily_message_limit !== savedSettings.daily_message_limit) changedFields.daily_message_limit = settings.daily_message_limit;
    if (settings.clinical_disclaimer !== savedSettings.clinical_disclaimer) changedFields.clinical_disclaimer = settings.clinical_disclaimer;
    if (settings.emergency_triage !== savedSettings.emergency_triage) changedFields.emergency_triage = settings.emergency_triage;

    try {
      const response = await axios.patch(`${BACKEND_BASE_URL}/api/admin/settings/`, changedFields, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        timeout: 20000,
      });
      const nextSettings = normalizeSettings(response.data || settings);
      setSettings(nextSettings);
      setSavedSettings(nextSettings);
      setSuccessMessage("Settings saved successfully.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setErrorMessage(axios.isAxiosError(error) ? error.response?.data?.detail || "Unable to save settings." : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      <div className="border-b border-slate-200/80 pb-6">
        <h1 className="text-2xl font-semibold text-slate-900">System & Guardrail Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Manage the safeguards that shape each clinical consultation.</p>
      </div>

      {errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{errorMessage}</div>}
      {successMessage && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{successMessage}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <Cpu size={20} className="text-slate-500" />
            <div><h2 className="text-lg font-semibold text-slate-900">Consultation Controls</h2><p className="text-sm text-slate-500">Set daily usage and safety preferences.</p></div>
          </div>
          <div className="mt-6 space-y-5">
            <div className="max-w-sm space-y-2">
              <Label htmlFor="daily-message-limit">Daily Message Limit</Label>
              <Input id="daily-message-limit" type="number" min={1} value={settings.daily_message_limit} disabled={loading || saving} onChange={(event) => setSettings((current) => ({ ...current, daily_message_limit: Number(event.target.value) }))} />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><div><p className="font-medium text-slate-900">Clinical Disclaimer</p><p className="text-sm text-slate-500">Automatically included in every clinical response.</p></div><Switch checked={settings.clinical_disclaimer} disabled={loading || saving} onCheckedChange={(checked) => setSettings((current) => ({ ...current, clinical_disclaimer: checked }))} /></div>
            <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4"><div><p className="font-medium text-slate-900">Emergency Triage</p><p className="text-sm text-slate-500">Helps identify urgent symptoms that may need immediate care.</p></div><Switch checked={settings.emergency_triage} disabled={loading || saving} onCheckedChange={(checked) => setSettings((current) => ({ ...current, emergency_triage: checked }))} /></div>
          </div>
        </div>

        <div className="flex justify-end"><Button type="submit" disabled={loading || saving}><Save size={15} className="mr-2" />{saving ? "Saving..." : "Save Settings"}</Button></div>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><div className="flex items-center gap-3"><ShieldCheck size={19} className="text-emerald-600" /><h2 className="text-base font-semibold text-slate-900">Clinical safety</h2></div><p className="mt-3 text-sm leading-relaxed text-slate-600">Safety guidance is included throughout the consultation experience.</p></div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><div className="flex items-center gap-3"><BookOpen size={19} className="text-emerald-600" /><h2 className="text-base font-semibold text-slate-900">Trusted references</h2></div><p className="mt-3 text-sm leading-relaxed text-slate-600">Responses are sourced from verified dental health references.</p></div>
      </div>
    </div>
  );
}
