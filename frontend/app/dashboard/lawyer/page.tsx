"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { 
  TrendingUp, 
  Users, 
  Gavel, 
  Clock, 
  ArrowRight, 
  Briefcase 
} from "lucide-react";


export default function LawyerDashboardOverview() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0 });
  const [recentCases, setRecentCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get User Info
        const userStr = localStorage.getItem("user");
        if (userStr) setUser(JSON.parse(userStr));

        // 2. Get Cases to calculate stats
        const res = await api.get("/cases");
        const allCases = res.data;

        // Calculate Stats
        const active = allCases.filter((c: any) => c.status === 'OPEN').length;
        const pending = allCases.filter((c: any) => c.status === 'PENDING').length;

        setStats({
          total: allCases.length,
          active,
          pending
        });

        // Get only the last 3 cases
        setRecentCases(allCases.slice(0, 3));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8">Loading Dashboard...</div>;

  return (
    <div className="space-y-8">
      {/* 1. Welcome Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, Advocate {user?.lastName}
        </h1>
        <p className="text-slate-300">
          You have <span className="font-bold text-white">{stats.active} active cases</span> requiring your attention today.
        </p>
      </div>

      {/* 2. Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
            <Gavel size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Cases</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.total}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-lg text-green-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Active / Open</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.active}</h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-yellow-50 p-3 rounded-lg text-yellow-600">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Review</p>
            <h3 className="text-2xl font-bold text-gray-800">{stats.pending}</h3>
          </div>
        </div>
      </div>

      {/* 3. Recent Cases (Mini List) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Briefcase size={20} className="text-gray-400" />
            Recent Cases
          </h3>
          <Link 
            href="/dashboard/lawyer/cases" 
            className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1"
          >
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {recentCases.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No cases found.</div>
          ) : (
            recentCases.map((c: any) => (
              <Link 
                key={c.id} 
                href={`/dashboard/lawyer/cases/${c.id}`}
                className="flex items-center justify-between p-6 hover:bg-gray-50 transition block"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{c.title}</h4>
                  <p className="text-sm text-gray-500">Client: {c.client.firstName} {c.client.lastName}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    c.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {c.status}
                  </span>
                  <ArrowRight size={18} className="text-gray-300" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}