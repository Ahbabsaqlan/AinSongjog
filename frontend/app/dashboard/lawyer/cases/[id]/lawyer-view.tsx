"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { User, MapPin, Phone, CreditCard, Hash, Save, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Receive the server-fetched data as a prop
export default function LawyerCaseView({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [caseData, setCaseData] = useState(initialData);
  const [status, setStatus] = useState(initialData.status);
  const [isUpdating, setIsUpdating] = useState(false);

  const { client } = caseData;

  const handleStatusUpdate = async () => {
    setIsUpdating(true);
    try {
      await api.patch(`/cases/${caseData.id}/status`, { status });
      toast.success("Case status updated successfully");
      router.refresh(); // Refreshes the server components to reflect changes
    } catch (error) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{caseData.title}</h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
            <Hash size={14} />
            <span className="font-mono">{caseData.caseNumber}</span>
          </div>
        </div>

        {/* Status Updater */}
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-600 pl-2">Status:</span>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white border border-gray-300 text-sm rounded p-1.5 focus:ring-blue-500 outline-none cursor-pointer"
          >
            <option value="OPEN">OPEN</option>
            <option value="PENDING">PENDING</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <button 
            onClick={handleStatusUpdate}
            disabled={isUpdating}
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
            title="Save Status"
          >
            {isUpdating ? <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> : <Save size={16} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Client Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-gray-400 text-xs font-bold uppercase mb-4 tracking-wider">Client Information</h3>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3 overflow-hidden border-2 border-white shadow-sm">
                {client.clientProfile?.photoUrl ? (
                  <img src={client.clientProfile.photoUrl} className="w-full h-full object-cover" alt="Client" />
                ) : (
                  <User size={40} />
                )}
              </div>
              <h3 className="font-bold text-gray-800 text-lg">{client.firstName} {client.lastName}</h3>
              <p className="text-sm text-gray-500">{client.email}</p>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3 text-gray-600 border-b border-gray-100 pb-3">
                <Phone size={16} className="text-blue-500" />
                <span>{client.clientProfile?.mobileNumber || "No mobile provided"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 border-b border-gray-100 pb-3">
                <CreditCard size={16} className="text-purple-500" />
                <span>NID: {client.clientProfile?.nid || "Not verified"}</span>
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin size={16} className="text-red-500 mt-0.5" />
                <span>{client.clientProfile?.address || "Address not provided"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Case Details */}
        <div className="md:col-span-2 space-y-6">
           {/* Description Box */}
           <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {caseData.description || "No description provided."}
            </p>
          </div>

          {/* Placeholder for future features */}
          <div className="bg-gray-50 p-6 rounded-lg border border-dashed border-gray-300 text-center text-gray-500">
            <AlertCircle className="mx-auto mb-2 text-gray-400" />
            <p>Document Upload & Hearing Dates coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}