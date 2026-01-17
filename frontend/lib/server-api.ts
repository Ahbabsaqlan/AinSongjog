import axios from "axios";
import { cookies } from "next/headers";

const getBackendUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';


export const getCaseServerSide = async (id: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  
  console.log(`[ServerFetch] Token found: ${token ? "YES" : "NO"}`);

  if (!token) return null;


  try {
    console.log(`[ServerFetch] Requesting: ${getBackendUrl()}/cases/${id}`);
    
    const res = await axios.get(`${getBackendUrl()}/cases/${id}`, {
      headers: {
        Cookie: `access_token=${token}`,
      },
    });
    
    console.log(`[ServerFetch] Success!`);
    return res.data;
  } catch (error: any) {
    
    console.error("[ServerFetch] Error:", error.message);
    if (error.response) {
        console.error("[ServerFetch] Status:", error.response.status);
        console.error("[ServerFetch] Data:", error.response.data);
    }
    return null;
  }
};

// NEW: User Fetcher
export const getUserServerSide = async () => {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
  
    if (!token) return null;
  
    try {
      const res = await axios.get(`${getBackendUrl()}/users/profile`, {
        headers: { Cookie: `access_token=${token}` },
      });
      return res.data;
    } catch (error) {
      return null;
    }
  };