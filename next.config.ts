import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 88],
  },
  turbopack: {
    root: import.meta.dirname,
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
