"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [pendingLawyers, setPendingLawyers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const res = await api.get("/admin/pending-lawyers");
      setPendingLawyers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load pending lawyers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await api.patch(`/admin/approve-lawyer/${id}`);
      toast.success("Lawyer Approved Successfully");
      // Remove from list locally
      setPendingLawyers((prev) => prev.filter((l) => l.id !== id));
    } catch (error) {
      toast.error("Failed to approve lawyer");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Pending Approvals</h1>
      
      {pendingLawyers.length === 0 ? (
        <div className="p-8 bg-white rounded shadow text-center text-gray-500">
          No pending approvals found.
        </div>
      ) : (
        <div className="grid gap-4">
          {pendingLawyers.map((lawyer) => (
            <div key={lawyer.id} className="bg-white p-6 rounded-lg shadow-sm border flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{lawyer.firstName} {lawyer.lastName}</h3>
                <p className="text-gray-500 text-sm">{lawyer.email}</p>
                <div className="mt-2 text-sm">
                  <span className="font-medium text-gray-700">Bar Council ID: </span>
                  {/* Handle case where profile might be null */}
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                    {lawyer.lawyerProfile?.barCouncilId || "Not Provided"}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleApprove(lawyer.id)}
                  className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  <CheckCircle size={18} />
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}