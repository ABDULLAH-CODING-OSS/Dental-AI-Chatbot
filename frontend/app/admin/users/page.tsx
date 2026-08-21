"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, CheckCircle2, RefreshCw, Search, Trash2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type AdminUser = {
  id: number | string;
  name: string;
  email: string;
  status: string;
  signupDate: string;
  chatCount: number;
};

function normalizeUser(user: Record<string, unknown>): AdminUser {
  const rawDate = user.signup_date || user.created_at || user.createdAt;
  const rawName = user.name || user.full_name || user.fullName || "Unnamed user";
  const rawChatCount = user.chat_count ?? user.total_chats ?? user.totalChats ?? 0;
  return {
    id: (user.id as number | string) ?? "unknown",
    name: String(rawName),
    email: String(user.email || ""),
    status: String(user.status || (user.is_suspended ? "Suspended" : "Active")),
    signupDate: rawDate ? new Date(String(rawDate)).toLocaleDateString() : "Not available",
    chatCount: Number(rawChatCount) || 0,
  };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { token, logout, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.get(`${BACKEND_BASE_URL}/api/admin/users/`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
      setUsers(Array.isArray(response.data) ? response.data.map(normalizeUser) : []);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setErrorMessage("Unable to load users. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [logout, router, token]);

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
      return;
    }
    if (token) void fetchUsers();
  }, [authLoading, fetchUsers, router, token]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query));
  }, [searchQuery, users]);

  const handleToggleSuspend = async (user: AdminUser) => {
    if (!token) return;
    try {
      const response = await axios.patch(`${BACKEND_BASE_URL}/api/admin/users/${user.id}/suspend`, {}, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 20000,
      });
      const nextStatus = response.data?.status || (user.status.toLowerCase() === "suspended" ? "Active" : "Suspended");
      setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status: String(nextStatus) } : item));
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      setErrorMessage(axios.isAxiosError(error) ? error.response?.data?.detail || "Unable to update user status." : "Unable to update user status.");
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!token || !window.confirm(`Delete ${user.name}?`)) return;
    try {
      await axios.delete(`${BACKEND_BASE_URL}/api/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 20000,
      });
      setUsers((current) => current.filter((item) => item.id !== user.id));
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        logout();
        router.push("/login");
        return;
      }
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setErrorMessage(error.response.data?.detail || "Cannot delete this patient while active appointments exist.");
        return;
      }
      setErrorMessage(axios.isAxiosError(error) ? error.response?.data?.detail || "Unable to delete user." : "Unable to delete user.");
    }
  };

  return (
    <div className="space-y-8 pb-16 font-sans">
      <div className="flex flex-col gap-3 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">User Access Controls</h1>
          <p className="mt-1 text-sm text-slate-600">Manage registered patients and account status.</p>
        </div>
        <Button type="button" variant="outline" onClick={() => void fetchUsers()} disabled={loading}><RefreshCw size={15} className="mr-2" />Refresh</Button>
      </div>

      {errorMessage && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{errorMessage}</div>}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 p-5">
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search by name or email" className="pl-9" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Status</th><th className="p-4">Signup Date</th><th className="p-4">Chat Count</th><th className="p-4 text-right">Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="p-6"><Skeleton className="h-8 w-full" /></td></tr> : filteredUsers.length === 0 ? <tr><td colSpan={6} className="p-8 text-center text-slate-500">No users found.</td></tr> : filteredUsers.map((user) => {
                const suspended = user.status.toLowerCase() === "suspended";
                return <tr key={user.id} className="border-t border-slate-100"><td className="p-4 font-semibold text-slate-900">{user.name}</td><td className="p-4 text-slate-600">{user.email}</td><td className="p-4"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${suspended ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}><CheckCircle2 size={13} />{suspended ? "Suspended" : "Active"}</span></td><td className="p-4 text-slate-600">{user.signupDate}</td><td className="p-4 text-slate-600">{user.chatCount}</td><td className="p-4 text-right whitespace-nowrap"><Button type="button" variant="ghost" size="sm" onClick={() => void handleToggleSuspend(user)}><Ban size={14} className="mr-1" />{suspended ? "Reactivate" : "Suspend"}</Button><Button type="button" variant="ghost" size="sm" onClick={() => void handleDelete(user)} className="text-red-600"><Trash2 size={14} /></Button></td></tr>;
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
