import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Eye, ImageIcon } from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  FieldPreview,
  PanelHeading,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminArticles } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminArticleEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const article = adminArticles.find((item) => item.id === id)

  if (!article) notFound()

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-[#756147] underline-offset-4 hover:underline"
        href="/admin/content"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Journal library
      </Link>
      <AdminPageHeader
        description="A calm, distraction-free preview of the future writing and publishing workflow."
        eyebrow="Read-only editor"
        title={article.title}
      >
        <ReadOnlyButton>
          <Eye className="mr-2 inline size-3.5" aria-hidden="true" />
          Preview
        </ReadOnlyButton>
        <ReadOnlyButton>Save draft</ReadOnlyButton>
        <ReadOnlyButton>Publish</ReadOnlyButton>
      </AdminPageHeader>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <AdminPanel>
          <div className="flex items-center justify-between gap-3">
            <PanelHeading eyebrow="Story" title="Article body" />
            <StatusPill tone="warning">{article.status}</StatusPill>
          </div>
          <div className="mt-5 space-y-4">
            <FieldPreview label="Title" value={article.title} />
            <FieldPreview
              label="Excerpt"
              multiline
              value="A considered opening that gives readers a reason to pause, settle, and continue into the full reflection."
            />
            <FieldPreview
              label="Body"
              multiline
              value="The production editor will live here. It will support intentional formatting, accessible headings, links, pull quotes, and image captions without exposing raw HTML."
            />
          </div>
        </AdminPanel>

        <div className="space-y-5">
          <AdminPanel>
            <PanelHeading eyebrow="Publishing" title="Article settings" />
            <div className="mt-5 space-y-4">
              <FieldPreview label="Category" value={article.category} />
              <FieldPreview label="Publish date" value={article.date} />
              <FieldPreview label="Status" value={article.status} />
            </div>
          </AdminPanel>
          <AdminPanel>
            <PanelHeading eyebrow="Cover" title="Featured image" />
            <div className="mt-5">
              <EmptyState
                description="Upload remains disabled until a protected media-storage workflow is connected."
                icon={ImageIcon}
                title="No cover selected"
              />
            </div>
          </AdminPanel>
          <AdminPanel>
            <PanelHeading eyebrow="Search" title="SEO preview" />
            <div className="mt-5 space-y-4">
              <FieldPreview label="Meta title" value={article.title} />
              <FieldPreview
                label="Meta description"
                multiline
                value="A concise, search-friendly description will be written before publication."
              />
            </div>
          </AdminPanel>
        </div>
      </div>
    </>
  )
}
