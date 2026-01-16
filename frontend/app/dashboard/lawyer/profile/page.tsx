import { Metadata } from "next";
import { getUserServerSide } from "@/lib/server-api";
import LawyerProfileForm from "./profile-form";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const user = await getUserServerSide();
  if (!user) return { title: "Lawyer Profile" };

  return {
    title: `Advocate ${user.lastName} | Profile`,
    description: "Update your professional credentials and chamber details.",
  };
}

export default async function Page() {
  const user = await getUserServerSide();
  if (!user) redirect("/login");

  return <LawyerProfileForm user={user} />;
}