"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Search, MapPin, Briefcase, ShieldCheck, 
  CalendarDays, FileText, ArrowRight, User, Gavel
} from "lucide-react";
import { useAuth } from "../../context/auth-context";

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
  const { user } = useAuth(); 
  const [query, setQuery] = useState("");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLawyers = async (searchQuery: string = "") => {
    setLoading(true);
    try {
      const res = await api.get(`/users/lawyers/search?query=${searchQuery}`);
      setLawyers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLawyers(query);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const renderSpecialties = (areas: string) => {
    if (!areas) return null;
    return areas.split(',').slice(0, 2).map((tag, i) => (
      <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold rounded-md border border-slate-200 whitespace-nowrap">
        {tag.trim()}
      </span>
    ));
  };

  return (
    <div className="space-y-8 md:space-y-10 pb-12">
      
      {/* HERO SECTION */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-3xl p-6 md:p-12 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 md:gap-10">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-5xl font-black mb-3 md:mb-4 tracking-tight leading-tight">
              Hello, {user?.firstName || "Client"} 👋
            </h1>
            <p className="text-blue-100 text-base md:text-lg mb-6 md:mb-8 font-medium leading-relaxed opacity-80">
              Find the perfect legal counsel by name, expertise, or location. Your path to justice starts here.
            </p>
            
            <div className="flex flex-wrap gap-3 md:gap-4">
              <Link href="/dashboard/client/cases" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 rounded-2xl backdrop-blur-md transition-all font-bold text-sm md:text-base">
                <FileText size={18} className="text-blue-400" /> My Cases
              </Link>
              <Link href="/dashboard/client/appointments" className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 px-5 py-3 rounded-2xl backdrop-blur-md transition-all font-bold text-sm md:text-base">
                <CalendarDays size={18} className="text-purple-400" /> Schedule
              </Link>
            </div>
          </div>

          <div className="w-full lg:w-[450px] bg-white rounded-2xl p-2 md:p-3 shadow-2xl self-center border border-slate-200 mt-4 lg:mt-0">
            <div className="relative flex items-center">
              <Search className="absolute left-4 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Name, City, or Law Specialty..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 md:py-4 rounded-xl text-slate-900 placeholder:text-slate-400 font-bold outline-none bg-transparent text-sm md:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER BUTTONS (Scrollable on Mobile) */}
      <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide px-1">
        {["All", "Civil Law", "Criminal Law", "High Court", "Property", "Divorce"].map((cat) => (
          <button 
            key={cat} 
            onClick={() => cat === "All" ? setQuery("") : setQuery(cat)} 
            className="px-5 py-2 md:px-6 md:py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition whitespace-nowrap shadow-sm"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* LAWYER GRID */}
      <div className="space-y-6">
        <h2 className="text-xl md:text-2xl font-black text-slate-900 flex items-center gap-3 tracking-tight">
          <Gavel size={24} className="text-blue-600" /> Legal Professionals
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => <div key={i} className="h-72 bg-slate-200 rounded-3xl animate-pulse"></div>)}
          </div>
        ) : lawyers.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-300 mx-4 md:mx-0">
            <Search className="mx-auto h-16 w-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900">No results found</h3>
            <p className="text-slate-400 mt-1">Try different keywords or locations.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {lawyers.map((lawyer) => (
              <div key={lawyer.id} className="group bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col h-full">
                
                {/* Card Header */}
                <div className="p-6 md:p-8 border-b border-slate-50 flex items-start gap-5 bg-slate-50/30">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-4 border-white shadow-xl bg-white flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                    {lawyer.lawyerProfile?.photoUrl ? (
                      <img src={lawyer.lawyerProfile.photoUrl} className="w-full h-full object-cover" alt={lawyer.firstName} />
                    ) : (
                      <User className="text-slate-200" size={32} />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight group-hover:text-blue-700 transition-colors truncate">
                      {lawyer.firstName} {lawyer.lastName}
                    </h3>
                    <p className="text-xs md:text-sm text-blue-600 font-black uppercase tracking-tighter mt-1 truncate">
                      {lawyer.lawyerProfile?.lawyerType || "Advocate"}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
                      <ShieldCheck size={14} className="text-green-500" /> 
                      <span>Verified • {lawyer.lawyerProfile?.barCouncilId}</span>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 md:p-8 flex-1 flex flex-col gap-6">
                  <div className="flex flex-wrap gap-2">{renderSpecialties(lawyer.lawyerProfile?.practiceAreas)}</div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 text-sm text-slate-600 font-semibold">
                      <MapPin size={18} className="text-slate-400 mt-0.5 shrink-0" />
                      <span className="line-clamp-1">{lawyer.lawyerProfile?.chamberAddress || "Bangladesh"}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-600 font-semibold">
                      <Briefcase size={18} className="text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{lawyer.lawyerProfile?.currentWorkplace || "Private Practice"}</span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="bg-slate-900 p-5 md:p-6 flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Hourly Rate</span>
                    <span className="text-lg md:text-xl font-black text-white tracking-tighter">৳{lawyer.lawyerProfile?.hourlyRate || "N/A"}</span>
                  </div>
                  
                  <Link href={`/dashboard/client/lawyers/${lawyer.id}`}>
                    <button className="bg-blue-600 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition-all flex items-center gap-2 group/btn">
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