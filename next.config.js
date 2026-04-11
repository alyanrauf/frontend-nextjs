/** @type {import('next').NextConfig} */

const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

console.log("🔧 [next.config] BACKEND_URL =", backendUrl);

const nextConfig = {
    async rewrites() {
        return [
            {
                source: "/salon-admin/:path*",
                destination: `${backendUrl}/salon-admin/:path*`,
            },
            {
                source: "/super-admin/:path*",
                destination: `${backendUrl}/super-admin/:path*`,
            },
            {
                source: "/widget/:path*",
                destination: `${backendUrl}/widget/:path*`,
            },
            {
                source: "/salon-config/:path*",
                destination: `${backendUrl}/salon-config/:path*`,
            },
            {
                source: "/webhooks/:path*",
                destination: `${backendUrl}/webhooks/:path*`,
            },
        ];
    },
};

export default nextConfig;