import { Metadata } from "next";
import ClientDashboardSearch from "./search-view";

export const metadata: Metadata = {
  title: "Client Dashboard",
  description: "Find lawyers and manage your legal cases.",
};

export default function Page() {
  return <ClientDashboardSearch />;
}