import { redirect } from "next/navigation"

export default function ConnectionRedirectPage() {
  redirect("/contact?notice=connection")
}
