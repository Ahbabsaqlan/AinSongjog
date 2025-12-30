import axios from "axios";
import { cookies } from "next/headers";

export const getCaseServerSide = async (id: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  // DEBUG LOG 1: Check if we actually have a token
  console.log(`[ServerFetch] Token found: ${token ? "YES" : "NO"}`);

  if (!token) return null;

  // FIX: Use 127.0.0.1 instead of localhost to avoid IPv6 errors
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

  try {
    console.log(`[ServerFetch] Requesting: ${backendUrl}/cases/${id}`);
    
    const res = await axios.get(`${backendUrl}/cases/${id}`, {
      headers: {
        Cookie: `access_token=${token}`,
      },
    });
    
    console.log(`[ServerFetch] Success!`);
    return res.data;
  } catch (error: any) {
    // DEBUG LOG 2: Print the actual error
    console.error("[ServerFetch] Error:", error.message);
    if (error.response) {
        console.error("[ServerFetch] Status:", error.response.status);
        console.error("[ServerFetch] Data:", error.response.data);
    }
    return null;
  }
};