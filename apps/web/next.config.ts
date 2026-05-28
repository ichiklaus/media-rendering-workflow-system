import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  /* config options here */
  turbopack: {
    root: require('path').join(__dirname, '../..'),
  },
  transpilePackages: ['@mrws-core/remotion-engine', '@mrws-core/templates'],
};

export default nextConfig;
