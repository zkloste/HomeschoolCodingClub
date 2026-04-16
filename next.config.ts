import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
};
module.exports = {
  allowedDevOrigins: ['192.168.56.1', '192.168.1.196'],
}
export default nextConfig;
