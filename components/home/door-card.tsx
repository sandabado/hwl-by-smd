import Link from "next/link"

export function DoorCard({
  href,
  invitation,
  truth,
}: {
  href: string
  invitation: string
  truth: string
}) {
  return (
    <Link className="home-door" href={href}>
      <span className="home-door__invitation">{invitation}</span>
      <span className="home-door__truth">{truth}</span>
    </Link>
  )
}
