import type { JsonLdNode } from "@/lib/seo"

export function JsonLd({
  data,
  id,
}: {
  data: JsonLdNode | readonly JsonLdNode[]
  id?: string
}) {
  const serialized = JSON.stringify(data).replace(/</g, "\\u003c")

  return (
    <script
      dangerouslySetInnerHTML={{ __html: serialized }}
      id={id}
      type="application/ld+json"
    />
  )
}
