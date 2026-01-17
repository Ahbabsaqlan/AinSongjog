"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Search, MapPin, Briefcase, ShieldCheck, 
  CalendarDays, FileText, Gavel, ArrowRight, User
} from "lucide-react";

// Types
interface Lawyer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  lawyerProfile: {
    chamberAddress: string;
    hourlyRate: number;
    bio: string;
    mobileNumber: string;
    barCouncilId: string;
    photoUrl: string;
    lawyerType: string;
    practiceAreas: string;
    currentWorkplace: string; 
  };
}

export default function ClientDashboardSearch() {
  const [query, setQuery] = useState("");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    fetchLawyers();
  }, []);

  const fetchLawyers = async (searchQuery: string = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/users/lawyers/search?query=${searchQuery}`);
      setLawyers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch lawyers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const searchQuery = query || (activeFilter !== "All" ? activeFilter : "");
      fetchLawyers(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query, activeFilter]);

  const handleFilterClick = (cat: string) => {
    setActiveFilter(cat);
    setQuery(""); // Clear text search when a filter is clicked
  };

  const renderSpecialties = (areas: string) => {
    if (!areas) return null;
    return areas.split(',').slice(0, 2).map((tag, i) => (
      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold rounded-md">
        {tag.trim()}
      </span>
    ));
  };

  return (
    <div className="space-y-10 p-4 sm:p-6 lg:p-8">
      
      {/* 1. HERO SECTION */}
      <div className="relative bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 rounded-2xl p-6 md:p-8 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        {/* --- MODIFICATION: Rebuilt for mobile-first centered layout --- */}
        <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between items-center text-center lg:text-left gap-8">
          
          {/* Combined Text, Buttons, and Search for mobile stacking */}
          <div className="flex flex-col items-center lg:items-start w-full gap-6">
            <div className="max-w-xl">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
                Hello, {user?.firstName || "Client"} 👋
              </h1>
              <p className="text-slate-300 text-base sm:text-lg">
                Find the right legal expert for your needs or manage your ongoing cases.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
              <Link href="/dashboard/client/cases" className="flex flex-col items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl backdrop-blur-md transition h-24">
                <FileText size={20} className="text-blue-400" />
                <span className="font-semibold text-sm">My Cases</span>
              </Link>
              <Link href="/dashboard/client/appointments" className="flex flex-col items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 p-4 rounded-xl backdrop-blur-md transition h-24">
                <CalendarDays size={20} className="text-purple-400" />
                <span className="font-semibold text-sm">Appointments</span>
              </Link>
            </div>
          </div>

          <div className="w-full max-w-sm lg:max-w-none lg:w-[400px] bg-white rounded-xl p-2 shadow-lg self-center">
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or specialty..."
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveFilter("All"); // Deactivate filter when typing
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg text-slate-800 placeholder:text-slate-400 font-medium outline-none bg-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORY FILTERS */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-hide">
        {["All", "Criminal Law", "Property Dispute", "Family Law", "Corporate", "High Court"].map((cat) => (
          <button 
            key={cat}
            onClick={() => handleFilterClick(cat)}
            className={`px-5 py-2 rounded-full text-sm font-bold transition whitespace-nowrap ${
              activeFilter === cat 
              ? 'bg-slate-900 text-white' 
              : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. LAWYER GRID */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <Briefcase size={20} className="text-blue-600" />
          Top Rated Professionals
        </h2>
        
        {loading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {[1, 2, 3].map((i) => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>)}
           </div>
        ) : lawyers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Search className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-lg font-medium text-slate-900">No lawyers found</h3>
            <p className="text-slate-500">Try adjusting your search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lawyers.map((lawyer) => (
              <div key={lawyer.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col h-full">
                
                <div className="p-6 border-b border-slate-50 flex items-start gap-4 bg-slate-50/50">
                  <div className="w-16 h-16 rounded-full border-2 border-white shadow-md bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {lawyer.lawyerProfile?.photoUrl ? (
                      <img src={lawyer.lawyerProfile.photoUrl} alt={`${lawyer.firstName} ${lawyer.lastName}`} className="w-full h-full object-cover" />
                    ) : ( <User className="text-slate-300" size={32} /> )}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">
                      {lawyer.firstName} {lawyer.lastName}
                    </h3>
                    <p className="text-sm text-blue-600 font-bold mb-1">{lawyer.lawyerProfile?.lawyerType || "Advocate"}</p>
                    <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <ShieldCheck size={12} className="text-green-500" /> 
                      <span>Verified • {lawyer.lawyerProfile?.barCouncilId}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">{renderSpecialties(lawyer.lawyerProfile?.practiceAreas)}</div>
                  <div className="space-y-2.5 mt-2">
                    <div className="flex items-start gap-2 text-sm text-slate-600">
                      <MapPin size={16} className="text-slate-400 mt-0.5" />
                      <span className="line-clamp-1 font-medium">{lawyer.lawyerProfile?.chamberAddress || "Dhaka, Bangladesh"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Gavel size={16} className="text-slate-400" />
                      <span className="line-clamp-1 font-medium">{lawyer.lawyerProfile?.currentWorkplace || "Independent Practice"}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="text-center sm:text-left">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consultation</span>
                    <span className="block text-lg font-extrabold text-slate-900">৳{lawyer.lawyerProfile?.hourlyRate || "N/A"}</span>
                  </div>
                  <Link href={`/dashboard/client/lawyers/${lawyer.id}`} className="w-full sm:w-auto">
                    <button className="w-full bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:bg-blue-600 hover:shadow-blue-600/20 transition flex items-center justify-center gap-2 group/btn">
                      View Profile <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}