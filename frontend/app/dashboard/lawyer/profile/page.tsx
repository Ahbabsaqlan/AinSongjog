"use client";

import { useForm } from "react-hook-form";
import api from "@/lib/axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Define the shape of the form
type LawyerProfileForm = {
  barCouncilId: string;
  chamberAddress: string;
  hourlyRate: number;
  mobileNumber: string;
  bio: string;
};

export default function LawyerProfilePage() {
  const router = useRouter();
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<LawyerProfileForm>();

  const onSubmit = async (data: LawyerProfileForm) => {
    try {
      // Convert string to number for hourlyRate
      const payload = { ...data, hourlyRate: Number(data.hourlyRate) };
      
      await api.patch("/users/lawyer/profile", payload);
      toast.success("Profile Updated! Please wait for Admin approval.");
      
      // Update local storage user status temporarily so they don't see old data
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      // Note: Status stays PENDING until admin approves, but we notify user
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Update Professional Profile</h1>
      <div className="bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium mb-1">Bar Council ID</label>
            <input {...register("barCouncilId", { required: true })} className="w-full border p-2 rounded" placeholder="e.g. BAR-1234" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Chamber Address</label>
            <input {...register("chamberAddress", { required: true })} className="w-full border p-2 rounded" placeholder="e.g. 123 High Court Road" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mobile Number</label>
              <input {...register("mobileNumber", { required: true })} className="w-full border p-2 rounded" placeholder="017..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hourly Rate (BDT)</label>
              <input {...register("hourlyRate", { required: true })} type="number" className="w-full border p-2 rounded" placeholder="2000" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Professional Bio</label>
            <textarea {...register("bio")} rows={4} className="w-full border p-2 rounded" placeholder="Describe your experience..." />
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white p-3 rounded font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? "Saving..." : "Save Profile Information"}
          </button>

        </form>
      </div>
    </div>
  );
}