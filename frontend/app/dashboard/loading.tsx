export default function DashboardContentLoading() {
    return (
      <div className="flex h-[70vh] w-full flex-col items-center justify-center">
        {/* Modern Wave Loader */}
        <div className="flex items-center gap-1.5 mb-4">
          <div className="w-1.5 h-8 bg-blue-600 rounded-full animate-[bounce_1s_infinite_0ms]"></div>
          <div className="w-1.5 h-12 bg-blue-500 rounded-full animate-[bounce_1s_infinite_200ms]"></div>
          <div className="w-1.5 h-8 bg-blue-400 rounded-full animate-[bounce_1s_infinite_400ms]"></div>
        </div>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em]">
          Synchronizing Data
        </p>
      </div>
    );
  }