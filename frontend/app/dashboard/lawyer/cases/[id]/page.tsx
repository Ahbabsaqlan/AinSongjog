"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";
import { User, MapPin, Phone, CreditCard, Hash, Save } from "lucide-react";

export default function LawyerCaseDetail() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const fetchCase = async () => {
    try {
      const res = await api.get(`/cases/${id}`);
      setCaseData(res.data);
      setStatus(res.data.status);
    } catch (error) {
      toast.error("Failed to load case");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) fetchCase(); }, [id]);

  const handleStatusUpdate = async () => {
    try {
      await api.patch(`/cases/${id}/status`, { status });
      toast.success("Case status updated");
      fetchCase(); // Refresh data
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!caseData) return <div className="p-8 text-center text-red-500">Case not found</div>;

  const { client } = caseData;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{caseData.title}</h1>
          <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
            <Hash size={14} />
            <span>{caseData.caseNumber}</span>
          </div>
        </div>

        {/* Status Updater */}
        <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-600 pl-2">Status:</span>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="bg-white border border-gray-300 text-sm rounded p-1.5 focus:ring-blue-500 outline-none"
          >
            <option value="OPEN">OPEN</option>
            <option value="PENDING">PENDING</option>
            <option value="CLOSED">CLOSED</option>
          </select>
          <button 
            onClick={handleStatusUpdate}
            className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700"
            title="Save Status"
          >
            <Save size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Client Profile Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                {client.clientProfile?.photoUrl ? (
                  <img src={client.clientProfile.photoUrl} className="w-full h-full rounded-full object-cover" />
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
                <span>{client.clientProfile?.mobileNumber || "No mobile"}</span>
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

        {/* Right: Case Notes (Future Feature Placeholder) */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full">
            <h3 className="font-bold text-gray-800 mb-4">Case Notes & Documents</h3>
            <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
              <p>Document Vault coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}