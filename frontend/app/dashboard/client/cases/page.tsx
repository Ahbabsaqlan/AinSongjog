"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "sonner";
import { FileText, Gavel, User, Calendar, Clock, ChevronRight } from "lucide-react";

// Define the shape of the Case data for a Client
interface Case {
  id: string;
  title: string;
  caseNumber: string;
  status: "OPEN" | "CLOSED" | "PENDING";
  createdAt: string;
  lawyer: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function ClientCasesPage() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCases = async () => {
    try {
      const res = await api.get("/cases");
      setCases(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, []);

  return (
    // --- MODIFICATION: Added responsive padding ---
    <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 border-b pb-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-blue-600" />
          My Legal Cases
        </h1>
        <p className="text-gray-500 mt-1">
          Track the status of cases managed by your lawyers.
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p>Loading case files...</p>
        </div>
      ) : cases.length === 0 ? (
        // Empty State
        <div className="text-center py-16 px-4 bg-white rounded-lg border border-dashed border-gray-300">
          <Gavel size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Active Cases</h3>
          <p className="text-gray-500 max-w-sm mx-auto mt-2">
            You don't have any cases assigned to you yet. Lawyers can add you to cases using your email address.
          </p>
        </div>
      ) : (
        // Case List
        <div className="grid gap-6">
          {cases.map((c) => (
            <Link 
              key={c.id} 
              href={`/dashboard/client/cases/${c.id}`}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group-hover:shadow-md group-hover:border-blue-300 transition duration-200">
                <div className="p-4 sm:p-6">
                  {/* --- MODIFICATION: Stacks on mobile, row on sm+ --- */}
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {c.title}
                      </h3>
                      <p className="text-sm text-gray-500 font-mono mt-1">Ref: {c.caseNumber}</p>
                    </div>
                    <div className="shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                        c.status === 'OPEN' ? 'bg-green-100 text-green-700' :
                        c.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                    {/* Assigned Lawyer Info */}
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-2">Assigned Lawyer</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 truncate">{c.lawyer.firstName} {c.lawyer.lastName}</p>
                          <p className="text-sm text-gray-500 truncate">{c.lawyer.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline Info */}
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-bold mb-2">Timeline</p>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-blue-500" />
                          <span>Started: {new Date(c.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-orange-500" />
                          <span>Last Update: Recently</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Footer / Action */}
                {/* --- MODIFICATION: Stacks and centers on mobile --- */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left group-hover:bg-blue-50 transition-colors">
                  <span className="text-xs text-gray-500">Secure Digital Vault enabled</span>
                  <span className="text-sm text-blue-600 font-medium flex items-center gap-1">
                    View Details <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}