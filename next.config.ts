import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.eu-north-1.amazonaws.com",
      },
      {
        // Stock photography for the marketing and auth surfaces. Listing
        // imagery comes from S3 above; this is only for pages we art-direct
        // ourselves, and should give way to real Lagos interiors as the
        // catalogue grows.
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: "aparte-prod",
  project: "aparte-web",
});
