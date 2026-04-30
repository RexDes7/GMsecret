import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Devin's tunnel domain to talk to the dev server during testing.
  // Production builds ignore this list.
  allowedDevOrigins: ["*.devinapps.com"],
};

export default nextConfig;
