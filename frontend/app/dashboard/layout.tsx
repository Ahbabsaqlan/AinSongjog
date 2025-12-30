"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, User, FileText, Gavel, ShieldCheck, Search } from "lucide-react";
import { Toaster, toast } from "sonner";
import api from "@/lib/axios"; // Ensure you use the updated axios instance withCredentials: true

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); // Tracks if we are checking the cookie

  // 1. SESSION RESTORATION LOGIC
  useEffect(() => {
    const restoreSession = async () => {
      try {
        // We ask the server who we are. The browser sends the cookie automatically.
        const res = await api.get("/users/profile"); 
        setUser(res.data);
      } catch (error) {
        console.error("Session expired or invalid");
        router.push("/login"); // Cookie missing or invalid -> Redirect
      } finally {
        setIsLoading(false); // Stop loading regardless of success/fail
      }
    };

    restoreSession();
  }, [router]);

  // 2. LOGOUT LOGIC
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); // Tell server to delete the cookie
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (e) {
      toast.error("Logout failed");
    }
  };

  // 3. LOADING SCREEN (Professional Touch)
  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-sm font-medium text-gray-500">Verifying Identity...</p>
      </div>
    );
  }

  // 4. SECURITY FALLBACK
  if (!user) return null; 

  // Define Links based on Role
  const getLinks = () => {
    if (user.role === "ADMIN") {
      return [
        { href: "/dashboard/admin", label: "Pending Approvals", icon: ShieldCheck },
      ];
    }
    if (user.role === "LAWYER") {
      return [
        { href: "/dashboard/lawyer/cases", label: "My Cases", icon: Gavel },
        { href: "/dashboard/lawyer/profile", label: "Update Profile", icon: User },
      ];
    }
    if (user.role === "CLIENT") {
      return [
        { href: "/dashboard/client", label: "Find Lawyer", icon: Search },
        { href: "/dashboard/client/cases", label: "My Cases", icon: FileText },
        { href: "/dashboard/client/profile", label: "My Profile", icon: User },
      ];
    }
    return [];
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full shadow-xl z-10">
        <div className="p-6 text-2xl font-bold border-b border-slate-700 flex items-center gap-2">
          <span className="text-blue-400">Ain</span>Shongjog
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {getLinks().map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} className={isActive ? "text-white" : "text-slate-400 group-hover:text-white"} />
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className="mb-4 px-4 py-3 bg-slate-800 rounded-lg">
            <p className="text-sm font-semibold text-white">{user.firstName} {user.lastName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-2 h-2 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              <p className="text-xs text-slate-400 capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 px-4 py-2.5 text-red-400 hover:bg-red-600 hover:text-white transition-colors duration-200 text-sm font-medium"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area - Added padding-left to account for fixed sidebar */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}