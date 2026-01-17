/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // 1. Determine where to send the request
    // If running locally, this defaults to localhost:4000
    // If on Vercel, we will set this env var to the Render URL
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

    console.log(`Proxying /api requests to: ${backendUrl}`);

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`, // Dynamic Destination
      },
    ];
  },
};

export default nextConfig;