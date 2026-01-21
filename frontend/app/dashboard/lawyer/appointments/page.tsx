"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { 
  Calendar, Clock, User, MapPin, AlertCircle, 
  CheckCircle2, XCircle, Edit2, Check, Hourglass,
  X
} from "lucide-react";

export default function LawyerAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); 
  
  const [rescheduleData, setRescheduleData] = useState<any>(null);
  const [newDate, setNewDate] = useState("");

  const fetchAppointments = async () => {
    try {
      const res = await api.get("/appointments");
      setAppointments(res.data);
    } catch (error) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
    const handleRefresh = () => fetchAppointments();
    window.addEventListener("refresh-data", handleRefresh);
    return () => window.removeEventListener("refresh-data", handleRefresh);
  }, []);

  const handleConfirm = async (id: string) => {
    try {
      await api.patch(`/appointments/${id}/confirm`);
      toast.success("Appointment Confirmed!");
      fetchAppointments();
    } catch (error) { toast.error("Failed to confirm"); }
  };

  const handleCancel = async (id: string) => {
    if(!confirm("Are you sure you want to decline this appointment?")) return;
    try {
      await api.patch(`/appointments/${id}/cancel`);
      toast.success("Appointment cancelled");
      fetchAppointments();
    } catch (error) { toast.error("Failed to cancel"); }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleData) return;
    try {
      await api.patch(`/appointments/${rescheduleData.id}/reschedule`, { date: newDate });
      toast.success("New time proposed to client");
      setRescheduleData(null);
      fetchAppointments();
    } catch (error) { toast.error("Failed to reschedule"); }
  };

  const filtered = appointments.filter(a => {
    if (filter === "ALL") return a.status !== 'CANCELLED';
    if (filter === "PENDING") return a.status === 'PENDING';
    if (filter === "CONFIRMED") return a.status === 'CONFIRMED';
    return true;
  });

  if (loading) return (
    <div className="flex h-[60vh] w-full items-center justify-center">
       <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 md:space-y-8 px-2 sm:px-4 md:px-0 pb-12">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Client Appointments</h1>
          <p className="text-slate-500 text-sm md:text-base mt-1">Manage consultation requests and your professional schedule.</p>
        </div>
        
        {/* Responsive Filter Tabs */}
        <div className="flex bg-slate-200/50 p-1 rounded-xl w-full lg:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'CONFIRMED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 md:flex-initial whitespace-nowrap px-4 md:px-6 py-2 rounded-lg text-xs md:text-sm font-bold transition-all ${
                filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'PENDING' ? 'New Requests' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-4 md:space-y-6">
        {filtered.map((apt) => (
          <div key={apt.id} className="bg-white rounded-2xl border border-slate-200 p-5 md:p-8 shadow-sm hover:shadow-md transition-all duration-300">
            
            {/* Top Section: Client Branding */}
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-white shadow-sm overflow-hidden shrink-0">
                  {apt.client.clientProfile?.photoUrl ? (
                    <img src={apt.client.clientProfile.photoUrl} className="w-full h-full object-cover" alt="Client" />
                  ) : (
                    <User size={28} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg md:text-xl font-black text-slate-900 truncate">
                    {apt.client.firstName} {apt.client.lastName}
                  </h3>
                  <div className="flex flex-col md:flex-row md:items-center gap-x-3 text-sm text-slate-500 mt-1">
                    <span className="font-bold text-blue-600 truncate">{apt.client.email}</span>
                    <span className="hidden md:inline text-slate-300">|</span>
                    <span className="flex items-center gap-1 truncate"><MapPin size={14} className="shrink-0" /> {apt.client.clientProfile?.address || "Location N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="self-end sm:self-start">
                <StatusBadge status={apt.status} />
              </div>
            </div>

            {/* Middle Section: Time Selection Visual */}
            <div className={`p-4 md:p-6 rounded-2xl border ${
              apt.status === 'PENDING' ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-200/60'
            } mb-6 grid grid-cols-1 md:grid-cols-2 gap-6`}>
              
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm text-blue-600 border border-slate-100">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Requested Date</p>
                  <p className="text-slate-900 font-bold text-sm md:text-base">
                    {new Date(apt.scheduleDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm text-blue-600 border border-slate-100">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Time Slot</p>
                  <p className="text-slate-900 font-bold text-sm md:text-base">
                    {new Date(apt.scheduleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {apt.status === 'PROPOSED_BY_LAWYER' && (
                <div className="md:col-span-2 pt-2 border-t border-slate-200 mt-2">
                  <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                    <Hourglass size={16} className="text-blue-500" /> Waiting for client to confirm your proposed time change.
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Section: Actions */}
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-end pt-4 border-t border-slate-100">
              
              {apt.status === 'PENDING' && (
                <button 
                  onClick={() => handleConfirm(apt.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
                >
                  <Check size={16} /> Confirm
                </button>
              )}

              {apt.status !== 'CONFIRMED' && apt.status !== 'CANCELLED' && apt.status !== 'PROPOSED_BY_LAWYER' && (
                <button 
                  onClick={() => {
                    setRescheduleData(apt);
                    setNewDate(new Date(apt.scheduleDate).toISOString().slice(0, 16));
                  }}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition"
                >
                  <Edit2 size={16} /> Reschedule
                </button>
              )}

              {apt.status !== 'CANCELLED' && (
                <button 
                  onClick={() => handleCancel(apt.id)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 text-red-500 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-red-50 transition"
                >
                  <XCircle size={16} /> {apt.status === 'PENDING' ? 'Decline' : 'Cancel'}
                </button>
              )}
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
             <Calendar size={48} className="mx-auto text-slate-200 mb-4" />
             <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No Appointments Found</p>
          </div>
        )}
      </div>

      {/* RESCHEDULE MODAL */}
      {rescheduleData && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
               <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Propose New Time</h3>
                  <p className="text-slate-500 text-sm mt-1 font-medium">The client will be notified to review this.</p>
               </div>
               <button onClick={() => setRescheduleData(null)} className="p-2 hover:bg-slate-100 rounded-full transition">
                  <X size={20} className="text-slate-400" />
               </button>
            </div>
            
            <form onSubmit={handleRescheduleSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">New Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border border-slate-300 p-4 rounded-2xl focus:ring-2 focus:ring-blue-600 outline-none font-bold text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-3">
                <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition shadow-xl shadow-blue-600/30">
                  Send Proposal
                </button>
                <button type="button" onClick={() => setRescheduleData(null)} className="w-full py-3 text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-600 transition">
                  Go Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Sub-component: Status Badge
function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PENDING: "bg-blue-600 text-white border-transparent",
    PROPOSED_BY_LAWYER: "bg-amber-100 text-amber-800 border-amber-200",
    CONFIRMED: "bg-emerald-100 text-emerald-800 border-emerald-200",
    CANCELLED: "bg-slate-100 text-slate-500 border-slate-200",
  };

  const labels: any = {
    PENDING: "ACTION REQUIRED",
    PROPOSED_BY_LAWYER: "PROPOSAL SENT",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
  };

  const iconStyles = "shrink-0";
  const icons: any = {
    PENDING: <AlertCircle size={14} className={iconStyles} />,
    PROPOSED_BY_LAWYER: <Hourglass size={14} className={iconStyles} />,
    CONFIRMED: <CheckCircle2 size={14} className={iconStyles} />,
    CANCELLED: <XCircle size={14} className={iconStyles} />,
  }

  const style = styles[status] || styles.PENDING;
  const label = labels[status] || status;
  const icon = icons[status];

  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border ${style} inline-flex items-center gap-2 shadow-sm tracking-widest`}>
      {icon}
      {label}
    </span>
  );
}