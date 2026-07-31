import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Whole Body OS | HWL by SMD",
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
