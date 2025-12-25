"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast, Toaster } from "sonner";
import api from "@/lib/axios";
import { loginSchema, LoginValues } from "@/validations/auth";

export default function LoginPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginValues) => {
    try {
      const res = await api.post("/auth/login", data);
      
      const { access_token, user } = res.data;

      // 1. Store Token & User Data
      localStorage.setItem("accessToken", access_token);
      localStorage.setItem("user", JSON.stringify(user));

      toast.success(`Welcome back, ${user.firstName}!`);

      // 2. Intelligent Routing based on Role & Status
      if (user.role === "ADMIN") {
        router.push("/dashboard/admin");
      } 
      else if (user.role === "CLIENT") {
        router.push("/dashboard/client");
      } 
      else if (user.role === "LAWYER") {
        // If Lawyer is PENDING, send them to update profile
        if (user.status === "PENDING") {
          toast.info("Please complete your profile verification.");
          router.push("/dashboard/lawyer/profile");
        } else {
          router.push("/dashboard/lawyer");
        }
      }

    } catch (error: any) {
      console.error("Login Error:", error);
      const msg = error.response?.data?.message || "Invalid email or password";
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-blue-900">AinShongjog</h1>
          <p className="text-gray-500 mt-2">Login to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              {...register("email")}
              type="email"
              placeholder="you@example.com"
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              {...register("password")}
              type="password"
              placeholder="••••••"
              className="mt-1 w-full rounded border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded bg-blue-600 p-2 font-semibold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 text-center text-sm">
          <p className="text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium text-blue-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}