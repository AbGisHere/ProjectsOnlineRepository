import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The API's package-lock.json sits one level up; pin the app root here.
  turbopack: { root: path.join(__dirname) },
};

export default nextConfig;
