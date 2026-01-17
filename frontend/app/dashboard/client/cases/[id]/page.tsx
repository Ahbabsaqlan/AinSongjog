import { Metadata } from "next";
import { getCaseServerSide } from "@/lib/server-api";
import ClientCaseView from "./client-view";
import { redirect } from "next/navigation";

type Props = {
  // Update Type: Params is a Promise now
  params: Promise<{ id: string }>;
};

// 1. DYNAMIC METADATA
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params; // <--- FIX: Await params
  const caseData = await getCaseServerSide(id);

  if (!caseData) return { title: "Case Not Found" };

  return {
    title: `${caseData.title} | Case Details`,
    description: `Ref: ${caseData.caseNumber}`,
  };
}

// 2. SERVER COMPONENT
export default async function Page({ params }: Props) {
  const { id } = await params; // <--- FIX: Await params here too!
  
  const caseData = await getCaseServerSide(id);

  if (!caseData) {
    redirect("/dashboard/client/cases");
  }

  return <ClientCaseView caseData={caseData} />;
}