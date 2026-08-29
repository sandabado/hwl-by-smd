import { redirect } from "next/navigation"

export default function ConnectionHubPage() {
  redirect("/contact?notice=connection")
}
