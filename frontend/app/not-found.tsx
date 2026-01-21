import Link from "next/link";
import { Gavel, ArrowLeft, Home } from "lucide-react";

export const metadata = {
    title: "404 - Not Found | AinShongjog",
  };

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Visual Icon */}
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 rotate-12 shadow-xl">
            <Gavel size={48} />
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white font-black px-2 py-1 rounded-lg text-xs shadow-lg">
            404
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          Matter Not Found
        </h1>
        <p className="text-slate-500 mb-10 leading-relaxed font-medium">
          The legal record or page you are looking for has been moved, archived, or never existed in our ecosystem.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link 
            href="/dashboard"
            className="flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
          >
            <Home size={18} />
            Return to Dashboard
          </Link>
          
          <Link 
            href="/"
            className="flex items-center justify-center gap-2 text-slate-500 py-3 font-bold hover:text-slate-800 transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Decorative Branding */}
      <div className="fixed bottom-8 text-slate-300 font-black tracking-[0.5em] text-xs uppercase pointer-events-none">
        AinShongjog Legal Ecosystem
      </div>
    </div>
  );
}