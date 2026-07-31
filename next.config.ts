import type { NextConfig } from "next"

const nextConfig: NextConfig = {
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
        destination: "/body",
        permanent: true,
      },
      {
        source: "/experiences/ritual",
        destination: "/being",
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
    ]
  },
}

export default nextConfig
