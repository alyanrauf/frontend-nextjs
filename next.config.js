/** @type {import('next').NextConfig} */

const backendUrl = process.env.BACKEND_URL || "http://localhost:3000";

console.log("🔧 [next.config] BACKEND_URL =", backendUrl);

const nextConfig = {
    async redirects() {
        return [
            {
                source: "/salon-admin/login",
                has: [{ type: "header", key: "sec-fetch-mode", value: "navigate" }],
                destination: "/login",
                permanent: false,
            },
            {
                source: "/salon-admin/dashboard",
                has: [{ type: "header", key: "sec-fetch-mode", value: "navigate" }],
                destination: "/dashboard",
                permanent: false,
            },
        ];
    },
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
        ];
    },
};

export default nextConfig;