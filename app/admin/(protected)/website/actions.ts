"use server"

import { revalidatePath } from "next/cache"

import { requireAdmin } from "@/lib/admin-auth"
import {
  isWebsiteEditorSchemaUnavailableError,
  parseHomepageFeatureFormData,
  type FeatureFormState,
} from "@/lib/site-content"
import { createAdminClient } from "@/lib/supabase/server"

type PersistenceResult = {
  ok?: boolean
  code?: string
  revision?: number
}

const publicationGateMessages: Record<string, string> = {
  homepage_missing:
    "The homepage editor record is unavailable. Apply migration 007 before saving.",
  feature_missing:
    "The LIFT feature record is unavailable. Apply migration 007 before saving.",
  media_required: "Choose an approved LIFT video before publishing.",
  media_not_ready:
    "The LIFT video is still in review. Mark it ready only after every media check passes.",
  media_rights:
    "Confirm the LIFT video’s usage rights before publishing this feature.",
  media_rights_expired:
    "The LIFT video’s recorded usage rights have expired. Renew them before publishing.",
  media_release:
    "Resolve the LIFT video’s model-release review before publishing.",
  media_accessibility:
    "Add the required accessible description for the LIFT video before publishing.",
  media_audio_accessibility:
    "Add captions or a transcript for meaningful audio before publishing.",
  media_ai_disclosure:
    "Record an honest AI-use disclosure for the LIFT video before publishing.",
  media_source:
    "Connect a valid source file for the LIFT video before publishing.",
}

async function persistHomepageFeature(
  formData: FormData,
  publish: boolean
): Promise<FeatureFormState> {
  // Server Actions are public mutation endpoints. Authorization is repeated
  // here even though the surrounding route and layout are already protected.
  const access = await requireAdmin()

  if (access.source === "local-preview") {
    return {
      status: "unavailable",
      message:
        "Local preview is read-only. Sign in as a verified Supabase administrator to save website content.",
    }
  }

  const parsed = parseHomepageFeatureFormData(formData)
  if (!parsed.ok) {
    return {
      status: "error",
      message: "Review the highlighted fields and try again.",
      fieldErrors: parsed.fieldErrors,
    }
  }

  const supabase = createAdminClient()
  if (!supabase) {
    return {
      status: "unavailable",
      message:
        "Website persistence is not configured on this server. No changes were saved.",
    }
  }

  const { value } = parsed
  let response
  try {
    response = await supabase.rpc("persist_homepage_feature", {
      p_actor_id: access.userId,
      p_eyebrow: value.eyebrow,
      p_headline: value.headline,
      p_description: value.description,
      p_cta_label: value.ctaLabel,
      p_cta_href: value.ctaHref,
      p_publish: publish,
    })
  } catch {
    return {
      status: "unavailable",
      message:
        "The website editor could not reach its database. No changes were saved or published.",
    }
  }

  const { data, error } = response

  if (error) {
    if (isWebsiteEditorSchemaUnavailableError(error)) {
      return {
        status: "unavailable",
        message:
          "The website editor database is not active yet. Apply migration 007 before saving; no changes were made.",
      }
    }

    return {
      status: "error",
      message:
        "The website editor could not save this change. Nothing was published; try again or review the server logs.",
    }
  }

  const result = data as PersistenceResult | null
  if (!result?.ok) {
    const message = result?.code
      ? publicationGateMessages[result.code]
      : undefined

    return {
      status:
        result?.code === "homepage_missing" ||
        result?.code === "feature_missing"
          ? "unavailable"
          : "error",
      message:
        message ??
        "The website editor rejected this change without publishing anything.",
    }
  }

  revalidatePath("/admin/website")
  if (publish) revalidatePath("/")

  const revisionLabel =
    typeof result.revision === "number" ? ` Revision ${result.revision}.` : ""

  return {
    status: "success",
    message: publish
      ? `The LIFT feature passed its gates and was published.${revisionLabel}`
      : `Draft saved safely.${revisionLabel}`,
  }
}

export async function saveHomepageFeatureDraftAction(
  _previousState: FeatureFormState,
  formData: FormData
): Promise<FeatureFormState> {
  return persistHomepageFeature(formData, false)
}

export async function publishHomepageFeatureAction(
  _previousState: FeatureFormState,
  formData: FormData
): Promise<FeatureFormState> {
  return persistHomepageFeature(formData, true)
}
