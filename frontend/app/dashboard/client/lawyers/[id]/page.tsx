"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";
import { 
  User, MapPin, Phone, Mail, Scale, 
  Briefcase, GraduationCap, ShieldCheck, Calendar, X 
} from "lucide-react";

export default function LawyerProfileView() {
  const { id } = useParams();
  const [lawyer, setLawyer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  useEffect(() => {
    const fetchLawyer = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res = await api.get(`/users/${id}`);
        setLawyer(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load lawyer profile");
      } finally {
        setLoading(false);
      }
    };
    fetchLawyer();
  }, [id]);


  if (loading) return <div className="p-10 text-center text-slate-500">Loading Profile...</div>;
  if (!lawyer) return <div className="p-10 text-center text-red-500">Lawyer not found</div>;

  const { lawyerProfile } = lawyer;

  const renderTags = (tagsString: string) => {
    if (!tagsString) return <span className="text-slate-400 italic">Not listed.</span>;
    return tagsString.split(',').map((tag, idx) => (
      <span key={idx} className="inline-block bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold mr-2 mb-2 border border-slate-200">
        {tag.trim()}
      </span>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      
      {/* 1. HEADER CARD */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 relative">
          <div className="absolute top-4 right-4">
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                <ShieldCheck size={14} /> Verified Practitioner
             </span>
          </div>
        </div>

        {/* --- MODIFICATION: Refactored content area for centered mobile view --- */}
        <div className="relative flex flex-col items-center px-4 sm:px-6 pb-6">
          {/* Avatar */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 -mt-16 rounded-2xl border-[6px] border-white bg-slate-100 shadow-lg overflow-hidden shrink-0 z-10">
            {lawyerProfile?.photoUrl ? (
              <img src={lawyerProfile.photoUrl} alt={`${lawyer.firstName} ${lawyer.lastName}`} className="w-full h-full object-cover" />
            ) : <User className="w-full h-full p-6 text-slate-300" />}
          </div>
          
          {/* Name */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-4 text-center">{lawyer.firstName} {lawyer.lastName}</h1>
          
          {/* Info Details */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mt-3">
            <span className="text-sm text-blue-600 font-bold bg-blue-50 px-3 py-1 rounded-md">
              {lawyerProfile?.lawyerType || "Advocate"}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
              <MapPin size={16} className="text-slate-400"/> 
              {lawyerProfile?.currentWorkplace || "Dhaka Court"}
            </span>
            <span className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
              <Scale size={16} className="text-slate-400"/> 
              {lawyerProfile?.barCouncilId || "ID Hidden"}
            </span>
          </div>

          {/* Action Button */}
          <div className="w-full max-w-xs mt-6">
            <button 
              onClick={() => setIsBookingOpen(true)}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
                <Calendar size={18} />
                Book Appointment
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT: Info Sidebar */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Contact Info</h3>
                <div className="space-y-5">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600"><Phone size={20}/></div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase">Mobile</p>
                          <span className="text-sm font-semibold text-slate-700 break-all">{lawyerProfile?.mobileNumber || "N/A"}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600"><Mail size={20}/></div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase">Email</p>
                          <span className="text-sm font-semibold text-slate-700 break-all">{lawyer.email}</span>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-50 p-2.5 rounded-lg text-blue-600"><MapPin size={20}/></div>
                        <div>
                          <p className="text-xs text-slate-400 font-bold uppercase">Chamber</p>
                          <span className="text-sm font-semibold text-slate-700 leading-snug">{lawyerProfile?.chamberAddress || "N/A"}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Consultation</h3>
                <div className="text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-slate-500 text-xs font-bold uppercase mb-2">Hourly Rate</p>
                    <p className="text-3xl font-extrabold text-slate-900">৳{lawyerProfile?.hourlyRate || 'N/A'}</p>
                </div>
            </div>
        </div>

        {/* RIGHT: Main Details */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <User size={22} className="text-blue-600" /> About
                </h3>
                <p className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base">
                    {lawyerProfile?.bio || "No professional bio available."}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Briefcase size={18} className="text-blue-500" /> Practice Areas
                    </h3>
                    <div className="flex flex-wrap">
                        {renderTags(lawyerProfile?.practiceAreas)}
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <GraduationCap size={18} className="text-blue-500" /> Education
                    </h3>
                    <p className="text-slate-700 font-medium leading-relaxed">
                        {lawyerProfile?.educationalBackground || "Not listed"}
                    </p>
                </div>
            </div>
        </div>
      </div>

      {isBookingOpen && (
        <BookingModal 
          lawyerId={lawyer.id} 
          lawyerName={`${lawyer.firstName} ${lawyer.lastName}`}
          onClose={() => setIsBookingOpen(false)} 
        />
      )}
    </div>
  );
}

// --- SUB-COMPONENT: BOOKING MODAL ---
function BookingModal({ lawyerId, lawyerName, onClose }: any) {
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/appointments/book', { lawyerId, date });
      toast.success("Appointment Request Sent!");
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-slate-800">Book Appointment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleBook} className="p-6 space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <p className="text-xs text-blue-600 font-bold uppercase mb-1">Lawyer</p>
            <p className="font-bold text-slate-900">{lawyerName}</p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Date & Time</label>
            <input 
              type="datetime-local" 
              required 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700" 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-70 mt-4"
          >
            {loading ? "Booking..." : "Confirm Booking"}
          </button>
        </form>
      </div>
    </div>
  )
}