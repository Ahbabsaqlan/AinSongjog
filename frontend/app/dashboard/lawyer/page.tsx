import { Metadata } from "next";
import { getCasesServerSide, getUserServerSide } from "@/lib/server-api";
import LawyerDashboardOverview from "./overview-view";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const user = await getUserServerSide();
  return {
    title: user ? `Dashboard: Advocate ${user.lastName}` : "Lawyer Dashboard",
    description: "Manage your legal portfolio and recent case activities.",
  };
}

export default async function Page() {
  const [user, cases] = await Promise.all([
    getUserServerSide(),
    getCasesServerSide()
  ]);

  if (!user) redirect("/login");

  // Pass server data to the client view
  return <LawyerDashboardOverview initialUser={user} initialCases={cases} />;
}