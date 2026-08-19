"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Plus, RefreshCw, Trash2 } from "lucide-react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
type Clinic = { id: number; name: string; address: string; phone?: string | null; latitude?: number | null; longitude?: number | null; operating_hours?: string | null };

export default function AdminClinicsPage() {
  const router = useRouter();
  const { token, logout, isLoading: authLoading } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Clinic | null>(null);
  const [form, setForm] = useState({ name: "", address: "", phone: "", operating_hours: "", latitude: "", longitude: "" });

  const load = useCallback(async () => { if (!token) return; setLoading(true); try { const response = await axios.get(`${API}/api/clinics/`, { headers: { Authorization: `Bearer ${token}` } }); setClinics(response.data); setError(null); } catch (err) { if (axios.isAxiosError(err) && err.response?.status === 401) { logout(); router.push("/login"); return; } setError("Unable to load clinics."); } finally { setLoading(false); } }, [token, logout, router]);
  useEffect(() => { if (!authLoading && !token) router.push("/login"); if (token) void Promise.resolve().then(load); }, [authLoading, token, router, load]);
  const reset = () => { setEditing(null); setForm({ name: "", address: "", phone: "", operating_hours: "", latitude: "", longitude: "" }); };
  const edit = (clinic: Clinic) => { setEditing(clinic); setForm({ name: clinic.name, address: clinic.address, phone: clinic.phone || "", operating_hours: clinic.operating_hours || "", latitude: clinic.latitude?.toString() || "", longitude: clinic.longitude?.toString() || "" }); };
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (!token) return; const payload = { name: form.name.trim(), address: form.address.trim(), phone: form.phone.trim() || null, operating_hours: form.operating_hours.trim() || null, latitude: form.latitude ? Number(form.latitude) : null, longitude: form.longitude ? Number(form.longitude) : null }; try { const response = editing ? await axios.patch(`${API}/api/clinics/${editing.id}`, payload, { headers: { Authorization: `Bearer ${token}` } }) : await axios.post(`${API}/api/clinics/`, payload, { headers: { Authorization: `Bearer ${token}` } }); setClinics((current) => editing ? current.map((item) => item.id === editing.id ? response.data : item) : [...current, response.data]); reset(); } catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.detail || "Unable to save clinic." : "Unable to save clinic."); } };
  const remove = async (clinic: Clinic) => { if (!token || !window.confirm(`Delete ${clinic.name}?`)) return; try { await axios.delete(`${API}/api/clinics/${clinic.id}`, { headers: { Authorization: `Bearer ${token}` } }); setClinics((current) => current.filter((item) => item.id !== clinic.id)); } catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.detail || "Unable to delete clinic." : "Unable to delete clinic."); } };

  return <div className="space-y-8 pb-16"><header className="flex items-center justify-between border-b border-slate-200 pb-6"><div><h1 className="text-3xl font-extrabold text-slate-900">Clinics</h1><p className="mt-1 text-slate-600">Manage locations, contact details, hours, and coordinates.</p></div><Button variant="outline" onClick={load} disabled={loading}><RefreshCw size={15} className="mr-2" />Refresh</Button></header>{error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{error}</div>}<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]"><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Name</th><th className="p-4">Address</th><th className="p-4">Phone</th><th className="p-4">Operating hours</th><th className="p-4">Lat/Lng</th><th className="p-4 text-right">Actions</th></tr></thead><tbody>{loading ? <tr><td className="p-8 text-center text-slate-500" colSpan={6}>Loading clinics...</td></tr> : clinics.map((clinic) => <tr key={clinic.id} className="border-t border-slate-100"><td className="p-4 font-bold text-slate-900">{clinic.name}</td><td className="p-4 text-slate-600">{clinic.address}</td><td className="p-4 text-slate-600">{clinic.phone || "—"}</td><td className="p-4 text-slate-600">{clinic.operating_hours || "—"}</td><td className="p-4 text-xs text-slate-600">{clinic.latitude ?? "—"} / {clinic.longitude ?? "—"}</td><td className="p-4 text-right whitespace-nowrap"><Button variant="ghost" size="sm" onClick={() => edit(clinic)}><Edit3 size={14} className="mr-1" />Edit</Button><Button variant="ghost" size="sm" onClick={() => remove(clinic)} className="text-red-600"><Trash2 size={14} /></Button></td></tr>)}</tbody></table></div><form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><h2 className="text-lg font-bold text-slate-900">{editing ? "Edit clinic" : "Add clinic"}</h2>{([['name','Name'],['address','Address'],['phone','Phone'],['operating_hours','Operating hours'],['latitude','Latitude'],['longitude','Longitude']] as const).map(([key, label]) => <div key={key}><Label>{label}</Label><Input className="mt-1" value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} placeholder={key === "operating_hours" ? "09:00-18:00" : undefined} required={key === "name" || key === "address"} /></div>)}<div className="flex gap-2"><Button type="submit"><Plus size={15} className="mr-2" />{editing ? "Save changes" : "Create clinic"}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div></form></div></div>;
}
