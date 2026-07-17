"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import QRCode from "react-qr-code";
import { toast } from "sonner";
import { RefreshCw, CheckCircle2, Smartphone, ShieldAlert } from "lucide-react";

export default function AdminWhatsappPage() {
  const [qr, setQr] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchQr = async () => {
    try {
      setLoading(true);
      const res = await api.get("/whatsapp/admin/qr");
      setIsConnected(res.data.isConnected);
      if (!res.data.isConnected && res.data.qr) {
        setQr(res.data.qr);
      }
    } catch (e) {
      toast.error("Failed to fetch system status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQr();
    // Poll every 10 seconds to check if connected
    const interval = setInterval(fetchQr, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
          <h1 className="text-3xl font-black text-white mb-2">System WhatsApp Bot</h1>
          <p className="text-blue-200">Connect the main bot account to send OTPs and notifications.</p>
        </div>

        <div className="p-10 flex flex-col items-center">
          {loading && !qr ? (
             <div className="animate-pulse flex flex-col items-center">
               <div className="h-64 w-64 bg-slate-100 rounded-xl mb-4"></div>
               <p className="text-slate-400 font-bold">Connecting to WhatsApp Server...</p>
             </div>
          ) : isConnected ? (
            <div className="text-center py-10">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">System Connected</h2>
              <p className="text-slate-500 mt-2">The bot is active and sending notifications.</p>
              <button 
                onClick={fetchQr} 
                className="mt-8 px-6 py-2 bg-slate-100 text-slate-600 rounded-lg font-bold text-sm hover:bg-slate-200 transition"
              >
                Check Status
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-inner mb-6">
                {qr && <QRCode value={qr} size={256} />}
              </div>
              
              <div className="max-w-md text-center space-y-4">
                <h3 className="text-lg font-bold text-slate-800">Scan with WhatsApp</h3>
                <ol className="text-left text-sm text-slate-600 space-y-2 list-decimal list-inside bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <li>Open WhatsApp on your phone</li>
                  <li>Tap <strong>Menu</strong> or <strong>Settings</strong> and select <strong>Linked Devices</strong></li>
                  <li>Tap on <strong>Link a Device</strong></li>
                  <li>Point your phone to this screen to capture the code</li>
                </ol>
                
                <button 
                  onClick={fetchQr}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                >
                  <RefreshCw size={18} /> Refresh QR Code
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Warning Footer */}
        <div className="bg-yellow-50 p-4 border-t border-yellow-100 flex items-start gap-3">
          <ShieldAlert className="text-yellow-600 shrink-0" />
          <p className="text-xs text-yellow-800 font-medium">
            <strong>Security Note:</strong> This account will be used to send OTPs to all users. Do not use a personal number. Use a dedicated business number.
          </p>
        </div>
      </div>
    </div>
  );
}