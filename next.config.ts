import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: { root: path.join(__dirname) },
  // node-postgres is a plain Node package; keep it out of the bundle.
  serverExternalPackages: ['pg'],
};

export default nextConfig;
