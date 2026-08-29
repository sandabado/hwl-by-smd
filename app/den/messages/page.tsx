import { redirect } from "next/navigation"

export default function MessagesRedirectPage() {
  redirect("/contact?notice=connection")
}
