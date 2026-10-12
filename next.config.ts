import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Always render metadata in <head> instead of streaming it into <body>, so the
  // WordPress-controlled robots tag reaches every crawler on dynamic pages too.
  htmlLimitedBots: /.*/,
  images: {
    remotePatterns: [new URL("https://wpbacked.usananews.com.au/wp-content/uploads/**")],
  },
};

export default nextConfig;
