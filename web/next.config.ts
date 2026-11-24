import type { NextConfig } from "next";
import path from "node:path";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL)
  : null;

const nextConfig: NextConfig = {
  // Cloud Run 用イメージ（Dockerfile.prod）で .next/standalone を使うため
  output: 'standalone',
  // モノレポのルートを起点に依存ファイルを集める。
  // standalone の出力は .next/standalone/web/server.js になる（Dockerfile.prod はこの配置を前提にしている）
  outputFileTracingRoot: path.join(__dirname, ".."),
  images: {
    remotePatterns: supabaseUrl
      ? [
          {
            protocol: supabaseUrl.protocol.replace(':', '') as 'http' | 'https',
            hostname: supabaseUrl.hostname,
            port: supabaseUrl.port || undefined,
            pathname: '/storage/v1/object/public/**',
          },
        ]
      : [],
  },
};

export default nextConfig;
