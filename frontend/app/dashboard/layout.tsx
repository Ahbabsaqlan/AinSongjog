"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LogOut, User, FileText, Gavel, ShieldCheck, Search, Calendar, 
  Menu, X, ChevronLeft, ChevronRight, LayoutDashboard, Bell 
} from "lucide-react";
import { Toaster, toast } from "sonner";
import api from "@/lib/axios"; 
import RealtimeNotifications from "@/components/realtime-notifications";
import NotificationDropdown from "@/components/notification-dropdown";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true); 
  const [isCollapsed, setIsCollapsed] = useState(true); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get("/notifications");
      setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const res = await api.get("/users/profile"); 
        setUser(res.data);
        fetchUnreadCount();
      } catch (error) { router.push("/login"); }
      finally { setIsLoading(false); }
    };
    restoreSession();
  }, [router, fetchUnreadCount]);

  useEffect(() => {
    window.addEventListener("new-notification", fetchUnreadCount);
    return () => window.removeEventListener("new-notification", fetchUnreadCount);
  }, [fetchUnreadCount]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifs(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout"); 
      router.push("/login");
    } catch (e) { toast.error("Logout failed"); }
  };

  const getLinks = () => {
    if (!user) return [];
    const links = [];
    if (user.role === "ADMIN") links.push({ href: "/dashboard/admin", label: "Approvals", icon: ShieldCheck });
    if (user.role === "LAWYER") {
      links.push(
        { href: "/dashboard/lawyer", label: "Overview", icon: LayoutDashboard },
        { href: "/dashboard/lawyer/cases", label: "My Cases", icon: Gavel },
        { href: "/dashboard/lawyer/appointments", label: "Schedule", icon: Calendar },
        { href: "/dashboard/lawyer/profile", label: "Profile", icon: User },
      );
    } else if (user.role === "CLIENT") {
      links.push(
        { href: "/dashboard/client", label: "Find Lawyer", icon: Search },
        { href: "/dashboard/client/appointments", label: "Schedule", icon: Calendar },
        { href: "/dashboard/client/cases", label: "My Cases", icon: FileText },
        { href: "/dashboard/client/profile", label: "Profile", icon: User },
      );
    }
    links.push({ href: "#", label: "Notifications", icon: Bell, badge: unreadCount });
    return links;
  };

  const getHomeLink = () => user ? `/dashboard/${user.role.toLowerCase()}` : "/";

  if (isLoading) return <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-blue-400 font-bold">AinShongjog...</div>;
  if (!user) return null; 

  return (
    <div className="flex min-h-screen bg-slate-50">
      <RealtimeNotifications userId={user.id} />
      <Toaster position="top-right" richColors />
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white z-[60] flex items-center justify-between px-4 shadow-lg border-b border-slate-800">
        <div className="font-bold text-lg text-blue-400">AinShongjog</div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-slate-800 rounded-lg">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-[100] bg-slate-900 text-white shadow-2xl transition-all duration-300 ease-in-out flex flex-col ${isCollapsed ? "md:w-20" : "md:w-64"} ${isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"}`}>
        
        {/* --- THE LOGO HEADER STYLE YOU REQUESTED --- */}
        <div className="hidden md:flex h-16 items-center justify-between px-4 border-b border-slate-800 shrink-0">
          {!isCollapsed ? (
            <Link href={getHomeLink()} className="text-xl font-bold flex items-center gap-2 hover:opacity-80 transition ml-2">
              <span className="text-blue-400">Ain</span>Shongjog
            </Link>
          ) : (
            <Link href={getHomeLink()} className="mx-auto font-bold text-blue-400 text-xl">AS</Link>
          )}
          
          <button 
            onClick={() => { setIsCollapsed(!isCollapsed); setShowNotifs(false); }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>
        
        {/* Mobile Header Spacer */}
        <div className="h-16 md:hidden"></div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto scrollbar-hide">
          {getLinks().map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            if (link.label === "Notifications") {
              return (
                <div key="nav-notif" className="relative">
                  <button
                    onClick={() => setShowNotifs(!showNotifs)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                      showNotifs ? "bg-blue-600 text-white shadow-lg" : "text-slate-300 hover:bg-slate-800"
                    } ${isCollapsed && !isMobileMenuOpen ? "justify-center" : ""}`}
                  >
                    <div className="relative shrink-0 flex items-center justify-center w-6">
                      <Icon size={20} className={showNotifs ? "text-white" : "group-hover:text-white"} />
                      {(link.badge ?? 0) > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-black text-white ring-2 ring-slate-900">
                          {link.badge! > 9 ? '9+' : link.badge} 
                        </span>
                      )}
                    </div>
                    {(!isCollapsed || isMobileMenuOpen) && <span className="font-medium text-sm">Notifications</span>}
                  </button>
                  
                  {showNotifs && (
                    <NotificationDropdown 
                      onClose={() => setShowNotifs(false)} 
                      userRole={user.role} 
                      onMarkRead={fetchUnreadCount}
                      isCollapsed={isCollapsed && !isMobileMenuOpen}
                    />
                  )}
                </div>
              );
            }

            return (
              <Link key={link.href} href={link.href} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-300 hover:bg-slate-800 hover:text-white"} ${isCollapsed && !isMobileMenuOpen ? "justify-center" : ""}`}>
                <div className="shrink-0 flex items-center justify-center w-6">
                   <Icon size={20} className={isActive ? "text-white" : "group-hover:text-white"} />
                </div>
                {(!isCollapsed || isMobileMenuOpen) && <span className="font-medium text-sm truncate">{link.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Footer: User & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className={`flex items-center gap-3 mb-4 ${isCollapsed && !isMobileMenuOpen ? "justify-center" : "px-2"}`}>
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shrink-0 text-white font-bold shadow-lg shadow-blue-900/30 uppercase">
              {user.firstName[0]}
            </div>
            {(!isCollapsed || isMobileMenuOpen) && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                <p className="text-[9px] text-slate-500 uppercase font-bold tracking-widest leading-tight">{user.role}</p>
              </div>
            )}
          </div>
          <button 
            onClick={handleLogout} 
            className={`flex w-full items-center gap-3 rounded-xl bg-red-500/10 py-2.5 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200 text-xs font-bold ${isCollapsed && !isMobileMenuOpen ? "justify-center px-0" : "px-4"}`}
          >
            <LogOut size={16} /> 
            {(!isCollapsed || isMobileMenuOpen) && "Logout"}
          </button>
        </div>
      </aside>

      {/* OVERLAY */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-slate-950/60 z-[80] md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />}

      {/* MAIN CONTENT */}
      <main className={`flex-1 p-4 md:p-10 overflow-y-auto h-screen transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"} pt-24 md:pt-10`}>
        {children}
      </main>
    </div>
  );
}