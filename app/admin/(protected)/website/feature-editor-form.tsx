"use client"

import { useActionState, useState } from "react"
import {
  CircleCheck,
  ImageIcon,
  LoaderCircle,
  LockKeyhole,
  Save,
  Send,
  ShieldCheck,
} from "lucide-react"

type FeatureFieldName =
  "eyebrow" | "headline" | "description" | "ctaLabel" | "ctaHref"

export interface FeatureEditorValue {
  eyebrow: string
  headline: string
  description: string
  ctaLabel: string
  ctaHref: string
  status: "draft" | "review" | "published" | "archived"
}

export interface FeatureEditorActionState {
  status: "idle" | "success" | "error" | "unavailable"
  message: string
  fieldErrors?: Partial<Record<FeatureFieldName, string[]>>
}

export type FeatureEditorAction = (
  previousState: FeatureEditorActionState,
  formData: FormData
) => Promise<FeatureEditorActionState>

interface FeatureEditorFormProps {
  feature: FeatureEditorValue
  limits: Record<FeatureFieldName, number>
  media: {
    title: string
    status: "draft" | "review" | "ready" | "archived"
    sourcePath: string | null
  }
  persistence: {
    connected: boolean
    writable: boolean
    message: string
  }
  publishBlockedReasons: readonly string[]
  saveDraftAction?: FeatureEditorAction
  publishAction?: FeatureEditorAction
}

const initialActionState: FeatureEditorActionState = {
  status: "idle",
  message: "",
}

function unavailableAction(): Promise<FeatureEditorActionState> {
  return Promise.resolve({
    status: "unavailable",
    message:
      "Editing is not connected yet. The current public feature has not changed.",
  })
}

function FieldError({
  errors,
  id,
}: {
  errors?: readonly string[]
  id: string
}) {
  if (!errors?.length) return null

  return (
    <span className="mt-1.5 block text-xs leading-5 text-[#8b493e]" id={id}>
      {errors[0]}
    </span>
  )
}

function actionMessageTone(status: FeatureEditorActionState["status"]) {
  if (status === "success") {
    return "border-[#aebda9] bg-[#edf3ea] text-[#4f684d]"
  }
  if (status === "error") {
    return "border-[#d9b7af] bg-[#f7ebe8] text-[#7d463e]"
  }
  return "border-[#dacdbb] bg-[#f5ede0] text-[#74644f]"
}

const inputClassName =
  "min-h-11 w-full rounded-xl border border-[#d3ccc0] bg-white/70 px-3.5 py-2.5 text-sm leading-6 text-[#38433a] outline-none transition placeholder:text-[#9ca19c] focus:border-[#809176] focus:ring-3 focus:ring-[#809176]/15 disabled:cursor-not-allowed disabled:bg-[#f3efe8]/75 disabled:text-[#717971] aria-invalid:border-[#b8796f] aria-invalid:ring-[#b8796f]/15"

