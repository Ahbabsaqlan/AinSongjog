"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import { toast } from "sonner";
import { 
  Briefcase, MapPin, Phone, 
  Calendar, Clock, Map, Plus, X,
  FileText, Image as ImageIcon, File, Download, 
  ShieldCheck, UploadCloud
} from "lucide-react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/ui/file-upload";

// --- HELPER ICONS ---
const getFileIcon = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return <ImageIcon size={14} className="text-purple-600" />;
  if (ext === 'pdf') return <FileText size={14} className="text-red-600" />;
  return <File size={14} className="text-blue-600" />;
};

const getFileName = (url: string) => {
  return url.split('/').pop()?.split('-').slice(1).join('-') || "Document";
};

export default function ClientCaseView({ caseData }: { caseData: any }) {
  const router = useRouter();
  const { lawyer } = caseData;
  
  const [docModalOpen, setDocModalOpen] = useState(false);

  // --- DATA PROCESSING ---
  const events = (caseData.events || []).sort((a: any, b: any) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  const generalDocs = (caseData.documents || []).map((url: string) => ({ url, type: 'General File', date: caseData.updatedAt }));
  const eventDocs = events.flatMap((e: any) => (e.attachments || []).map((url: string) => ({ url, type: e.title, date: e.eventDate })));
  const allDocuments = [...generalDocs, ...eventDocs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // --- UPLOAD HANDLER ---
  const handleGeneralDocUpload = async (url: string) => {
    try {
      await api.patch(`/cases/${caseData.id}/documents`, { url });
      toast.success("Document uploaded successfully");
      setDocModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to upload document");
    }
  };

  return (
    // --- MODIFICATION: Added responsive padding ---
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6 lg:p-8">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-blue-600" />
        {/* --- MODIFICATION: Stacks on mobile, row on md+ --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-1 rounded border border-slate-200 w-fit">
                REF: {caseData.caseNumber}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Calendar size={12} /> Filed: {new Date(caseData.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 break-words">{caseData.title}</h1>
          </div>

          <div className={`px-4 py-2 rounded-lg border flex items-center gap-2 shrink-0 ${
            caseData.status === 'OPEN' ? 'bg-green-50 border-green-200 text-green-700' : 
            caseData.status === 'CLOSED' ? 'bg-slate-100 border-slate-200 text-slate-600' :
            'bg-yellow-50 border-yellow-200 text-yellow-700'
          }`}>
            <div className={`w-2.5 h-2.5 rounded-full ${
              caseData.status === 'OPEN' ? 'bg-green-600 animate-pulse' : 
              caseData.status === 'CLOSED' ? 'bg-slate-500' :
              'bg-yellow-600'
            }`} />
            <span className="text-sm font-bold tracking-wide">{caseData.status} CASE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-4 space-y-6">
          
          <Link href={`/dashboard/client/lawyers/${lawyer.id}`} className="block group">
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm group-hover:shadow-md transition-all group-hover:border-blue-300 cursor-pointer">
              <div className="bg-slate-900 h-24 relative group-hover:bg-blue-900 transition-colors">
                 <div className="absolute top-4 right-4 text-white/20">
                   <Briefcase size={64} />
                 </div>
                 <div className="absolute -bottom-10 left-6">
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 overflow-hidden flex items-center justify-center">
                      {lawyer.lawyerProfile?.photoUrl ? (
                        <img src={lawyer.lawyerProfile.photoUrl} alt={`${lawyer.firstName} ${lawyer.lastName}`} className="w-full h-full object-cover" />
                      ) : <span className="text-2xl font-bold text-slate-400">{lawyer.firstName[0]}</span>}
                    </div>
                 </div>
              </div>
              
              <div className="pt-12 px-6 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{lawyer.firstName} {lawyer.lastName}</h3>
                  <ShieldCheck size={16} className="text-blue-500" />
                </div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">View Profile &rarr;</p>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 text-slate-600">
                    <Phone size={16} className="text-slate-400" />
                    <span className="break-all">{lawyer.lawyerProfile?.mobileNumber || "Not available"}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-600">
                    <MapPin size={16} className="text-slate-400 mt-0.5" />
                    <span className="break-words">{lawyer.lawyerProfile?.chamberAddress || "Chamber address not listed"}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-purple-600" /> 
                Documents
              </h3>
              <button 
                onClick={() => setDocModalOpen(true)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition flex items-center gap-1 text-xs font-bold" 
                title="Upload"
              >
                <Plus size={16} /> ADD
              </button>
            </div>
            
            <div className="space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
              {allDocuments.length > 0 ? (
                allDocuments.map((doc: any, idx: number) => (
                  <a 
                    key={idx} 
                    href={doc.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 hover:border-purple-200 transition group"
                  >
                    <div className="p-2 bg-white rounded-md border border-slate-200 shadow-sm">
                      {getFileIcon(doc.url)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-700 truncate group-hover:text-purple-700">
                        {getFileName(doc.url)}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5 uppercase tracking-wider">
                        {doc.type} • {new Date(doc.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Download size={14} className="text-slate-300 group-hover:text-purple-600" />
                  </a>
                ))
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-lg">
                  <p className="text-sm text-slate-400">No documents yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock size={24} className="text-blue-600" /> Case Timeline
              </h3>
            </div>

            <div className="relative border-l-2 border-slate-100 ml-4 space-y-10">
              {events.length === 0 && <p className="text-slate-400 italic pl-8">No timeline updates yet.</p>}

              {events.map((event: any) => {
                const isUpcoming = new Date(event.eventDate) > new Date();
                return (
                  <div key={event.id} className="relative pl-8 sm:pl-10 group">
                    <div className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm ${isUpcoming ? 'bg-blue-600 animate-pulse ring-4 ring-blue-50' : 'bg-slate-300'}`} />
                    
                    <div className={`rounded-xl border p-4 sm:p-6 transition ${isUpcoming ? 'bg-blue-50/40 border-blue-200' : 'bg-white border-slate-200'}`}>
                      {/* --- MODIFICATION: Stacks on mobile, row on sm+ --- */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <h4 className={`font-bold text-lg ${isUpcoming ? 'text-blue-900' : 'text-slate-800'}`}>{event.title}</h4>
                          {isUpcoming && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shadow-sm">UPCOMING</span>}
                        </div>
                        <div className="text-left sm:text-right shrink-0">
                          <p className="text-sm font-bold text-slate-700">{new Date(event.eventDate).toLocaleDateString()}</p>
                          <p className="text-xs font-medium text-slate-500">{new Date(event.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-2 items-start text-sm text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 w-fit shadow-sm">
                          <Map size={16} className="mt-0.5 text-orange-500 shrink-0" />
                          <span className="font-semibold break-words">{event.location}</span>
                        </div>
                        
                        {event.notes && (
                          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                            "{event.notes}"
                          </p>
                        )}

                        {event.attachments && event.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {event.attachments.map((url: string, idx: number) => (
                              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:border-blue-400 hover:text-blue-700 transition">
                                {getFileIcon(url)}
                                <span className="truncate max-w-[150px]">{getFileName(url)}</span>
                                <Download size={12} className="ml-1 opacity-50" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {docModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800">Upload Case Document</h3>
              <button onClick={() => setDocModalOpen(false)}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
            </div>
            
            <FileUpload 
              variant="document"
              accept="*" 
              onUploadComplete={handleGeneralDocUpload}
            />
            
            <p className="text-xs text-center text-slate-400 mt-4">
              Max 50MB. Files are secure and shared with your lawyer.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}