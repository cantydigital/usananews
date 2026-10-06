import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [new URL("https://wpbacked.usananews.com.au/wp-content/uploads/**")],
  },
};

export default nextConfig;
