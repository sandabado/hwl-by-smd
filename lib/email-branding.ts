const BRAND_NAME = "HWL by SMD"
const BRAND_TAGLINE = "Beauty · Movement · Ritual"
const BRAND_URL = "https://www.hwlbysmd.com"

export type BrandedEmailCallToAction = {
  href: string
  label: string
}

export type BrandedEmailInput = {
  bodyHtml: string
  bodyText: string
  cta?: BrandedEmailCallToAction | null
  eyebrow?: string
  finePrintHtml?: string | null
  finePrintText?: string | null
  heading: string
  preheader?: string
}

export function escapeEmailHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function decodeEmailEntities(value: string) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#039;", "'")
    .replaceAll("&#39;", "'")
}

export function emailHtmlToText(value: string) {
  const withoutHiddenContent = value
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
  const withLinks = withoutHiddenContent.replace(
    /<a\b[^>]*\bhref=(?:"([^"]*)"|'([^']*)')[^>]*>([\s\S]*?)<\/a>/gi,
    (_match, doubleQuotedHref, singleQuotedHref, label) => {
      const href = doubleQuotedHref || singleQuotedHref || ""
      const linkLabel = String(label)
        .replace(/<[^>]+>/g, "")
        .trim()
      return linkLabel ? `${linkLabel} (${href})` : href
    }
  )

  return decodeEmailEntities(
    withLinks
      .replace(/<br\s*\/?\s*>/gi, "\n")
      .replace(/<li\b[^>]*>/gi, "\n• ")
      .replace(/<\/(?:div|h[1-6]|li|p|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
  )
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n[ \t]+/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

export function renderBrandedEmail({
  bodyHtml,
  bodyText,
  cta = null,
  eyebrow = "A note from Shannon",
  finePrintHtml = null,
  finePrintText = null,
  heading,
  preheader = heading,
}: BrandedEmailInput) {
  const safeBrandUrl = escapeEmailHtml(BRAND_URL)
  const safeHeading = escapeEmailHtml(heading)
  const safePreheader = escapeEmailHtml(preheader)
  const safeEyebrow = escapeEmailHtml(eyebrow)
  const ctaHtml = cta
    ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin:28px 0 6px"><tr><td bgcolor="#6f4a2f" style="border-radius:999px"><a href="${escapeEmailHtml(
        cta.href
      )}" style="border:1px solid #6f4a2f;border-radius:999px;color:#fffaf4;display:inline-block;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;letter-spacing:.01em;padding:13px 22px;text-decoration:none">${escapeEmailHtml(
        cta.label
      )}</a></td></tr></table>`
    : ""
  const finePrintSection = finePrintHtml
    ? `<tr><td style="border-top:1px solid #e5d8c7;padding:22px 0 0"><div style="color:#74675d;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6">${finePrintHtml}</div></td></tr>`
    : ""

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${safeHeading}</title></head><body style="background-color:#f4eee6;margin:0;padding:0"><div role="article" aria-roledescription="email" aria-label="${safeHeading}" lang="en"><div style="display:none!important;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all">${safePreheader}</div><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color:#f4eee6;width:100%"><tr><td align="center" style="padding:24px 12px"><table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;width:100%"><tr><td style="background-color:#eadfce;border:1px solid #dfd1be;border-bottom:0;border-radius:20px 20px 0 0;padding:25px 30px 22px"><p style="color:#3c3028;font-family:Georgia,'Times New Roman',serif;font-size:30px;font-weight:400;letter-spacing:-.02em;line-height:1.1;margin:0">${BRAND_NAME}</p><p style="color:#8a6545;font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:.22em;line-height:1.5;margin:8px 0 0;text-transform:uppercase">${BRAND_TAGLINE}</p></td></tr><tr><td style="background-color:#fffaf4;border-left:1px solid #dfd1be;border-right:1px solid #dfd1be;padding:36px 30px 32px"><p style="color:#8a6545;font-family:Arial,Helvetica,sans-serif;font-size:11px;font-weight:700;letter-spacing:.18em;line-height:1.4;margin:0 0 12px;text-transform:uppercase">${safeEyebrow}</p><h1 style="color:#312a25;font-family:Georgia,'Times New Roman',serif;font-size:32px;font-weight:400;letter-spacing:-.015em;line-height:1.18;margin:0 0 22px">${safeHeading}</h1><div style="color:#4f463f;font-family:Arial,Helvetica,sans-serif;font-size:16px;line-height:1.7">${bodyHtml}</div>${ctaHtml}<table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="width:100%;margin-top:30px">${finePrintSection}</table></td></tr><tr><td align="center" style="background-color:#f8f1e8;border:1px solid #dfd1be;border-radius:0 0 20px 20px;color:#74675d;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.6;padding:19px 24px"><a href="${safeBrandUrl}" style="color:#6f4a2f;font-weight:700;text-decoration:underline">hwlbysmd.com</a><br>HWL by SMD · Palm Springs, California</td></tr></table></td></tr></table></div></body></html>`

  const text = [
    BRAND_NAME,
    BRAND_TAGLINE,
    eyebrow,
    heading,
    bodyText.trim(),
    cta ? `${cta.label}: ${cta.href}` : null,
    finePrintText?.trim() || null,
    `hwlbysmd.com · ${BRAND_URL}`,
    "HWL by SMD · Palm Springs, California",
  ]
    .filter((section): section is string => Boolean(section))
    .join("\n\n")

  return { html, text }
}
