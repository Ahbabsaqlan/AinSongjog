import { Metadata } from "next";
import { getUserServerSide } from "@/lib/server-api";
import ClientProfileForm from "./profile-form";
import { redirect } from "next/navigation";

// 1. Dynamic Metadata
export async function generateMetadata(): Promise<Metadata> {
  const user = await getUserServerSide();
  if (!user) return { title: "Profile" };

  return {
    title: `${user.firstName}'s Profile`,
    description: "Manage your personal information.",
  };
}

// 2. Server Component
export default async function Page() {
  const user = await getUserServerSide();

  if (!user) redirect("/login");

  // Pass data to Client Form (No loading spinner needed!)
  return <ClientProfileForm user={user} />;
}