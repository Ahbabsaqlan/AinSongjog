"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";
import { 
  User, MapPin, Phone, CreditCard, 
  Edit2, X, Save, ShieldCheck, Mail 
} from "lucide-react";
import FileUpload from "@/components/ui/file-upload";

export default function ClientProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { clientProfile } = user;

  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      nid: clientProfile?.nid || "",
      mobileNumber: clientProfile?.mobileNumber || "",
      address: clientProfile?.address || "",
      photoUrl: clientProfile?.photoUrl || "",
    }
  });

  const onSubmit = async (data: any) => {
    try {
      await api.patch("/users/client/profile", data);
      toast.success("Profile Updated Successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    // --- MODIFICATION: Added responsive padding ---
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6 lg:p-8">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-28 sm:h-32 bg-gradient-to-r from-slate-900 to-slate-800 relative">
          <div className="absolute top-4 right-4">
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20 backdrop-blur-sm">
                <ShieldCheck size={12} />
                Secure Client Account
             </span>
          </div>
        </div>

        {/* --- MODIFICATION: Added responsive padding and flex direction --- */}
        <div className="px-4 sm:px-8 pb-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end -mt-16 gap-4">
            
            {/* --- MODIFICATION: Centered on mobile, aligned left on md+ --- */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
              <div className="relative">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
                  {clientProfile?.photoUrl ? (
                    <img 
                      src={clientProfile.photoUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User size={64} className="text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Name & Email */}
              <div className="text-center md:text-left md:mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 text-gray-500 mt-1">
                  <Mail size={16} />
                  <span>{user.email}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {/* --- MODIFICATION: Full width on mobile --- */}
            <div className="w-full md:w-auto shrink-0">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition shadow-sm"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleCancel}
                    disabled={isSubmitting}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    <X size={16} />
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm disabled:opacity-70"
                  >
                    {isSubmitting ? "Saving..." : <><Save size={16} /><span>Save</span></>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Details Form Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <h3 className="text-lg font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">
          Personal Information
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          {isEditing && (
            <div className="bg-gray-50 p-4 rounded-xl border border-dashed border-gray-300">
              <label className="block text-sm font-medium text-gray-700 mb-3">Update Profile Picture</label>
              <FileUpload 
                defaultImage={clientProfile?.photoUrl}
                onUploadComplete={(url) => setValue("photoUrl", url, { shouldDirty: true })} 
              />
              <input type="hidden" {...register("photoUrl")} />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Field: Mobile */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Mobile Number</label>
              {isEditing ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    {...register("mobileNumber")} 
                    className="w-full text-gray-700 pl-10 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                    placeholder="017..." 
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 text-gray-900 font-medium p-2">
                  <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
                    <Phone size={20} />
                  </div>
                  <span className="break-all">{clientProfile?.mobileNumber || "Not provided"}</span>
                </div>
              )}
            </div>

            {/* Field: NID */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 uppercase tracking-wider">National ID (NID)</label>
              {isEditing ? (
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    {...register("nid")} 
                    className="w-full text-gray-700 pl-10 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                    placeholder="Enter NID" 
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 text-gray-900 font-medium p-2">
                  <div className="bg-purple-50 p-2 rounded-lg text-purple-600">
                    <CreditCard size={20} />
                  </div>
                  <span className="break-all">{clientProfile?.nid || "Not verified"}</span>
                </div>
              )}
            </div>

            {/* Field: Address */}
            <div className="md:col-span-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-1.5 uppercase tracking-wider">Present Address</label>
              {isEditing ? (
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    {...register("address")} 
                    className="w-full text-gray-700 pl-10 border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition" 
                    placeholder="Full Address" 
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 text-gray-900 font-medium p-2">
                  <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
                    <MapPin size={20} />
                  </div>
                  <span className="break-words">{clientProfile?.address || "Address not provided"}</span>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}