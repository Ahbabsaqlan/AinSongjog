import axios from "axios";
import { cookies } from "next/headers";

const getBackendUrl = () => process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';


export const getCaseServerSide = async (id: string) => {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return null;


  try {    
    const res = await axios.get(`${getBackendUrl()}/cases/${id}`, {
      headers: {
        Cookie: `access_token=${token}`,
      },
    });
    
    return res.data;
  } catch (error: any) {
    console.error("[ServerFetch] Error fetching case:", error.message);
    if (error.response) {
        console.error("[ServerFetch] Status:", error.response.status);
        console.error("[ServerFetch] Data:", error.response.data);
    }
    return null;
  }
};

export const getCasesServerSide = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  if (!token) return [];

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000';

  try {
    const res = await axios.get(`${backendUrl}/cases`, {
      headers: { Cookie: `access_token=${token}` },
    });
    return res.data;
  } catch (error) {
    return [];
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