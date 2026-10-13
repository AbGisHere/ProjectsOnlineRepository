import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: path.join(__dirname) },
  // node-oracledb loads driver files at runtime; keep it out of the bundle.
  serverExternalPackages: ['oracledb'],
};

export default nextConfig;
