"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { toast } from "sonner";
import { 
  User, MapPin, Phone, Hash, 
  Calendar, Clock, Map, Plus, X, 
  FileText, Image as ImageIcon, File, Download, Edit2, RefreshCw, Paperclip
} from "lucide-react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/ui/file-upload";

// --- HELPER ICONS ---
const getFileIcon = (url: string) => {
  const ext = url.split('.').pop()?.toLowerCase();
  if (['jpg', 'jpeg', 'png', 'webp'].includes(ext || '')) return <ImageIcon size={14} className="text-purple-600" />;
  if (ext === 'pdf') return <FileText size={14} className="text-red-600" />;
  if (['doc', 'docx'].includes(ext || '')) return <FileText size={14} className="text-blue-600" />;
  return <File size={14} className="text-slate-600" />;
};

const getFileName = (url: string) => {
  return url.split('/').pop()?.split('-').slice(1).join('-') || "Document";
};

export default function LawyerCaseView({ initialData }: { initialData: any }) {
  const router = useRouter();
  const [caseData, setCaseData] = useState(initialData);
  const [status, setStatus] = useState(initialData.status);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false); 
  const [docModalOpen, setDocModalOpen] = useState(false); 
  const [editingEvent, setEditingEvent] = useState<any>(null); 

  // --- DATA PROCESSING ---
  const events = (caseData.events || []).sort((a: any, b: any) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  
  // Combine General Docs + Event Docs
  const generalDocs = (caseData.documents || []).map((url: string) => ({ url, type: 'General Case File', date: caseData.updatedAt }));
  const eventDocs = events.flatMap((e: any) => (e.attachments || []).map((url: string) => ({ url, type: e.title, date: e.eventDate })));
  const allDocuments = [...generalDocs, ...eventDocs];

  const handleStatusUpdate = async (newStatus: string) => {
    setStatus(newStatus);
    setIsUpdatingStatus(true);
    try {
      await api.patch(`/cases/${caseData.id}/status`, { status: newStatus });
      toast.success(`Case status updated to ${newStatus}`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to update status");
      setStatus(caseData.status);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleGeneralDocUpload = async (url: string) => {
    try {
      await api.patch(`/cases/${caseData.id}/documents`, { url });
      toast.success("Document added to vault");
      setDocModalOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to save document");
    }
  };

  const openAddModal = () => {
    setEditingEvent(null);
    setModalOpen(true);
  };

  const openEditModal = (event: any) => {
    setEditingEvent(event);
    setModalOpen(true);
  };

  const { client } = caseData;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      
      {/* HEADER */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-1 rounded border border-slate-200">
            REF: {caseData.caseNumber}
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">{caseData.title}</h1>
        </div>
        <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
          <div className={`w-3 h-3 rounded-full ml-2 ${status === 'OPEN' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-slate-400'}`} />
          <select 
            value={status} 
            onChange={(e) => handleStatusUpdate(e.target.value)}
            disabled={isUpdatingStatus}
            className="bg-transparent text-sm font-bold text-slate-700 outline-none cursor-pointer pr-2"
          >
            <option value="OPEN">ACTIVE CASE</option>
            <option value="PENDING">PENDING REVIEW</option>
            <option value="CLOSED">CASE CLOSED</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT SIDEBAR (Client & Docs) --- */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* CLIENT CARD */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-slate-900 h-24 relative">
               <div className="absolute -bottom-10 left-6">
                  <div className="w-20 h-20 rounded-full border-4 border-white bg-slate-100 overflow-hidden">
                    {client.clientProfile?.photoUrl ? (
                      <img src={client.clientProfile.photoUrl} className="w-full h-full object-cover" />
                    ) : <User className="w-full h-full p-4 text-slate-400"/>}
                  </div>
               </div>
            </div>
            <div className="pt-12 px-6 pb-6">
              <h3 className="text-xl font-bold text-slate-900">{client.firstName} {client.lastName}</h3>
              <p className="text-sm font-medium text-slate-500 mb-6 bg-slate-50 inline-block px-2 rounded">{client.email}</p>
              
              <div className="space-y-4 text-sm">
                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600"><Phone size={18} /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Mobile</p>
                    <p className="text-sm font-bold text-slate-800">{client.clientProfile?.mobileNumber || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div className="bg-red-50 p-2 rounded-lg text-red-500"><MapPin size={18} /></div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Address</p>
                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{client.clientProfile?.address || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* DOCUMENT VAULT */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText size={20} className="text-purple-600" /> 
                Case Documents
              </h3>
              <button 
                onClick={() => setDocModalOpen(true)}
                className="p-2 hover:bg-purple-50 text-slate-500 hover:text-purple-600 rounded-lg transition"
                title="Upload General Document"
              >
                <Plus size={20} />
              </button>
            </div>
            
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {allDocuments.length > 0 ? (
                allDocuments.map((doc: any, idx: number) => (
                  <a 
                    key={idx} 
                    href={doc.url} 
                    target="_blank" 
                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-purple-50 hover:border-purple-200 transition group"
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
                  <p className="text-sm text-slate-400">No documents uploaded.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT SIDEBAR (Timeline) --- */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Clock size={24} className="text-blue-600" /> Case Timeline
              </h3>
              <button 
                onClick={openAddModal} 
                className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 text-sm font-bold transition shadow-lg shadow-slate-900/10"
              >
                <Plus size={18} /> Add Event
              </button>
            </div>

            <div className="relative border-l-2 border-slate-100 ml-4 space-y-10">
              {events.length === 0 && <p className="text-slate-400 italic pl-8">No timeline events yet.</p>}

              {events.map((event: any) => {
                const isUpcoming = new Date(event.eventDate) > new Date();
                return (
                  <div key={event.id} className="relative pl-10 group">
                    {/* Timeline Dot */}
                    <div className={`absolute -left-[9px] top-0 w-5 h-5 rounded-full border-4 border-white shadow-sm ${isUpcoming ? 'bg-blue-600 animate-pulse ring-4 ring-blue-50' : 'bg-slate-300'}`} />
                    
                    {/* Event Card */}
                    <div className={`rounded-xl border p-6 transition ${isUpcoming ? 'bg-blue-50/30 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center gap-3">
                            <h4 className={`font-bold text-lg ${isUpcoming ? 'text-blue-900' : 'text-slate-800'}`}>{event.title}</h4>
                            {isUpcoming && <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide shadow-sm">UPCOMING</span>}
                          </div>
                          <div className="flex items-center gap-4 text-sm font-medium text-slate-500 mt-2">
                            <span className="flex items-center gap-1.5"><Calendar size={15} className="text-blue-500" /> {new Date(event.eventDate).toLocaleDateString()}</span>
                            <span className="flex items-center gap-1.5"><Clock size={15} className="text-blue-500" /> {new Date(event.eventDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                        
                        <button 
                          onClick={() => openEditModal(event)}
                          className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition shadow-sm"
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex gap-2 items-start text-sm text-slate-700 bg-white p-2.5 rounded-lg border border-slate-100 w-fit shadow-sm">
                          <Map size={16} className="mt-0.5 text-orange-500" />
                          <span className="font-semibold">{event.location}</span>
                        </div>
                        
                        {event.notes && (
                          <p className="text-sm text-slate-600 leading-relaxed pl-1">
                            "{event.notes}"
                          </p>
                        )}

                        {/* Attachments */}
                        {event.attachments && event.attachments.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-100">
                            <p className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-1.5 tracking-wider">
                              <Paperclip size={12} /> Attachments
                            </p>
                            <div className="flex flex-wrap gap-3">
                              {event.attachments.map((url: string, idx: number) => (
                                <a key={idx} href={url} target="_blank" className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:border-blue-400 hover:text-blue-700 hover:shadow-sm transition">
                                  {getFileIcon(url)}
                                  <span className="truncate max-w-[150px]">{getFileName(url)}</span>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="pt-2 text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                          <RefreshCw size={10} /> Last updated: {new Date(event.updatedAt || event.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* EVENT MODAL (Reused for Add/Edit) */}
      {modalOpen && (
        <EventModal 
          caseId={caseData.id} 
          existingEvent={editingEvent}
          onClose={() => setModalOpen(false)} 
          onSuccess={() => { setModalOpen(false); router.refresh(); }} 
        />
      )}

      {/* GENERAL DOC UPLOAD MODAL */}
      {docModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl text-slate-800">Upload Document</h3>
              <button onClick={() => setDocModalOpen(false)}><X size={20} className="text-slate-400 hover:text-red-500"/></button>
            </div>
            
            <FileUpload 
              variant="document"
              accept="*" // Any file type for general docs
              onUploadComplete={handleGeneralDocUpload}
            />
            
            <p className="text-xs text-center text-slate-400 mt-4">
              Max 50MB per file.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// --- EVENT MODAL COMPONENT ---
function EventModal({ caseId, existingEvent, onClose, onSuccess }: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<string[]>(existingEvent?.attachments || []);
  const isEditMode = !!existingEvent;

  // Format Date for Input (YYYY-MM-DDTHH:MM)
  const defaultDate = existingEvent 
    ? new Date(existingEvent.eventDate).toISOString().slice(0, 16) 
    : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target as HTMLFormElement);
    
    const payload = {
      title: formData.get("title"),
      eventDate: formData.get("date"),
      location: formData.get("location"),
      notes: formData.get("notes"),
      attachments: attachments 
    };

    try {
      if (isEditMode) {
        await api.patch(`/cases/events/${existingEvent.id}`, payload);
        toast.success("Event updated successfully");
      } else {
        await api.post(`/cases/${caseId}/events`, payload);
        toast.success("Event created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h3 className="font-extrabold text-xl text-slate-900">
            {isEditMode ? "Edit Timeline Event" : "Add Timeline Event"}
          </h3>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 transition">
            <X size={20}/>
          </button>
        </div>
        
        <div className="overflow-y-auto p-8 bg-white">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Event Type</label>
                <select 
                  name="title" 
                  defaultValue={existingEvent?.title} 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm bg-white font-semibold text-slate-800"
                >
                  <option value="Hearing">Court Hearing</option>
                  <option value="Case Filed">Case Filed</option>
                  <option value="Evidence">Evidence Submission</option>
                  <option value="Verdict">Verdict</option>
                  <option value="Consultation">Consultation</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date & Time</label>
                <input 
                  name="date" 
                  type="datetime-local" 
                  defaultValue={defaultDate} 
                  required 
                  className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm font-semibold text-slate-800" 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Location</label>
              <input 
                name="location" 
                defaultValue={existingEvent?.location} 
                required 
                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400" 
                placeholder="e.g. High Court Annex, Room 304"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Notes / Outcome</label>
              <textarea 
                name="notes" 
                defaultValue={existingEvent?.notes} 
                rows={3} 
                className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400" 
                placeholder="Details about requirements or results..." 
              />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Attach Documents</label>
              
              <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                <FileUpload 
                  variant="document"
                  accept="*" // Allow any file type here (handled by backend 50MB limit)
                  onUploadComplete={(url) => setAttachments(prev => [...prev, url])} 
                />

                {/* List of attachments */}
                {attachments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {attachments.map((url, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 text-sm shadow-sm">
                        <span className="flex items-center gap-3 font-semibold text-slate-700 truncate max-w-[280px]">
                          {getFileIcon(url)} {getFileName(url)}
                        </span>
                        <button type="button" onClick={() => setAttachments(prev => prev.filter(u => u !== url))} className="text-slate-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded">
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
                <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-slate-800 transition disabled:opacity-70 shadow-lg shadow-slate-900/20"
                >
                {isLoading ? "Saving..." : (isEditMode ? "Update Event" : "Add to Timeline")}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}