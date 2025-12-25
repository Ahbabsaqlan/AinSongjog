"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "@/lib/axios";
import { toast } from "sonner";
import { Plus, FolderOpen, User, Hash, X } from "lucide-react";

// Types
interface Case {
  id: string;
  title: string;
  caseNumber: string;
  status: "OPEN" | "CLOSED" | "PENDING";
  client: {
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
}

type CreateCaseForm = {
  title: string;
  caseNumber: string;
  clientEmail: string;
};

export default function LawyerCasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form handling
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<CreateCaseForm>();

  // Fetch Cases
  const fetchCases = async () => {
    try {
      const res = await api.get("/cases");
      setCases(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  // Create Case Handler
  const onCreateSubmit = async (data: CreateCaseForm) => {
    try {
      await api.post("/cases", data);
      toast.success("Case Created Successfully");
      setShowCreateModal(false);
      reset();
      fetchCases(); // Refresh list
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to create case";
      toast.error(msg);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Cases</h1>
          <p className="text-gray-500">Manage your active legal cases and client assignments.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-sm"
        >
          <Plus size={20} />
          Create New Case
        </button>
      </div>

      {/* Case List */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">Loading cases...</div>
      ) : cases.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Cases Found</h3>
          <p className="text-gray-500">You haven't created any cases yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-blue-50 text-blue-700 p-2 rounded-lg">
                  <FolderOpen size={24} />
                </div>
                <span className={`text-xs font-bold px-2 py-1 rounded ${
                  c.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {c.status}
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-gray-800 mb-1">{c.title}</h3>
              <div className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                <Hash size={14} />
                {c.caseNumber}
              </div>

              <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Client Details</p>
                <div className="flex items-center gap-2">
                  <div className="bg-gray-200 p-1.5 rounded-full">
                    <User size={16} className="text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{c.client.firstName} {c.client.lastName}</p>
                    <p className="text-xs text-gray-500">{c.client.email}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Simple Create Modal Overlay */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="font-bold text-lg">New Case Assignment</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onCreateSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Case Title</label>
                <input {...register("title", { required: true })} className="w-full border p-2 rounded" placeholder="e.g. Land Dispute - Mirpur" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Case Number / Reference</label>
                <input {...register("caseNumber", { required: true })} className="w-full border p-2 rounded" placeholder="e.g. CS-2024-001" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Client Email</label>
                <input {...register("clientEmail", { required: true })} type="email" className="w-full border p-2 rounded" placeholder="client@example.com" />
                <p className="text-xs text-gray-500 mt-1">Must be a registered client email.</p>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 mt-2"
              >
                {isSubmitting ? "Creating..." : "Create Case"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}