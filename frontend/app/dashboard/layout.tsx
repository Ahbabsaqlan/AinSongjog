"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LogOut, User, FileText, Gavel, ShieldCheck, Search } from "lucide-react";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (!isMounted || !user) return null; // Prevent hydration mismatch

  // Define Links based on Role
  const getLinks = () => {
    if (user.role === "ADMIN") {
      return [
        { href: "/dashboard/admin", label: "Pending Approvals", icon: ShieldCheck },
      ];
    }
    if (user.role === "LAWYER") {
      return [
        { href: "/dashboard/lawyer", label: "My Cases", icon: Gavel },
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
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-slate-700">
          AinShongjog
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {getLinks().map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="mb-4 px-4">
            <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg bg-red-600/10 px-4 py-2 text-red-500 hover:bg-red-600 hover:text-white transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}