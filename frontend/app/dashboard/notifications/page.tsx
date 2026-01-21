"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Bell, Check, Clock } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/notifications");
        setNotifications(res.data);
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  const markRead = async (id: string) => {
    await api.patch(`/notifications/${id}/read`);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <Bell className="text-blue-600" /> Notifications
      </h1>

      <div className="space-y-3">
        {notifications.length === 0 && <p className="text-slate-500">No notifications yet.</p>}
        
        {notifications.map((n) => (
          <div 
            key={n.id} 
            onClick={() => !n.isRead && markRead(n.id)}
            className={`p-4 rounded-xl border transition cursor-pointer flex gap-4 ${
              n.isRead ? "bg-white border-slate-200" : "bg-blue-50 border-blue-200 shadow-sm"
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              n.isRead ? "bg-slate-100 text-slate-400" : "bg-blue-100 text-blue-600"
            }`}>
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h4 className={`text-sm font-bold ${n.isRead ? "text-slate-700" : "text-slate-900"}`}>
                {n.title}
                {!n.isRead && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full inline-block" />}
              </h4>
              <p className="text-sm text-slate-600 mt-1">{n.message}</p>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Clock size={12} /> {new Date(n.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}