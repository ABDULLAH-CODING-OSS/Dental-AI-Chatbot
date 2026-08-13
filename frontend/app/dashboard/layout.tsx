import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900 selection:bg-emerald-200 selection:text-emerald-900">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <Topbar />
        <main className="flex-1 overflow-auto relative">
          {children}
        </main>
      </div>
    </div>
  );
}
