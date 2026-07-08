import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 开发环境代理到本地后端，生产环境由 NEXT_PUBLIC_API_URL 控制
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/api/:path*',
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