export function FeatureEditorForm({
  feature,
  limits,
  media,
  persistence,
  publishBlockedReasons,
  saveDraftAction,
  publishAction,
}: FeatureEditorFormProps) {
  const canSave =
    persistence.connected && persistence.writable && Boolean(saveDraftAction)
  const canPublish =
    canSave && Boolean(publishAction) && publishBlockedReasons.length === 0

  const [saveState, saveFormAction, saving] = useActionState(
    saveDraftAction ?? unavailableAction,
    initialActionState
  )
  const [publishState, publishFormAction, publishing] = useActionState(
    publishAction ?? unavailableAction,
    initialActionState
  )
  const [lastIntent, setLastIntent] = useState<"save" | "publish">("save")

  const fieldErrors =
    lastIntent === "publish" ? publishState.fieldErrors : saveState.fieldErrors
  const busy = saving || publishing
  const currentStatus =
    lastIntent === "publish" && publishState.status === "success"
      ? "Published"
      : lastIntent === "save" && saveState.status === "success"
        ? "Draft saved"
        : feature.status === "published"
          ? "Published"
          : feature.status === "review"
            ? "In review"
            : "Draft"

  return (
    <form action={saveFormAction} className="mt-6">
      <input name="slot" type="hidden" value="homepage.primary-feature" />
      <input name="eyebrow" type="hidden" value={feature.eyebrow} />
      <input name="ctaLabel" type="hidden" value={feature.ctaLabel} />

      <div className="grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <aside
          aria-labelledby="feature-media-gate-heading"
          className="self-start rounded-[1.25rem] border border-[#d6cec0] bg-[#f4efe6]/70 p-4"
        >
          <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-[#c9bead] bg-[#273029]/5 p-5 text-center">
            <div>
              <span className="mx-auto grid size-11 place-items-center rounded-full bg-[#273029]/8 text-[#5e685f]">
                <ImageIcon className="size-4" aria-hidden="true" />
              </span>
              <h3
                className="mt-3 text-sm font-medium text-[#465048]"
                id="feature-media-gate-heading"
              >
                {media.title}
              </h3>
              <p className="mt-1 text-[11px] leading-5 break-all text-[#7b837b]">
                {media.sourcePath ?? "No media source attached"}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-[#d8c9b4] bg-white/45 p-3">
            <LockKeyhole
              className="mt-0.5 size-3.5 shrink-0 text-[#866744]"
              aria-hidden="true"
            />
            <div>
              <p className="text-xs font-medium text-[#554b3d]">
                Media change is gated
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#786d5e]">
                The door does not display this media directly, but publication
                still verifies the LIFT source, rights, release, and
                accessibility record before the invitation can go live.
              </p>
              <p className="mt-2 text-[10px] font-semibold tracking-[0.14em] text-[#876844] uppercase">
                Media status · {media.status}
              </p>
            </div>
          </div>
        </aside>

        <fieldset
          aria-describedby={
            !canSave ? "feature-editor-availability" : undefined
          }
          className="min-w-0"
          disabled={!canSave || busy}
        >
          <legend className="sr-only">Homepage LIFT door copy</legend>

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ddd6ca] pb-4">
            <div>
              <p className="text-xs font-medium text-[#414b43]">
                Homepage LIFT door
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#7b837b]">
                Edit the invitation and product truth. The LIFT destination and
                component layout remain locked.
              </p>
            </div>
            <span className="inline-flex min-h-7 items-center rounded-full bg-[#ad8659]/13 px-2.5 text-[10px] font-semibold text-[#876440]">
              {currentStatus}
            </span>
          </div>

          <div className="mt-4 space-y-4">
            <div>
              <label
                className="mb-1.5 block text-[10px] font-semibold tracking-[0.15em] text-[#747d75] uppercase"
                htmlFor="feature-headline"
              >
                Door invitation
              </label>
              <input
                aria-describedby={
                  fieldErrors?.headline?.length
                    ? "feature-headline-error"
                    : undefined
                }
                aria-invalid={
                  Boolean(fieldErrors?.headline?.length) || undefined
                }
                className={inputClassName}
                defaultValue={feature.headline}
                id="feature-headline"
                maxLength={limits.headline}
                name="headline"
                required
                type="text"
              />
              <FieldError
                errors={fieldErrors?.headline}
                id="feature-headline-error"
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-[10px] font-semibold tracking-[0.15em] text-[#747d75] uppercase"
                htmlFor="feature-description"
              >
                Door truth
              </label>
              <textarea
                aria-describedby={
                  fieldErrors?.description?.length
                    ? "feature-description-error"
                    : undefined
                }
                aria-invalid={
                  Boolean(fieldErrors?.description?.length) || undefined
                }
                className={`${inputClassName} min-h-24 resize-y`}
                defaultValue={feature.description}
                id="feature-description"
                maxLength={limits.description}
                name="description"
                rows={3}
              />
              <FieldError
                errors={fieldErrors?.description}
                id="feature-description-error"
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-[10px] font-semibold tracking-[0.15em] text-[#747d75] uppercase"
                htmlFor="feature-cta-href"
              >
                Door destination
              </label>
              <input
                aria-describedby={
                  fieldErrors?.ctaHref?.length
                    ? "feature-cta-href-hint feature-cta-href-error"
                    : "feature-cta-href-hint"
                }
                aria-invalid={
                  Boolean(fieldErrors?.ctaHref?.length) || undefined
                }
                autoCapitalize="none"
                autoCorrect="off"
                className={inputClassName}
                defaultValue={feature.ctaHref}
                id="feature-cta-href"
                maxLength={limits.ctaHref}
                name="ctaHref"
                placeholder="/beauty/lift"
                readOnly
                required
                spellCheck={false}
                type="text"
              />
              <span
                className="mt-1.5 block text-[11px] leading-5 text-[#858c85]"
                id="feature-cta-href-hint"
              >
                Canonical LIFT destination, locked for consistent navigation and
                search indexing.
              </span>
              <FieldError
                errors={fieldErrors?.ctaHref}
                id="feature-cta-href-error"
              />
            </div>
          </div>
        </fieldset>
      </div>

      <div className="mt-5 border-t border-[#ddd6ca] pt-5">
        {!canSave && (
          <div
            className="flex items-start gap-2.5 rounded-xl border border-[#d8c9b4] bg-[#f6eee1] p-3 text-xs leading-5 text-[#6f604d]"
            id="feature-editor-availability"
            role="status"
          >
            <LockKeyhole
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            <p>
              <strong className="font-medium">Editing unavailable.</strong>{" "}
              {persistence.message} These controls unlock only after the
              editorial migration and authorized server writes are connected.
            </p>
          </div>
        )}

        {canSave && publishBlockedReasons.length > 0 && (
          <div
            className="flex items-start gap-2.5 rounded-xl border border-[#d8c9b4] bg-[#f6eee1] p-3 text-xs leading-5 text-[#6f604d]"
            id="feature-publish-gates"
          >
            <ShieldCheck
              className="mt-0.5 size-3.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">Draft saving is ready.</p>
              <p className="mt-0.5">
                Publish stays locked until {publishBlockedReasons.length}{" "}
                {publishBlockedReasons.length === 1
                  ? "gate clears"
                  : "gates clear"}
                .
              </p>
            </div>
          </div>
        )}

        <p
          className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-[#7b837b]"
          id="feature-public-boundary"
        >
          <ShieldCheck
            className="mt-0.5 size-3.5 shrink-0 text-[#76876e]"
            aria-hidden="true"
          />
          Publish approves the governed editor record. Published changes appear
          through the verified public read path when that connection is active.
        </p>

        <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-5 flex-1" aria-live="polite" aria-atomic="true">
            {lastIntent === "save" && saveState.status !== "idle" && (
              <p
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${actionMessageTone(saveState.status)}`}
              >
                {saveState.status === "success" && (
                  <CircleCheck className="size-3.5" aria-hidden="true" />
                )}
                {saveState.message}
              </p>
            )}
            {lastIntent === "publish" && publishState.status !== "idle" && (
              <p
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${actionMessageTone(publishState.status)}`}
              >
                {publishState.status === "success" && (
                  <CircleCheck className="size-3.5" aria-hidden="true" />
                )}
                {publishState.message}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              aria-describedby={
                !canSave ? "feature-editor-availability" : undefined
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#c9c1b4] bg-white/60 px-4 text-xs font-medium text-[#59645b] transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#788a70] disabled:cursor-not-allowed disabled:opacity-55"
              disabled={!canSave || busy}
              onClick={() => setLastIntent("save")}
              type="submit"
            >
              {saving ? (
                <LoaderCircle
                  className="size-3.5 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Save className="size-3.5" aria-hidden="true" />
              )}
              {saving ? "Saving…" : "Save draft"}
            </button>
            <button
              aria-describedby={
                !canSave
                  ? "feature-editor-availability"
                  : publishBlockedReasons.length > 0
                    ? "feature-publish-gates"
                    : "feature-public-boundary"
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#273029] px-4 text-xs font-medium text-white transition hover:bg-[#344039] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#56685a] disabled:cursor-not-allowed disabled:bg-[#7f877f] disabled:opacity-60"
              disabled={!canPublish || busy}
              formAction={publishFormAction}
              onClick={() => setLastIntent("publish")}
              title={
                canPublish
                  ? "Publish this homepage feature"
                  : (publishBlockedReasons[0] ??
                    "Publishing activates after editorial persistence is connected.")
              }
              type="submit"
            >
              {publishing ? (
                <LoaderCircle
                  className="size-3.5 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
              ) : (
                <Send className="size-3.5" aria-hidden="true" />
              )}
              {publishing ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
