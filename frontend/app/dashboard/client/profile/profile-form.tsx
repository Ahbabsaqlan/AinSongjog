"use client";

import { useForm } from "react-hook-form";
import api from "@/lib/axios";
import { toast } from "sonner";
import { User, MapPin, Phone, CreditCard, Image as ImageIcon } from "lucide-react";

// Accept initial data from Server
export default function ClientProfileForm({ user }: { user: any }) {
  const { clientProfile } = user;
  
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
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
    } catch (error: any) {
      toast.error("Failed to update profile");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
        <p className="text-gray-500">Update your personal details to help lawyers identify you.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar / Info Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
            <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-blue-600 mb-4">
              <User size={40} />
            </div>
            <h3 className="font-bold text-gray-800">Client Account</h3>
            <p className="text-sm text-gray-500 mt-1">Keep your info private until you assign a case.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* NID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National ID (NID)</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    {...register("nid")} 
                    className="w-full pl-10 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="Enter NID Number" 
                  />
                </div>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    {...register("mobileNumber")} 
                    className="w-full pl-10 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="017..." 
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Present Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    {...register("address")} 
                    className="w-full pl-10 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="House, Road, Area, City" 
                  />
                </div>
              </div>

              {/* Photo URL (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo URL (Optional)</label>
                <div className="relative">
                  <ImageIcon className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input 
                    {...register("photoUrl")} 
                    className="w-full pl-10 border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    placeholder="https://..." 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-slate-900 text-white py-3 rounded-lg font-semibold hover:bg-slate-800 disabled:bg-gray-400 transition"
              >
                {isSubmitting ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}