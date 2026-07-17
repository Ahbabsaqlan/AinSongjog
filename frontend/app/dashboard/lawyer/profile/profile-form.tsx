"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { toast } from "sonner";
import { 
  User, MapPin, Phone, Edit2, X, Save, Scale, Mail, DollarSign, 
  Briefcase, GraduationCap, Gavel, Building, ShieldCheck, Smartphone, Check, AlertCircle
} from "lucide-react";
import FileUpload from "@/components/ui/file-upload";
import QRCode from "react-qr-code";

export default function LawyerProfileForm({ user }: { user: any }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const { lawyerProfile } = user;

  // --- WHATSAPP STATES ---
  const [phone, setPhone] = useState(lawyerProfile?.mobileNumber || "");
  const [isVerified, setIsVerified] = useState(user.isPhoneVerified || false); // Backend field needed
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [isWaConnected, setIsWaConnected] = useState(false);

  const { register, handleSubmit, setValue, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      barCouncilId: lawyerProfile?.barCouncilId || "",
      chamberAddress: lawyerProfile?.chamberAddress || "",
      hourlyRate: lawyerProfile?.hourlyRate || "",
      mobileNumber: lawyerProfile?.mobileNumber || "",
      bio: lawyerProfile?.bio || "",
      photoUrl: lawyerProfile?.photoUrl || "",
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

  // --- VERIFICATION LOGIC ---
  const requestOtp = async () => {
    if (!phone) return toast.error("Please enter a number");
    try {
      await api.post('/whatsapp/verify/init', { mobileNumber: phone });
      setOtpSent(true);
      toast.success("OTP sent to WhatsApp!");
    } catch (e) { toast.error("Failed to send OTP"); }
  };

  const verifyOtp = async () => {
    try {
      await api.post('/whatsapp/verify/confirm', { mobileNumber: phone, otp });
      setIsVerified(true);
      setOtpSent(false);
      toast.success("Phone Verified!");
      // Optionally save 'isPhoneVerified' to backend here if needed instantly
    } catch (e) { toast.error("Invalid OTP"); }
  };

  const openConnectModal = async () => {
    setShowQrModal(true);
    try {
      const res = await api.get('/whatsapp/qr');
      if (res.data.isConnected) {
        setIsWaConnected(true);
        toast.success("Already Connected");
      } else {
        setQrCode(res.data.qr);
      }
    } catch (e) { console.error(e); }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
    setOtpSent(false);
  };

  const renderTags = (tagsString: string) => {
    if (!tagsString) return <span className="text-gray-400 italic text-sm">No practice areas listed.</span>;
    return tagsString.split(',').map((tag, idx) => (
      <span key={idx} className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mr-2 mb-2 border border-blue-100 whitespace-nowrap">
        {tag.trim()}
      </span>
    ));
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 sm:px-6 lg:px-8 py-6">
      
      {/* 1. Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-28 sm:h-36 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 relative">
          <div className="absolute top-4 right-4">
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-xs font-medium bg-white/10 text-white border border-white/20 backdrop-blur-sm uppercase tracking-wide">
                <ShieldCheck size={12} /> Verified Practitioner
             </span>
          </div>
        </div>

        <div className="px-4 sm:px-8 sm:py-8 pb-8">
          <div className="relative flex flex-col md:flex-row justify-between md:items-end -mt-16 sm:-mt-20">
            <div className="w-full flex flex-col md:flex-row items-center md:items-end gap-4">
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-4 border-white bg-gray-100 flex items-center justify-center overflow-hidden shadow-md">
                  {lawyerProfile?.photoUrl ? (
                    <img src={lawyerProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : <User size={64} className="text-gray-400" />}
                </div>
              </div>
              <div className="text-center md:text-left md:mb-2 mt-2 md:mt-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center md:justify-start gap-x-2 mt-1">
                  <span className="text-base sm:text-lg text-blue-700 font-semibold">{lawyerProfile?.lawyerType || "Legal Professional"}</span>
                  <span className="hidden sm:inline text-gray-300">|</span>
                  <div className="flex items-center gap-1 text-gray-600 text-sm"><Mail size={14} /> {user.email}</div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-auto mt-6 md:mt-0 shrink-0">
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition shadow-sm"><Edit2 size={16} /> Edit Profile</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancel} disabled={isSubmitting} className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"><X size={16} /> Cancel</button>
                  <button onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm">{isSubmitting ? "Saving..." : <><Save size={16} /> Save</>}</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Gavel size={20} className="text-blue-600" /> Areas of Practice</h3>
            {isEditing ? <div><label className="block text-sm font-medium text-gray-500 mb-1">List specialties (comma separated)</label><input {...register("practiceAreas")} className="w-full border border-gray-300 text-gray-700 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" placeholder="e.g. Criminal Law" /></div> : <div className="flex flex-wrap pt-2">{renderTags(lawyerProfile?.practiceAreas)}</div>}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2"><Briefcase size={20} className="text-blue-600" /> Professional Background</h3>
            {isEditing ? (
              <div className="space-y-6">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Education</label><input {...register("educationalBackground")} className="w-full text-gray-700 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Bio</label><textarea {...register("bio")} rows={5} className="w-full text-gray-700 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-slate-900 outline-none" /></div>
              </div>
            ) : (
              <div className="space-y-6">
                <div><h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2"><GraduationCap size={16} /> Education</h4><p className="text-gray-800 font-medium break-words">{lawyerProfile?.educationalBackground || "Not listed"}</p></div>
                <div><h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About</h4><p className="text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{lawyerProfile?.bio || "No bio added yet."}</p></div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Key Details + WHATSAPP */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-6">At a Glance</h3>
            
            <div className="space-y-6">
              {/* Image Upload */}
              {isEditing && (
                <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Change Photo</label>
                  <FileUpload variant="avatar" defaultImage={lawyerProfile?.photoUrl} onUploadComplete={(url) => setValue("photoUrl", url, { shouldDirty: true })} />
                  <input type="hidden" {...register("photoUrl")} />
                </div>
              )}

              {/* Title & Workplace */}
              {isEditing && <div><label className="block text-sm font-medium text-gray-500 mb-1">Professional Title</label><select {...register("lawyerType")} className="w-full border border-gray-300 p-2 rounded-lg bg-white text-gray-700"><option value="">Select</option><option value="Advocate">Advocate</option><option value="Barrister">Barrister</option></select></div>}
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Current Workplace</label>
                {isEditing ? <input {...register("currentWorkplace")} className="w-full border border-gray-300 p-2 rounded-lg text-gray-700" /> : <div className="flex items-center gap-3 text-gray-900"><Building size={18} className="text-gray-400" /><span className="break-words">{lawyerProfile?.currentWorkplace || "Not listed"}</span></div>}
              </div>

              {/* WHATSAPP VERIFICATION SECTION */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">WhatsApp Contact</label>
                
                {isEditing ? (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                       <input 
                         {...register("mobileNumber")} 
                         onChange={(e) => { 
                           setValue("mobileNumber", e.target.value); 
                           setPhone(e.target.value); // Sync local state for verification
                         }}
                         className="w-full border border-slate-300 p-2 rounded-lg text-sm font-bold text-slate-800"
                         placeholder="88017..."
                       />
                       {!isVerified && !otpSent && (
                         <button type="button" onClick={requestOtp} className="bg-slate-900 text-white px-3 rounded-lg text-xs font-bold">Verify</button>
                       )}
                    </div>
                    
                    {otpSent && !isVerified && (
                       <div className="flex gap-2 animate-in fade-in slide-in-from-top-2">
                          <input 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            className="w-24 border border-blue-300 p-2 rounded-lg text-center tracking-widest font-bold text-sm"
                            placeholder="OTP"
                          />
                          <button type="button" onClick={verifyOtp} className="bg-green-600 text-white px-3 rounded-lg text-xs font-bold">Confirm</button>
                       </div>
                    )}
                  </div>
                ) : (
                  // View Mode
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-gray-900 bg-white p-3 rounded-lg border border-slate-200">
                       <Smartphone size={18} className={isVerified ? "text-green-600" : "text-slate-400"} />
                       <span className="font-bold text-sm">{lawyerProfile?.mobileNumber || "Not listed"}</span>
                       {isVerified && <Check size={16} className="text-green-600 ml-auto" />}
                    </div>

                    {isVerified && (
                        <button 
                          onClick={openConnectModal}
                          className={`w-full py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${isWaConnected ? "bg-green-100 text-green-700" : "bg-slate-900 text-white hover:bg-slate-800"}`}
                        >
                           {isWaConnected ? <><Check size={14} /> Automation Active</> : "Connect for Alerts"}
                        </button>
                    )}
                  </div>
                )}
              </div>

              {/* Bar ID & Address */}
              <div><label className="block text-sm font-medium text-gray-500 mb-1">Bar Council ID</label>{isEditing ? <input {...register("barCouncilId")} className="w-full border border-gray-300 p-2 rounded-lg text-gray-700" /> : <div className="flex items-center gap-3 text-gray-800 bg-slate-50 p-2 rounded border border-slate-100"><Scale size={16} className="text-gray-500" /><span className="font-mono text-sm font-bold break-all">{lawyerProfile?.barCouncilId || "Pending"}</span></div>}</div>
              
              <div><label className="block text-sm font-medium text-gray-500 mb-1">Hourly Rate</label>{isEditing ? <input {...register("hourlyRate")} type="number" className="w-full border border-gray-300 p-2 rounded-lg text-gray-700" /> : <div className="flex items-center gap-2 text-xl font-bold text-green-700"><DollarSign size={20} /> {lawyerProfile?.hourlyRate || "N/A"}</div>}</div>

            </div>
          </div>
        </div>
      </div>

      {/* QR MODAL */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
                <h3 className="font-bold text-xl mb-2 text-slate-900">Scan to Automate</h3>
                <p className="text-slate-500 text-sm mb-6">Link your WhatsApp to send appointment updates automatically.</p>
                <div className="bg-white p-4 rounded-xl border border-slate-200 inline-block mb-6">
                    {isWaConnected ? <div className="text-green-600 font-bold py-10"><Check size={64} className="mx-auto mb-4" />Connected!</div> : qrCode ? <QRCode value={qrCode} size={200} /> : <div className="w-[200px] h-[200px] flex items-center justify-center text-slate-400 text-xs animate-pulse bg-slate-50">Generating QR...</div>}
                </div>
                <button onClick={() => setShowQrModal(false)} className="w-full py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Close</button>
            </div>
        </div>
      )}
    </div>
  );
}