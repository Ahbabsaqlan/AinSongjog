"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { 
  TrendingUp, 
  Gavel, 
  Clock, 
  ArrowRight, 
  Briefcase,
  CalendarCheck,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "../../context/auth-context";

export default function LawyerDashboardOverview() {
  const { user } = useAuth(); // GET USER FROM CONTEXT
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await api.get("/cases");
        const allCases = res.data;

        setStats({
          total: allCases.length,
          active: allCases.filter((c: any) => c.status === 'OPEN').length,
          pending: allCases.filter((c: any) => c.status === 'PENDING').length
        });

        setRecentCases(allCases.slice(0, 3));
      } catch (error) {
        console.error("Failed to load dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Professional Greeting Helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse p-4 md:p-0">
        <div className="h-40 bg-slate-200 rounded-3xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-slate-100 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-10 pb-12 px-2 md:px-0">
      
      {/* 1. WELCOME HERO SECTION */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 rounded-[2rem] p-8 md:p-12 text-white overflow-hidden shadow-2xl border border-white/5">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] -mr-20 -mt-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="max-w-xl text-center md:text-left">
            <h4 className="text-blue-400 font-black uppercase tracking-[0.2em] text-xs mb-3">
              {getGreeting()}
            </h4>
            <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
              Advocate {user?.lastName || "Counsel"}
            </h1>
            <p className="text-blue-100/70 text-base md:text-lg mb-8 font-medium leading-relaxed">
              You have <span className="text-white font-bold">{stats.active} active cases</span> that require your oversight today. Your next hearing is being synchronized.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Link href="/dashboard/lawyer/cases" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl transition-all font-bold shadow-lg shadow-blue-600/20">
                <Gavel size={18} /> Manage Cases
              </Link>
              <Link href="/dashboard/lawyer/appointments" className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md transition-all font-bold">
                <CalendarCheck size={18} /> View Schedule
              </Link>
            </div>
          </div>

          {/* Quick Circular Stat (Desktop Only) */}
          <div className="hidden lg:flex flex-col items-center justify-center w-40 h-40 rounded-full border-8 border-blue-500/20 bg-white/5 backdrop-blur-sm relative">
             <span className="text-4xl font-black">{stats.total}</span>
             <span className="text-[10px] font-bold uppercase text-blue-300">Total Matters</span>
          </div>
        </div>
      </div>

      {/* 2. STATISTICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          icon={<Gavel />} 
          label="Total Portfolio" 
          value={stats.total} 
          color="blue" 
        />
        <StatCard 
          icon={<TrendingUp />} 
          label="Active Litigation" 
          value={stats.active} 
          color="green" 
        />
        <StatCard 
          icon={<Clock />} 
          label="Pending Review" 
          value={stats.pending} 
          color="yellow" 
        />
      </div>

      {/* 3. RECENT ACTIVITY SECTION */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white rounded-xl shadow-sm">
               <Briefcase size={20} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Case Activity</h3>
          </div>
          <Link 
            href="/dashboard/lawyer/cases" 
            className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition flex items-center gap-2 group"
          >
            All Matters <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {recentCases.length === 0 ? (
            <div className="p-12 text-center text-slate-400 font-medium italic">
              No recent cases found in your directory.
            </div>
          ) : (
            recentCases.map((c: any) => (
              <Link 
                key={c.id} 
                href={`/dashboard/lawyer/cases/${c.id}`}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-6 md:p-8 hover:bg-slate-50/80 transition-all group"
              >
                <div className="flex items-center gap-4 mb-4 sm:mb-0">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    c.status === 'OPEN' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {c.status === 'OPEN' ? <TrendingUp size={24} /> : <CheckCircle2 size={24} />}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 group-hover:text-blue-700 transition-colors">{c.title}</h4>
                    <p className="text-sm text-slate-500 font-medium">Client: {c.client.firstName} {c.client.lastName}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:justify-end gap-6">
                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    c.status === 'OPEN' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-200'
                  }`}>
                    {c.status}
                  </span>
                  <div className="p-2 rounded-full bg-white border border-slate-200 text-slate-300 group-hover:text-blue-600 group-hover:border-blue-200 transition-all">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// --- REUSABLE STAT CARD ---
function StatCard({ icon, label, value, color }: any) {
  const colors: any = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-green-600 bg-green-50 border-green-100",
    yellow: "text-yellow-600 bg-yellow-50 border-yellow-100",
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colors[color]} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{value}</h3>
    </div>
  );
}