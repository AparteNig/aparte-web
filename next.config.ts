import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.eu-north-1.amazonaws.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "aparte-prod",
  project: "aparte-web",
});
