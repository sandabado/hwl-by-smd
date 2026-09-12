import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Reset Password | HWL by SMD",
  description:
    "Request a secure password reset link for your HWL by SMD account.",
}

export default function ResetPasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}
