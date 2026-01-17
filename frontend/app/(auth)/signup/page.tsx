"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link"; // <--- 1. IMPORT LINK
import { toast, Toaster } from "sonner"; 
import api from "@/lib/axios";
import { 
  signupInitSchema, 
  otpSchema, 
  signupCompleteSchema,
  SignupInitValues,
  OtpValues,
  SignupCompleteValues
} from "@/validations/auth";

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [signupToken, setSignupToken] = useState("");

  // --- STEP 1 FORM ---
  const formInit = useForm<SignupInitValues>({
    resolver: zodResolver(signupInitSchema),
    defaultValues: { role: "CLIENT" }
  });

  // --- STEP 2 FORM ---
  const formOtp = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
  });

  // --- STEP 3 FORM ---
  const formComplete = useForm<SignupCompleteValues>({
    resolver: zodResolver(signupCompleteSchema),
  });

  // 1. Handle Init Submit
  const onInitSubmit = async (data: SignupInitValues) => {
    try {
      await api.post("/auth/signup/init", data);
      setEmail(data.email);
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  // 2. Handle OTP Submit
  const onOtpSubmit = async (data: OtpValues) => {
    console.log("Submitting OTP:", { email, otp: data.otp }); 

    try {
      const res = await api.post("/auth/signup/verify", { email, otp: data.otp });
      
      console.log("Backend Response:", res.data); 

      if (!res.data.signupToken) {
        console.error("Missing signupToken in response!");
        toast.error("System Error: No token received");
        return;
      }

      setSignupToken(res.data.signupToken);
      toast.success("OTP Verified!");
      
      console.log("Moving to Step 3..."); 
      setStep(3);
      
    } catch (error: any) {
      console.error("OTP Error:", error); 
      console.error("Error Response:", error.response?.data);
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };

  // 3. Handle Password Submit
  const onCompleteSubmit = async (data: SignupCompleteValues) => {
    try {
      await api.post("/auth/signup/complete", {
        email,
        signupToken,
        password: data.password
      });
      toast.success("Account Created! Please Login.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create account");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Create Account (Step {step}/3)
        </h1>

        {/* --- STEP 1: Basic Info --- */}
        {step === 1 && (
          <form onSubmit={formInit.handleSubmit(onInitSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-500 text-sm font-medium">First Name</label>
              <input {...formInit.register("firstName")} className="w-full text-gray-500 border p-2 rounded" />
              {formInit.formState.errors.firstName && <p className="text-red-500 text-sm">{formInit.formState.errors.firstName.message}</p>}
            </div>
            
            <div>
              <label className="block  text-gray-500 text-sm font-medium">Last Name</label>
              <input {...formInit.register("lastName")} className="w-full text-gray-500 border p-2 rounded" />
            </div>

            <div>
              <label className="block text-gray-500 text-sm font-medium">Email</label>
              <input {...formInit.register("email")} type="email" className="w-full text-gray-500 border p-2 rounded" />
              {formInit.formState.errors.email && <p className="text-red-500 text-sm">{formInit.formState.errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-gray-500 text-sm font-medium">Date of Birth</label>
              <input {...formInit.register("dob")} type="date" className="w-full text-gray-500 border p-2 rounded" />
            </div>

            <div>
              <label className="block text-gray-500 text-sm font-medium">I am a:</label>
              <select {...formInit.register("role")} className="w-full  text-gray-500 border p-2 rounded">
                <option value="CLIENT">Client (Seeking Legal Help)</option>
                <option value="LAWYER">Lawyer (Providing Service)</option>
              </select>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Next: Verify Email
            </button>
          </form>
        )}

        {/* --- STEP 2: OTP --- */}
        {step === 2 && (
          <form onSubmit={formOtp.handleSubmit(onOtpSubmit)} className="space-y-4">
            <p className="text-sm text-gray-600">Enter the OTP sent to <strong>{email}</strong></p>
            
            <div>
              <label className="block text-sm font-medium">OTP Code</label>
              <input {...formOtp.register("otp")} className="w-full text-gray-500 border p-2 rounded text-center text-xl tracking-widest" maxLength={6} />
              {formOtp.formState.errors.otp && <p className="text-red-500 text-sm">{formOtp.formState.errors.otp.message}</p>}
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Verify OTP
            </button>
            <button type="button" onClick={() => setStep(1)} className="w-full text-gray-500 text-sm mt-2">Back</button>
          </form>
        )}

        {/* --- STEP 3: Password --- */}
        {step === 3 && (
          <form onSubmit={formComplete.handleSubmit(onCompleteSubmit)} className="space-y-4">
            <div>
              <label className="block text-gray-500 text-sm font-medium">Password</label>
              <input {...formComplete.register("password")} type="password" className="w-full text-gray-500 border p-2 rounded" />
              {formComplete.formState.errors.password && <p className="text-red-500 text-sm">{formComplete.formState.errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-gray-500 text-sm font-medium">Confirm Password</label>
              <input {...formComplete.register("confirmPassword")} type="password" className="w-full text-gray-500 border p-2 rounded" />
              {formComplete.formState.errors.confirmPassword && <p className="text-red-500 text-sm">{formComplete.formState.errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
              Complete Registration
            </button>
          </form>
        )}

        {/* --- 2. ADDED LOGIN LINK SECTION --- */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}