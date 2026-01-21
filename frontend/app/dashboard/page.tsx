import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import axios from "axios";

export default async function DashboardRouterPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  let userRole = "";

  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';
    
    const res = await axios.get(`${backendUrl}/users/profile`, {
      headers: {
        Cookie: `access_token=${token}`,
      },
    });

    userRole = res.data.role.toLowerCase();
    
  } catch (error: any) {
    console.error("Auth Check Failed:", error.message);
    redirect("/login");
  }
  redirect(`/dashboard/${userRole}`);
}