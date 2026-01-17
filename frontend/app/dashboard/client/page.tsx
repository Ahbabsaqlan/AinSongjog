"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Search, MapPin, Briefcase, Clock, CalendarCheck } from "lucide-react";
import { toast } from "sonner";
import BookingModal from "@/components/appointments/booking-modal";

// Define the shape of the data we expect from the backend
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
  };
}

export default function ClientDashboard() {
  const [query, setQuery] = useState("");
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState<Lawyer | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Function to fetch lawyers
  const fetchLawyers = async (searchQuery: string = "") => {
    setLoading(true);
    try {
      // Calls the backend: GET /users/lawyers/search?query=...
      const res = await api.get(`/users/lawyers/search?query=${searchQuery}`);
      setLawyers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch lawyers");
    } finally {
      setLoading(false);
    }
  };

  // Fetch initial list on load
  useEffect(() => {
    fetchLawyers();
  }, []);

  // Handle Search Input (with a simple debounce effect)
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLawyers(query);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  return (
    <div className="space-y-6">
      {/* Header & Search Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Find Legal Help</h1>
        <p className="text-gray-500 mb-6">Connect with verified legal professionals in your area.</p>

        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, specialization, or location (e.g. 'Dhaka', 'Property')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
          />
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Searching ecosystem...</div>
      ) : lawyers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500">No active lawyers found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawyers.map((lawyer) => (
            <div key={lawyer.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
              <div className="p-6">
                {/* Header: Name & Bar ID */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {lawyer.firstName} {lawyer.lastName}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium mt-1">
                      <Briefcase size={12} />
                      <span>{lawyer.lawyerProfile?.barCouncilId || "Verified Lawyer"}</span>
                    </div>
                  </div>
                  <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded">
                    Active
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5 text-gray-400" />
                    <span>{lawyer.lawyerProfile?.chamberAddress || "Online Consultation"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>Rate: <span className="font-semibold text-gray-900">{lawyer.lawyerProfile?.hourlyRate || "N/A"} BDT/hr</span></span>
                  </div>
                  <p className="text-gray-500 italic line-clamp-2 h-10">
                    "{lawyer.lawyerProfile?.bio || "No bio available."}"
                  </p>
                </div>

                {/* Action Button */}
                <button 
                  onClick={() => {
                    setSelectedLawyer(lawyer);
                    setIsBookingModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-2.5 rounded-lg font-medium hover:bg-slate-800 transition"
                >
                  <CalendarCheck size={18} />
                  Book Appointment
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedLawyer && (
        <BookingModal
          lawyerId={selectedLawyer.id}
          lawyerName={`${selectedLawyer.firstName} ${selectedLawyer.lastName}`}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedLawyer(null);
          }}
        />
      )}
    </div>
  );
}