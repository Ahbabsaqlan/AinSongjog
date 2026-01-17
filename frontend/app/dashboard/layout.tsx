"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LogOut, User, FileText, Gavel, ShieldCheck, Search, Calendar, 
  Menu, ChevronLeft, ChevronRight, LayoutDashboard 
} from "lucide-react";
import { Toaster, toast } from "sonner";
import api from "@/lib/axios"; 
import RealtimeNotifications from "@/components/realtime-notifications";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar State

  // 1. SESSION RESTORATION LOGIC
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await api.get("/users/profile"); 
        setUser(res.data);
      } catch (error) {
        console.error("Session expired");
        router.push("/login"); 
      } finally {
        setIsLoading(false); 
      }
    };
    restoreSession();
  }, [router]);

  // 2. LOGOUT LOGIC
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); 
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (e) {
      toast.error("Logout failed");
    }
  };

  // 3. DEFINE LINKS
  const getLinks = () => {
    if (!user) return [];
    if (user.role === "ADMIN") {
      return [{ href: "/dashboard/admin", label: "Approvals", icon: ShieldCheck }];
    }
    if (user.role === "LAWYER") {
      return [
        { href: "/dashboard/lawyer", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/lawyer/cases", label: "My Cases", icon: Gavel },
        { href: "/dashboard/lawyer/appointments", label: "Schedule", icon: Calendar },
        { href: "/dashboard/lawyer/profile", label: "Profile", icon: User },
      ];
    }
    if (user.role === "CLIENT") {
      return [
        { href: "/dashboard/client", label: "Find Lawyer", icon: Search },
        { href: "/dashboard/client/appointments", label: "Schedule", icon: Calendar },
        { href: "/dashboard/client/cases", label: "My Cases", icon: FileText },
        { href: "/dashboard/client/profile", label: "Profile", icon: User },
      ];
    }
    return [];
  };

  // Helper for Logo Link
  const getHomeLink = () => {
    if (!user) return "/";
    return `/dashboard/${user.role.toLowerCase()}`;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) return null; 

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <RealtimeNotifications userId={user.id} />
      <Toaster position="top-right" />
      
      {/* SIDEBAR */}
      <aside 
        className={`bg-slate-900 text-white flex flex-col fixed h-full shadow-xl z-20 transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Header / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {!isCollapsed ? (
            <Link href={getHomeLink()} className="text-xl font-bold flex items-center gap-2 hover:opacity-80 transition">
              <span className="text-blue-400">Ain</span>Shongjog
            </Link>
          ) : (
            <Link href={getHomeLink()} className="mx-auto font-bold text-blue-400 text-xl">AS</Link>
          )}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition hidden md:block"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-2 overflow-y-auto overflow-x-hidden">
          {getLinks().map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? link.label : ""}
              >
                <Icon size={20} className={`shrink-0 ${isActive ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
                    {link.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className={`flex items-center gap-3 ${isCollapsed ? "justify-center" : ""}`}>
            <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-slate-300 font-bold border border-slate-600">
              {user.firstName[0]}
            </div>
            
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{user.firstName} {user.lastName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wide">{user.role}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={`mt-4 flex w-full items-center gap-2 rounded-lg bg-red-500/10 py-2.5 text-red-400 hover:bg-red-600 hover:text-white transition-colors duration-200 text-sm font-medium ${
              isCollapsed ? "justify-center px-0" : "px-4 justify-start"
            }`}
            title="Sign Out"
          >
            <LogOut size={18} />
            {!isCollapsed && "Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main 
        className={`flex-1 p-8 overflow-y-auto h-screen transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        {children}
      </main>
    </div>
  );
}