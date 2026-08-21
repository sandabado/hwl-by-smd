import Link from "next/link"
import {
  CircleCheck,
  Eye,
  ExternalLink,
  FilePenLine,
  Home,
  ImageIcon,
  LockKeyhole,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react"

import {
  AdminPageHeader,
  AdminPanel,
  PanelHeading,
  ReadOnlyButton,
  StatusPill,
} from "@/components/admin/admin-ui"
import { requireAdmin } from "@/lib/admin-auth"
import {
  getWebsiteEditorPreview,
  homepageFeatureLimits,
  type EditorialStatus,
  type SectionReadiness,
  type WebsiteEntryPreview,
} from "@/lib/site-content"
import {
  publishHomepageFeatureAction,
  saveHomepageFeatureDraftAction,
} from "./actions"
import { FeatureEditorForm } from "./feature-editor-form"

export const dynamic = "force-dynamic"

const readinessLabels: Record<SectionReadiness, string> = {
  ready: "Ready to review",
  "copy-draft": "Copy draft",
  "media-needed": "Media needed",
  "verification-needed": "Verification needed",
}

const readinessTones: Record<
  SectionReadiness,
  "positive" | "warning" | "quiet"
> = {
  ready: "positive",
  "copy-draft": "quiet",
  "media-needed": "warning",
  "verification-needed": "warning",
}

function WebsiteEntryCard({ entry }: { entry: WebsiteEntryPreview }) {
  const EntryIcon = entry.key === "homepage" ? Home : UserRound

  return (
    <AdminPanel className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#ddd6ca] pb-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#9d8464]/10 text-[#876947]">
            <EntryIcon className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-semibold tracking-[0.17em] text-[#8d7559] uppercase">
              {entry.path} · {entry.template.replaceAll("-", " ")}
            </p>
            <h2 className="mt-1 text-2xl font-medium text-[#273029]">
              {entry.title}
            </h2>
          </div>
        </div>
        <StatusPill tone="warning">Draft model</StatusPill>
      </div>

      <p className="mt-5 text-sm leading-6 text-[#687168]">
        {entry.description}
      </p>

      <ol className="mt-5 flex-1 space-y-2.5">
        {entry.sections.map((section, index) => (
          <li
            className="rounded-2xl border border-[#ddd7cc] bg-[#f8f4ed]/55 px-4 py-3.5"
            key={section.key}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[#273029]/7 text-[10px] font-semibold text-[#5e695f]">
                  {index + 1}
                </span>
                <p className="text-sm font-medium text-[#39443c]">
                  {section.label}
                </p>
              </div>
              <StatusPill tone={readinessTones[section.readiness]}>
                {readinessLabels[section.readiness]}
              </StatusPill>
            </div>
            <p className="mt-2 pl-10 text-xs leading-5 text-[#7a827a]">
              {section.summary}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#ddd6ca] pt-4">
        <p className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.14em] text-[#7d847d] uppercase">
          <LockKeyhole className="size-3.5" aria-hidden="true" />
          Layout system locked
        </p>
        <Link
          className="inline-flex min-h-9 items-center gap-2 rounded-full border border-[#d2cabd] bg-white/50 px-3.5 text-xs font-medium text-[#68563f] transition hover:bg-white/75"
          href={entry.path}
        >
          View current page
          <ExternalLink className="size-3" aria-hidden="true" />
        </Link>
      </div>
    </AdminPanel>
  )
}

export default async function AdminWebsitePage() {
  const access = await requireAdmin()
  const { workspace, issues, persistence } =
    await getWebsiteEditorPreview(access)
  const feature = workspace.featuredSlots[0]
  const media = workspace.mediaAssets[0]
  const featureStatus = feature.status as EditorialStatus
  const featurePublishIssues = issues
    .filter((issue) => issue.severity === "blocking")
    .map((issue) => `${issue.scope}: ${issue.message}`)
  const mediaReady =
    media.status === "ready" &&
    ["owned", "licensed", "permission-granted"].includes(media.rightsStatus) &&
    ["not-applicable", "not-required", "obtained"].includes(
      media.modelReleaseStatus
    )
  const allPublicationGatesClear =
    persistence.connected &&
    persistence.writable &&
    featurePublishIssues.length === 0

  return (
    <>
      <AdminPageHeader
        description="A structured home for the words, photographs, featured experiences, and publishing decisions that shape Shannon’s website."
        eyebrow="Website editor"
        title="Shape the public experience"
      >
        <ReadOnlyButton>
          <Eye className="mr-2 inline size-3.5" aria-hidden="true" />
          Preview draft
        </ReadOnlyButton>
      </AdminPageHeader>

      <AdminPanel className="mt-8 border-[#d7c6aa] bg-[#f5ead8]/75">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex max-w-2xl items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[#9d8464]/14 text-[#856846]">
              <LockKeyhole className="size-4" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#4e4335]">
                {persistence.connected
                  ? "Draft editing is connected. Publishing still honors every gate."
                  : "The workspace is visible. Publishing is intentionally locked."}
              </p>
              <p className="mt-1 text-xs leading-5 text-[#7a6b58]">
                {persistence.message} Published changes appear through the
                verified public read path when that connection is active.
              </p>
            </div>
          </div>
          <div className="grid gap-2 text-xs sm:grid-cols-3">
            <span className="rounded-xl border border-[#d8c9b2] bg-white/40 px-3 py-2 text-[#6d604f]">
              <strong className="block font-medium">Schema</strong>
              {persistence.connected ? "Connected" : "Prepared locally"}
            </span>
            <span className="rounded-xl border border-[#d8c9b2] bg-white/40 px-3 py-2 text-[#6d604f]">
              <strong className="block font-medium">Media</strong>
              {mediaReady ? "Ready" : "Approval needed"}
            </span>
            <span className="rounded-xl border border-[#d8c9b2] bg-white/40 px-3 py-2 text-[#6d604f]">
              <strong className="block font-medium">Writes</strong>
              {persistence.connected ? "Server guarded" : "Not activated"}
            </span>
          </div>
        </div>
      </AdminPanel>

      <section className="mt-8" aria-labelledby="website-pages-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] text-[#9d8464] uppercase">
              Structured pages
            </p>
            <h2
              className="mt-1 text-3xl font-medium text-[#273029]"
              id="website-pages-heading"
            >
              The spaces Shannon can shape
            </h2>
          </div>
          <p className="text-xs text-[#7a827a]">
            {workspace.entries.length} pages ·{" "}
            {workspace.entries.reduce(
              (total, entry) => total + entry.sections.length,
              0
            )}{" "}
            governed sections
          </p>
        </div>

        <div className="mt-5 grid items-start gap-5 2xl:grid-cols-2">
          {workspace.entries.map((entry) => (
            <WebsiteEntryCard entry={entry} key={entry.key} />
          ))}
        </div>
      </section>

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <AdminPanel id="homepage-feature-editor">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <PanelHeading
              detail="The homepage can feature LIFT now and another approved experience later without rebuilding its layout."
              eyebrow="Homepage feature"
              title="One deliberate story at a time"
            />
            <StatusPill
              tone={featureStatus === "published" ? "positive" : "warning"}
            >
              {featureStatus === "published" ? "Published" : "Draft"}
            </StatusPill>
          </div>

          <FeatureEditorForm
            feature={feature}
            limits={homepageFeatureLimits}
            media={media}
            persistence={persistence}
            publishAction={publishHomepageFeatureAction}
            publishBlockedReasons={featurePublishIssues}
            saveDraftAction={saveHomepageFeatureDraftAction}
          />
        </AdminPanel>

        <AdminPanel>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <PanelHeading
              detail="Media cannot become publishable until accessibility and provenance are explicit."
              eyebrow="Media library"
              title="Rights before reach"
            />
            <StatusPill tone={mediaReady ? "positive" : "warning"}>
              {mediaReady ? "Ready" : "Needs review"}
            </StatusPill>
          </div>

          <div className="mt-6 rounded-2xl border border-[#ddd6ca] bg-[#f8f4ed]/55 p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#9d8464]/10 text-[#876947]">
                <ImageIcon className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#3f4941]">
                  {media.title}
                </p>
                <p className="mt-1 truncate text-xs text-[#7b837b]">
                  {media.sourcePath}
                </p>
              </div>
            </div>
            <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
              <div className="rounded-xl bg-white/45 px-3 py-2.5">
                <dt className="text-[#8a9089]">Usage rights</dt>
                <dd className="mt-0.5 font-medium text-[#4f5b51] capitalize">
                  {media.rightsStatus.replaceAll("-", " ")}
                </dd>
              </div>
              <div className="rounded-xl bg-white/45 px-3 py-2.5">
                <dt className="text-[#8a9089]">Model release</dt>
                <dd className="mt-0.5 font-medium text-[#4f5b51] capitalize">
                  {media.modelReleaseStatus.replaceAll("-", " ")}
                </dd>
              </div>
              <div className="rounded-xl bg-white/45 px-3 py-2.5">
                <dt className="text-[#8a9089]">AI use</dt>
                <dd className="mt-0.5 font-medium text-[#4f5b51] capitalize">
                  {media.aiUsage.replaceAll("-", " ")}
                </dd>
              </div>
              <div className="rounded-xl bg-white/45 px-3 py-2.5">
                <dt className="text-[#8a9089]">Focal point</dt>
                <dd className="mt-0.5 font-medium text-[#4f5b51]">
                  {Math.round(media.focalPoint.x * 100)}% ×{" "}
                  {Math.round(media.focalPoint.y * 100)}%
                </dd>
              </div>
            </dl>
          </div>

          <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#727b73]">
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0 text-[#76876e]"
              aria-hidden="true"
            />
            Every future image records alt text, crop focus, photographer
            credit, rights, releases, and honest AI disclosure.
          </p>
        </AdminPanel>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <AdminPanel>
          <PanelHeading
            detail="The future workflow keeps private drafts separate from the live site."
            eyebrow="Publishing"
            title="Draft → preview → publish"
          />
          <ol className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              {
                title: "Draft",
                detail: "Shannon updates approved fields and media choices.",
                icon: FilePenLine,
              },
              {
                title: "Preview",
                detail: "Review phone, tablet, desktop, and accessibility.",
                icon: Eye,
              },
              {
                title: "Publish",
                detail: "Create a revision only after every gate passes.",
                icon: CircleCheck,
              },
            ].map(({ detail, icon: Icon, title }, index) => (
              <li
                className="rounded-2xl border border-[#ddd6ca] bg-[#f8f4ed]/50 p-4"
                key={title}
              >
                <span className="grid size-9 place-items-center rounded-full bg-[#273029]/7 text-[#5f695f]">
                  <Icon className="size-3.5" aria-hidden="true" />
                </span>
                <p className="mt-4 text-sm font-medium">
                  {index + 1}. {title}
                </p>
                <p className="mt-1 text-xs leading-5 text-[#7b837b]">
                  {detail}
                </p>
              </li>
            ))}
          </ol>
        </AdminPanel>

        <AdminPanel>
          <PanelHeading
            detail="These are readiness findings, not silent failures."
            eyebrow="Publication gates"
            title="Publication readiness"
          />
          <ul className="mt-6 space-y-3">
            {!persistence.connected ? (
              <li className="flex items-start gap-3 rounded-2xl border border-[#ddd6ca] bg-[#f8f4ed]/50 p-4">
                <LockKeyhole
                  className="mt-0.5 size-4 shrink-0 text-[#886944]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium">Database not migrated</p>
                  <p className="mt-1 text-xs leading-5 text-[#7b837b]">
                    The additive schema exists locally but has not been applied
                    to Supabase.
                  </p>
                </div>
              </li>
            ) : null}
            {issues.map((issue) => (
              <li
                className="flex items-start gap-3 rounded-2xl border border-[#ddd6ca] bg-[#f8f4ed]/50 p-4"
                key={`${issue.scope}-${issue.message}`}
              >
                <ShieldCheck
                  className="mt-0.5 size-4 shrink-0 text-[#886944]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium">{issue.scope}</p>
                  <p className="mt-1 text-xs leading-5 text-[#7b837b]">
                    {issue.message}
                  </p>
                </div>
              </li>
            ))}
            {!persistence.writable ? (
              <li className="flex items-start gap-3 rounded-2xl border border-[#ddd6ca] bg-[#f8f4ed]/50 p-4">
                <Save
                  className="mt-0.5 size-4 shrink-0 text-[#886944]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium">
                    Server writes not activated
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#7b837b]">
                    Every mutation re-checks administrator access and creates a
                    recoverable revision.
                  </p>
                </div>
              </li>
            ) : null}
            {allPublicationGatesClear ? (
              <li className="flex items-start gap-3 rounded-2xl border border-[#afbea9] bg-[#edf3ea] p-4">
                <CircleCheck
                  className="mt-0.5 size-4 shrink-0 text-[#5f7659]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-[#435741]">
                    Ready to publish
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#61705f]">
                    The feature, media, destination, and revision boundary have
                    passed their current checks.
                  </p>
                </div>
              </li>
            ) : null}
          </ul>
        </AdminPanel>
      </div>
    </>
  )
}
