import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    qualities: [75, 88],
  },
  turbopack: {
    root: import.meta.dirname,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
        ],
      },
      {
        source: "/video/hwl-whole-brand-hero-v3/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: "/experiences/beauty",
        destination: "/beauty",
        permanent: true,
      },
      {
        source: "/experiences/movement",
        destination: "/yoga",
        permanent: true,
      },
      {
        source: "/experiences/ritual",
        destination: "/tarot",
        permanent: true,
      },
      {
        source: "/experiences/retreats",
        destination: "/retreats",
        permanent: true,
      },
      {
        source: "/lift",
        destination: "/beauty/lift",
        permanent: true,
      },
      {
        source: "/body",
        destination: "/yoga",
        statusCode: 301,
      },
      {
        source: "/body/:path*",
        destination: "/yoga/:path*",
        statusCode: 301,
      },
      {
        source: "/being",
        destination: "/tarot",
        statusCode: 301,
      },
      {
        source: "/being/:path*",
        destination: "/tarot/:path*",
        statusCode: 301,
      },
    ]
  },
}

export default nextConfig
