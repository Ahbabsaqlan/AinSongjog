"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { formatDistanceToNow } from "date-fns";
import { Bell, Clock, X, Calendar, FileText, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  onClose: () => void;
  userRole: string;
  onMarkRead: () => void;
  isCollapsed: boolean;
}

export default function NotificationDropdown({ onClose, userRole, onMarkRead, isCollapsed }: Props) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } catch (e) { console.error("Notif error"); }
      finally { setLoading(false); }
    };
    fetchNotifs();
  }, []);

  const handleNotificationClick = async (n: any) => {
    if (!n.isRead) {
      api.patch(`/notifications/${n.id}/read`).catch(() => {});
      onMarkRead();
    }
    const role = userRole.toLowerCase();
    let path = `/dashboard/${role}`;
    if (n.type === "APPOINTMENT") path += `/appointments`;
    else if (n.type === "CASE" || n.type === "CASE_UPDATE") path += `/cases/${n.referenceId}`;

    onClose();
    router.push(path);
  };

  return (
    <>
      {/* Backdrop to close when clicking outside */}
      <div className="fixed inset-0 z-[110]" onClick={onClose} />

      <div 
        /* 
          Responsive Logic:
          - Mobile: Top-20, fixed margins (left-4 right-4), centered.
          - Desktop: Fixed left based on sidebar width, top-4.
        */
        style={{ 
          left: typeof window !== 'undefined' && window.innerWidth > 768 
            ? (isCollapsed ? '88px' : '264px') 
            : undefined 
        }}
        className="
          fixed z-[120] 
          top-20 md:top-4 
          left-4 right-4 md:right-auto md:left-auto
          w-auto md:w-[420px] 
          bg-white rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.3)] 
          border border-slate-200 overflow-hidden 
          animate-in slide-in-from-top-4 md:slide-in-from-left-4 duration-300
        "
      >
        {/* Header */}
        <div className="p-5 bg-white border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
               <Bell size={20} />
            </div>
            <h3 className="font-black text-slate-900 text-lg tracking-tight">Notifications</h3>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="max-h-[60vh] md:max-h-[500px] overflow-y-auto overflow-x-hidden">
          {loading ? (
            <div className="p-12 text-center text-sm font-bold text-slate-400 animate-pulse">Synchronizing...</div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center space-y-3">
               <AlertCircle size={40} className="mx-auto text-slate-200" />
               <p className="text-sm font-bold text-slate-400">No new updates found.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-5 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 flex gap-4 ${
                  !n.isRead ? "bg-blue-50/40 border-l-4 border-l-blue-600" : "pl-6 opacity-70"
                }`}
              >
                <div className={`mt-1 shrink-0 p-2.5 rounded-xl shadow-sm ${n.type === 'APPOINTMENT' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                  {n.type === 'APPOINTMENT' ? <Calendar size={18} /> : <FileText size={18} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug mb-1 ${!n.isRead ? "font-black text-slate-900" : "font-bold text-slate-600"}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{n.message}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={12} /> {formatDistanceToNow(new Date(n.createdAt))} ago
                    </span>
                    {!n.isRead && <Check size={14} className="text-blue-600 stroke-[3px]" />}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button onClick={onClose} className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.2em] transition-colors">
            Close Activity Feed
          </button>
        </div>
      </div>
    </>
  );
}