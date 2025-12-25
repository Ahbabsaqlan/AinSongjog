import { z } from 'zod';

// Step 1: Initial Signup
export const signupInitSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  dob: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  role: z.enum(["CLIENT", "LAWYER"]),
});

// Step 2: OTP Verification
export const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

// Step 3: Complete Signup (Password)
export const signupCompleteSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Login
export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

export type SignupInitValues = z.infer<typeof signupInitSchema>;
export type OtpValues = z.infer<typeof otpSchema>;
export type SignupCompleteValues = z.infer<typeof signupCompleteSchema>;
export type LoginValues = z.infer<typeof loginSchema>;