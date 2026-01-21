import { Metadata } from "next";
import { getCaseServerSide } from "@/lib/server-api";
import LawyerCaseView from "./lawyer-view"; // Import the client view
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>; // Next.js 15: Params is a Promise
};

// 1. DYNAMIC METADATA GENERATION
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params; // Await params
  const caseData = await getCaseServerSide(id);

  if (!caseData) {
    return { title: "Case Not Found" };
  }

  return {
    title: `Manage Case: ${caseData.title} | AinShongjog`,
    description: `Client: ${caseData.client.firstName} ${caseData.client.lastName}. Status: ${caseData.status}`,
  };
}

// 2. SERVER COMPONENT
export default async function Page({ params }: Props) {
  const { id } = await params; // Await params
  const caseData = await getCaseServerSide(id);

  // Security Redirect if case doesn't exist or user doesn't have permission
  if (!caseData) {
    notFound();
  }

  // Pass data to the Client Component for interactivity
  return <LawyerCaseView initialData={caseData} />;
}