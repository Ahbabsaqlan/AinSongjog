import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-blue-900 to-slate-900 text-white">
      <h1 className="text-5xl font-bold mb-4">AinShongjog</h1>
      <p className="text-xl mb-8 text-gray-300">The Digital Legal Ecosystem for Bangladesh</p>
      
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="px-6 py-3 bg-transparent border border-white rounded-lg hover:bg-white hover:text-blue-900 transition"
        >
          Login
        </Link>
        <Link 
          href="/signup" 
          className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-500 transition font-semibold"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}