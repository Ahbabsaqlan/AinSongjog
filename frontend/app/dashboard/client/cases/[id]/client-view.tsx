"use client"; // This component handles interactivity

import { Briefcase, MapPin, Phone, Hash } from "lucide-react";

// Receive data directly as props (No useState/useEffect for fetching!)
export default function ClientCaseView({ caseData }: { caseData: any }) {
  const { lawyer } = caseData;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{caseData.title}</h1>
            <div className="flex items-center gap-2 text-gray-500">
              <Hash size={16} />
              <span className="font-mono">{caseData.caseNumber}</span>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-bold ${
            caseData.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {caseData.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Case Info */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-bold text-gray-800 mb-4 border-b pb-2">Case Description</h3>
            <p className="text-gray-600 leading-relaxed">
              {caseData.description || "No description provided."}
            </p>
          </div>
        </div>

        {/* Right: Lawyer Details */}
        <div className="md:col-span-1">
          <div className="bg-slate-900 text-white p-6 rounded-lg shadow-lg">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-400" />
              Your Lawyer
            </h3>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-xl font-bold">
                {lawyer.firstName[0]}
              </div>
              <div>
                <p className="font-semibold">{lawyer.firstName} {lawyer.lastName}</p>
                <p className="text-xs text-gray-400">{lawyer.email}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-1 shrink-0" />
                <p>{lawyer.lawyerProfile?.chamberAddress || "Address not listed"}</p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} />
                <p>{lawyer.lawyerProfile?.mobileNumber || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}