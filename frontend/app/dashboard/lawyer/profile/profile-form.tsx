"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";
import { 
  User, MapPin, Phone, Edit2, X, Save, Scale, Mail, DollarSign, 
  Briefcase, GraduationCap, Gavel, Building
} from "lucide-react";
import FileUpload from "@/components/ui/file-upload";

export default function LawyerProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { lawyerProfile } = user;

  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      barCouncilId: lawyerProfile?.barCouncilId || "",
      chamberAddress: lawyerProfile?.chamberAddress || "",
      hourlyRate: lawyerProfile?.hourlyRate || "",
      mobileNumber: lawyerProfile?.mobileNumber || "",
      bio: lawyerProfile?.bio || "",
      photoUrl: lawyerProfile?.photoUrl || "",
      // New Fields
      lawyerType: lawyerProfile?.lawyerType || "",
      currentWorkplace: lawyerProfile?.currentWorkplace || "",
      educationalBackground: lawyerProfile?.educationalBackground || "",
      practiceAreas: lawyerProfile?.practiceAreas || "",
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const payload = { ...data, hourlyRate: Number(data.hourlyRate) };
      await api.patch("/users/lawyer/profile", payload);
      toast.success("Profile Updated Successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  // Helper to display practice areas as tags
  const renderTags = (tagsString: string) => {
    if (!tagsString) return <span className="text-gray-400 italic">No practice areas listed.</span>;
    return tagsString.split(',').map((tag, idx) => (
      <span key={idx} className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mr-2 mb-2 border border-blue-100">
        {tag.trim()}
      </span>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-23 mb-5 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 relative">
          <div className="absolute top-4 right-4">
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white border border-white/20 backdrop-blur-sm">
                <ShieldCheckIcon /> Verified Practitioner
             </span>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="relative flex flex-col md:flex-row justify-between items-end -mt-14 mb-6">
            <div className="flex items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-xl border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
                  {lawyerProfile?.photoUrl ? (
                    <img src={lawyerProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-gray-400" />
                  )}
                </div>
              </div>

              {/* Name & Type */}
              <div className="mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-lg text-blue-700 font-semibold">
                    {lawyerProfile?.lawyerType || "Legal Professional"}
                  </span>
                  <span className="text-gray-300">|</span>
                  <div className="flex items-center gap-1 text-gray-600 text-sm">
                    <Mail size={14} /> {user.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 md:mt-0">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm"
                >
                  <Edit2 size={16} /> Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancel} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
                    <X size={16} /> Cancel
                  </button>
                  <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">
                    {isSubmitting ? "Saving..." : <><Save size={16} /> Save Changes</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Bio, Education, Practice Areas */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Practice Areas */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Gavel size={20} className="text-blue-600" />
              Areas of Practice
            </h3>
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">List your specialties (comma separated)</label>
                <input 
                  {...register("practiceAreas")} 
                  className="w-full border border-gray-300 text-gray-500 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. Criminal Law, Corporate Tax, Family Disputes" 
                />
              </div>
            ) : (
              <div className="flex flex-wrap">
                {renderTags(lawyerProfile?.practiceAreas)}
              </div>
            )}
          </div>

          {/* Education & Bio */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              Professional Background
            </h3>

            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                  <input {...register("educationalBackground")} className="w-full text-gray-500 border p-3 rounded-lg" placeholder="Degree, University, Year" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio / About</label>
                  <textarea {...register("bio")} rows={5} className="w-full text-gray-500 border p-3 rounded-lg" placeholder="Tell potential clients about your experience..." />
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <GraduationCap size={16} /> Education
                  </h4>
                  <p className="text-gray-800 font-medium">{lawyerProfile?.educationalBackground || "Not listed"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About</h4>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {lawyerProfile?.bio || "No bio added yet."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Details Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">At a Glance</h3>
            
            <div className="space-y-6">
              {/* Photo Upload (Only in Edit) */}
              {isEditing && (
                <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Change Photo</label>
                  <FileUpload 
                    defaultImage={lawyerProfile?.photoUrl}
                    onUploadComplete={(url) => setValue("photoUrl", url, { shouldDirty: true })} 
                  />
                  <input type="hidden" {...register("photoUrl")} />
                </div>
              )}

              {/* Lawyer Type */}
              {isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Professional Title</label>
                  <select {...register("lawyerType")} className="w-full text-gray-500 border p-2 rounded-lg bg-white">
                    <option value="">Select Type</option>
                    <option value="Advocate">Advocate</option>
                    <option value="Barrister">Barrister</option>
                    <option value="Solicitor">Solicitor</option>
                    <option value="Legal Consultant">Legal Consultant</option>
                  </select>
                </div>
              )}

              {/* Workplace */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Current Workplace</label>
                {isEditing ? (
                  <input {...register("currentWorkplace")} className="w-full text-gray-500 border p-2 rounded-lg" placeholder="Court or Firm Name" />
                ) : (
                  <div className="flex items-center gap-3 text-gray-900">
                    <Building size={18} className="text-gray-400" />
                    <span>{lawyerProfile?.currentWorkplace || "Not listed"}</span>
                  </div>
                )}
              </div>

              {/* Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Hourly Rate</label>
                {isEditing ? (
                  <input {...register("hourlyRate")} type="number" className="w-full text-gray-500 border p-2 rounded-lg" placeholder="BDT" />
                ) : (
                  <div className="flex items-center gap-2 text-xl font-bold text-green-700">
                    <DollarSign size={20} />
                    {lawyerProfile?.hourlyRate || "N/A"} <span className="text-sm font-normal text-gray-500">BDT/hr</span>
                  </div>
                )}
              </div>

              {/* Bar ID */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Bar Council ID</label>
                {isEditing ? (
                  <input {...register("barCouncilId")} className="w-full text-gray-500 border p-2 rounded-lg" />
                ) : (
                  <div className="flex items-center gap-3 text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">
                    <Scale size={16} className="text-gray-500" />
                    <span className="font-mono text-sm">{lawyerProfile?.barCouncilId || "Pending"}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Chamber</label>
                {isEditing ? (
                  <textarea {...register("chamberAddress")} rows={2} className="w-full text-gray-500 border p-2 rounded-lg" />
                ) : (
                  <div className="flex items-start gap-3 text-gray-900 text-sm">
                    <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
                    {lawyerProfile?.chamberAddress || "Not listed"}
                  </div>
                )}
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Contact</label>
                {isEditing ? (
                  <input {...register("mobileNumber")} className="w-full text-gray-500 border p-2 rounded-lg" />
                ) : (
                  <div className="flex items-center gap-3 text-gray-900">
                    <Phone size={18} className="text-gray-400" />
                    {lawyerProfile?.mobileNumber || "Not listed"}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Icon for Header
function ShieldCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}