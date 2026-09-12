import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 桌面开发预览与手机生产预览并行时，避免两端争用同一个构建目录。
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  allowedDevOrigins: ["10.0.33.39", "192.168.3.15"],
};

export default nextConfig;
