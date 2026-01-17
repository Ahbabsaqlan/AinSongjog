"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Calendar, Clock, User, X, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface Appointment {
  id: string;
  scheduleDate: string;
  status: "PENDING" | "CONFIRMED" | "REJECTED" | "CANCELLED";
  createdAt: string;
  lawyer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    lawyerProfile?: {
      chamberAddress: string;
      mobileNumber: string;
      barCouncilId: string;
    };
  };
}

export default function ClientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const fetchAppointments = async () => {
    try {
      const url = statusFilter
        ? `/appointments?status=${statusFilter}`
        : "/appointments";
      const res = await api.get(url);
      setAppointments(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const handleCancel = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await api.delete(`/appointments/${appointmentId}`);
      toast.success("Appointment cancelled successfully");
      fetchAppointments(); // Refresh list
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to cancel appointment");
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-700 border-yellow-300",
      CONFIRMED: "bg-green-100 text-green-700 border-green-300",
      REJECTED: "bg-red-100 text-red-700 border-red-300",
      CANCELLED: "bg-gray-100 text-gray-700 border-gray-300",
    };

    const icons = {
      PENDING: <Clock size={14} />,
      CONFIRMED: <CheckCircle size={14} />,
      REJECTED: <XCircle size={14} />,
      CANCELLED: <X size={14} />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
          styles[status as keyof typeof styles] || styles.PENDING
        }`}
      >
        {icons[status as keyof typeof icons]}
        {status}
      </span>
    );
  };

  const canCancel = (status: string) => {
    return status === "PENDING" || status === "CONFIRMED";
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Calendar className="text-blue-600" />
          My Appointments
        </h1>
        <p className="text-gray-500 mt-1">
          View and manage your scheduled consultations with lawyers.
        </p>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setStatusFilter("")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === ""
              ? "bg-slate-900 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setStatusFilter("PENDING")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === "PENDING"
              ? "bg-yellow-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Pending
        </button>
        <button
          onClick={() => setStatusFilter("CONFIRMED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === "CONFIRMED"
              ? "bg-green-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Confirmed
        </button>
        <button
          onClick={() => setStatusFilter("CANCELLED")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === "CANCELLED"
              ? "bg-gray-600 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p>Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        // Empty State
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Appointments Found</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            {statusFilter
              ? `You don't have any ${statusFilter.toLowerCase()} appointments.`
              : "You haven't booked any appointments yet. Search for lawyers and book a consultation."}
          </p>
        </div>
      ) : (
        // Appointment List
        <div className="grid gap-6">
          {appointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                      Consultation with {apt.lawyer.firstName} {apt.lawyer.lastName}
                    </h3>
                    {apt.lawyer.lawyerProfile?.barCouncilId && (
                      <p className="text-sm text-gray-500">
                        Bar Council ID: {apt.lawyer.lawyerProfile.barCouncilId}
                      </p>
                    )}
                  </div>
                  {getStatusBadge(apt.status)}
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                  {/* Lawyer Info */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold mb-2">
                      Lawyer Details
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User size={16} className="text-blue-500" />
                        <span>
                          {apt.lawyer.firstName} {apt.lawyer.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">Email:</span>
                        <span>{apt.lawyer.email}</span>
                      </div>
                      {apt.lawyer.lawyerProfile?.mobileNumber && (
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400">Phone:</span>
                          <span>{apt.lawyer.lawyerProfile.mobileNumber}</span>
                        </div>
                      )}
                      {apt.lawyer.lawyerProfile?.chamberAddress && (
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400">Address:</span>
                          <span>{apt.lawyer.lawyerProfile.chamberAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Appointment Info */}
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold mb-2">
                      Appointment Details
                    </p>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-green-500" />
                        <span>
                          {new Date(apt.scheduleDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-orange-500" />
                        <span>
                          {new Date(apt.scheduleDate).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-gray-400" />
                        <span>
                          Booked: {new Date(apt.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer / Actions */}
              {canCancel(apt.status) && (
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
                  <button
                    onClick={() => handleCancel(apt.id)}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg font-medium hover:bg-red-100 transition text-sm flex items-center gap-2"
                  >
                    <X size={16} />
                    Cancel Appointment
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
