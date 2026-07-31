import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, HelpCircle, ImageIcon } from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  EmptyState,
  FieldPreview,
  PanelHeading,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { adminProducts } from "@/lib/admin-preview-data"
import { requireAdmin } from "@/lib/admin-auth"

export const dynamic = "force-dynamic"

export default async function AdminProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdmin()
  const { id } = await params
  const product = adminProducts.find((item) => item.id === id)

  if (!product) notFound()

  return (
    <>
      <Link
        className="mb-5 inline-flex items-center gap-2 text-xs font-medium text-[#756147] underline-offset-4 hover:underline"
        href="/admin/store"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Store
      </Link>
      <AdminPageHeader
        description="Review the offer, member access, and payment readiness before making any catalog change."
        eyebrow="Read-only product"
        title={product.name}
      >
        <ReadOnlyButton>Save draft</ReadOnlyButton>
        <ReadOnlyButton>Publish</ReadOnlyButton>
      </AdminPageHeader>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminPanel>
          <div className="flex items-center justify-between gap-3">
            <PanelHeading eyebrow="Offer" title="Product details" />
            <StatusPill tone="warning">{product.status}</StatusPill>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <FieldPreview label="Name" value={product.name} />
            <FieldPreview label="Price" value={product.price} />
            <FieldPreview label="Type" value={product.cadence} />
            <FieldPreview label="Sales" value={product.sales} />
            <div className="sm:col-span-2">
              <FieldPreview
                label="Access delivered"
                multiline
                value={product.access}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldPreview
                label="Description"
                multiline
                value="Final production copy will explain what the customer receives, how access is delivered, and any renewal terms in plain language."
              />
            </div>
          </div>
        </AdminPanel>

        <div className="space-y-5">
          <AdminPanel>
            <PanelHeading eyebrow="Cover" title="Product artwork" />
            <div className="mt-5">
              <EmptyState
                description="No product image is uploaded through the preview."
                icon={ImageIcon}
                title="Artwork placeholder"
              />
            </div>
          </AdminPanel>
          <AdminPanel>
            <PanelHeading eyebrow="Questions" title="Product FAQ" />
            <div className="mt-5">
              <EmptyState
                description="FAQs will be added through a validated content workflow before editing is enabled."
                icon={HelpCircle}
                title="No product-specific FAQs"
              />
            </div>
          </AdminPanel>
        </div>
      </div>
    </>
  )
}
