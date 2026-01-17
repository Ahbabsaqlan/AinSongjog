"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { 
  Calendar, Clock, User, MapPin, AlertCircle, 
  CheckCircle2, XCircle, Edit2, Check, Hourglass
} from "lucide-react";

export default function LawyerAppointments() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); 
  
  // Reschedule Modal State
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

    // Listen for Pusher events triggered by the notification component
    const handleRefresh = () => fetchAppointments();
    window.addEventListener("refresh-data", handleRefresh);

    return () => window.removeEventListener("refresh-data", handleRefresh);
  }, []);

  // --- ACTIONS ---

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
    try {
      // This sets status to PROPOSED_BY_LAWYER
      await api.patch(`/appointments/${rescheduleData.id}/reschedule`, { date: newDate });
      toast.success("New time proposed to client");
      setRescheduleData(null);
      fetchAppointments();
    } catch (error) { toast.error("Failed to reschedule"); }
  };

  // --- FILTER LOGIC ---
  const filtered = appointments.filter(a => {
    if (filter === "ALL") return a.status !== 'CANCELLED';
    if (filter === "PENDING") return a.status === 'PENDING'; // Needs my attention
    if (filter === "CONFIRMED") return a.status === 'CONFIRMED';
    return true;
  });

  if (loading) return <div className="p-8 text-center">Loading schedule...</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Client Appointments</h1>
          <p className="text-slate-500 mt-1">Manage consultation requests and your schedule.</p>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['ALL', 'PENDING', 'CONFIRMED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${
                filter === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f === 'PENDING' ? 'New Requests' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((apt) => (
          <div key={apt.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition">
            
            {/* Top Row: Client Info & Status */}
            <div className="flex flex-col md:flex-row justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                  {apt.client.clientProfile?.photoUrl ? (
                    <img src={apt.client.clientProfile.photoUrl} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-slate-400" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{apt.client.firstName} {apt.client.lastName}</h3>
                  <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                    <span className="flex items-center gap-1 font-medium text-slate-700">{apt.client.email}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><MapPin size={14} /> {apt.client.clientProfile?.address || "Location N/A"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 md:mt-0">
                <StatusBadge status={apt.status} />
              </div>
            </div>

            {/* Middle Row: Date & Time */}
            <div className={`p-4 rounded-lg border ${
              apt.status === 'PENDING' ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-100'
            } mb-6 flex flex-col md:flex-row gap-6 items-center`}>
              
              <div className="flex items-center gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-blue-600">
                  <Calendar size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Requested Date</p>
                  <p className="text-slate-900 font-bold">{new Date(apt.scheduleDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-blue-600">
                  <Clock size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Time</p>
                  <p className="text-slate-900 font-bold">{new Date(apt.scheduleDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>

              {/* Waiting Indicator */}
              {apt.status === 'PROPOSED_BY_LAWYER' && (
                <div className="flex-1 text-right md:pr-4">
                  <p className="text-sm font-bold text-slate-500 flex items-center justify-end gap-2">
                    <Hourglass size={16} /> Waiting for client approval...
                  </p>
                </div>
              )}
            </div>

            {/* Bottom Row: Actions */}
            <div className="flex flex-wrap gap-3 justify-end pt-4 border-t border-slate-100">
              
              {/* If Client Requested (PENDING) -> Show Confirm Button */}
              {apt.status === 'PENDING' && (
                <button 
                  onClick={() => handleConfirm(apt.id)}
                  className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/10"
                >
                  <Check size={18} /> Confirm Request
                </button>
              )}

              {/* Reschedule Button (Available unless confirmed/cancelled) */}
              {apt.status !== 'CONFIRMED' && apt.status !== 'CANCELLED' && apt.status !== 'PROPOSED_BY_LAWYER' && (
                <button 
                  onClick={() => {
                    setRescheduleData(apt);
                    setNewDate(new Date(apt.scheduleDate).toISOString().slice(0, 16));
                  }}
                  className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-lg font-bold hover:bg-slate-50 transition"
                >
                  <Edit2 size={16} /> Propose New Time
                </button>
              )}

              {/* Cancel / Decline */}
              {apt.status !== 'CANCELLED' && (
                <button 
                  onClick={() => handleCancel(apt.id)}
                  className="flex items-center gap-2 text-red-500 px-4 py-2.5 rounded-lg font-bold hover:bg-red-50 transition"
                >
                  <XCircle size={18} /> {apt.status === 'PENDING' ? 'Decline' : 'Cancel'}
                </button>
              )}
            </div>

          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400 italic">No appointments found.</div>
        )}
      </div>

      {/* RESCHEDULE MODAL */}
      {rescheduleData && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95">
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">Propose New Time</h3>
            <p className="text-slate-500 text-sm mb-6">
              The client will be notified to accept this change.
            </p>
            
            <form onSubmit={handleRescheduleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Select Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setRescheduleData(null)} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition">
                  Cancel
                </button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-900/20">
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Helper for Badge
function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: "bg-blue-100 text-blue-800 border-blue-200",
    PROPOSED_BY_LAWYER: "bg-slate-100 text-slate-600 border-slate-200",
    CONFIRMED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-50 text-red-500 border-red-100",
  };

  const labels = {
    PENDING: "Action Required",
    PROPOSED_BY_LAWYER: "Proposal Sent",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
  };

  // @ts-ignore
  const style = styles[status] || styles.PENDING;
  // @ts-ignore
  const label = labels[status] || status;

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${style} flex items-center gap-1.5 w-fit`}>
      {status === 'CONFIRMED' && <CheckCircle2 size={12} />}
      {status === 'PENDING' && <AlertCircle size={12} />}
      {label}
    </span>
  );
}