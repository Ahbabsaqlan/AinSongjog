export default function GlobalLoading() {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900">
        {/* Branded Spinner */}
        <div className="relative flex items-center justify-center">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500"></div>
          <div className="absolute font-black text-blue-400 text-xs tracking-tighter">AS</div>
        </div>
        
        {/* Loading Text */}
        <h2 className="mt-6 text-xl font-bold text-white tracking-widest uppercase opacity-80">
          AinShongjog
        </h2>
        <p className="mt-2 text-slate-500 text-sm font-medium animate-pulse">
          Securing your legal connection...
        </p>
      </div>
    );
  }