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
type Service = { id: number; name: string; description?: string | null; base_price: number };

export default function AdminServicesPage() {
  const router = useRouter();
  const { token, logout, isLoading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Service | null>(null);
  const [form, setForm] = useState({ name: "", description: "", base_price: "" });

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/services/`, { headers: { Authorization: `Bearer ${token}` } });
      setServices(response.data);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 401) { logout(); router.push("/login"); return; }
      setError("Unable to load services.");
    } finally { setLoading(false); }
  }, [token, logout, router]);

  useEffect(() => {
    if (!authLoading && !token) router.push("/login");
    if (token) void Promise.resolve().then(load);
  }, [authLoading, token, router, load]);

  const reset = () => { setEditing(null); setForm({ name: "", description: "", base_price: "" }); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!token || !form.name.trim() || Number(form.base_price) < 0) return;
    const payload = { name: form.name.trim(), description: form.description.trim() || null, base_price: Number(form.base_price) };
    try {
      const response = editing
        ? await axios.patch(`${API}/api/services/${editing.id}`, payload, { headers: { Authorization: `Bearer ${token}` } })
        : await axios.post(`${API}/api/services/`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setServices((current) => editing ? current.map((item) => item.id === editing.id ? response.data : item) : [...current, response.data]);
      reset();
    } catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.detail || "Unable to save service." : "Unable to save service."); }
  };
  const remove = async (service: Service) => {
    if (!token || !window.confirm(`Delete ${service.name}?`)) return;
    try {
      await axios.delete(`${API}/api/services/${service.id}`, { headers: { Authorization: `Bearer ${token}` } });
      setServices((current) => current.filter((item) => item.id !== service.id));
    } catch (err) { setError(axios.isAxiosError(err) ? err.response?.data?.detail || "Unable to delete service." : "Unable to delete service."); }
  };

  return <div className="space-y-8 pb-16">
    <header className="flex items-center justify-between border-b border-slate-200 pb-6">
      <div><h1 className="text-2xl font-semibold text-slate-900">Services</h1><p className="mt-1 text-slate-600">Manage the dental services offered through booking.</p></div>
      <Button variant="outline" onClick={load} disabled={loading}><RefreshCw size={15} className="mr-2" />Refresh</Button>
    </header>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{error}</div>}
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Name</th><th className="p-4">Description</th><th className="p-4">Base price</th><th className="p-4 text-right">Actions</th></tr></thead>
          <tbody>{loading ? <tr><td className="p-8 text-center text-slate-500" colSpan={4}>Loading services...</td></tr> : services.map((service) => <tr key={service.id} className="border-t border-slate-100"><td className="p-4 font-bold text-slate-900">{service.name}</td><td className="p-4 text-slate-600">{service.description || "—"}</td><td className="p-4 font-bold text-emerald-700">${service.base_price.toFixed(2)}</td><td className="p-4 text-right"><Button variant="ghost" size="sm" onClick={() => { setEditing(service); setForm({ name: service.name, description: service.description || "", base_price: String(service.base_price) }); }}><Edit3 size={14} className="mr-1" />Edit</Button><Button variant="ghost" size="sm" onClick={() => remove(service)} className="text-red-600"><Trash2 size={14} /></Button></td></tr>)}</tbody>
        </table>
      </div>
      <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"><h2 className="text-lg font-bold text-slate-900">{editing ? "Edit service" : "Add service"}</h2><div><Label>Name</Label><Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div><div><Label>Description</Label><Input className="mt-1" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div><div><Label>Base price</Label><Input className="mt-1" type="number" min="0" step="0.01" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} required /></div><div className="flex gap-2"><Button type="submit"><Plus size={15} className="mr-2" />{editing ? "Save changes" : "Create service"}</Button>{editing && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div></form>
    </div>
  </div>;
}
