import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"

import { emailHtmlToText, renderBrandedEmail } from "../lib/email-branding.ts"

function readProjectFile(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8")
}

test("the shared email shell is accessible, image-independent, and email safe", () => {
  const email = renderBrandedEmail({
    bodyHtml: '<p style="margin:0">Your place is ready.</p>',
    bodyText: "Your place is ready.",
    cta: {
      href: "https://www.hwlbysmd.com/library?view=lift&source=email",
      label: "Open your ritual",
    },
    eyebrow: "Your LIFT ritual",
    finePrintHtml: "This link is for your personal use.",
    finePrintText: "This link is for your personal use.",
    heading: "Your ritual is ready.",
    preheader: "Open your LIFT video and guide.",
  })

  assert.match(email.html, /^<!doctype html>/)
  assert.match(email.html, /role="article"/)
  assert.match(email.html, /aria-roledescription="email"/)
  assert.match(email.html, /<table role="presentation"/)
  assert.match(email.html, /HWL by SMD/)
  assert.match(email.html, /Beauty · Movement · Ritual/)
  assert.match(email.html, /Open your ritual/)
  assert.match(email.html, /https:\/\/www\.hwlbysmd\.com/)
  assert.doesNotMatch(email.html, /<img\b|tracking|pixel|utm_/i)

  for (const phrase of [
    "HWL by SMD",
    "Beauty · Movement · Ritual",
    "Your ritual is ready.",
    "Your place is ready.",
    "Open your ritual: https://www.hwlbysmd.com/library?view=lift&source=email",
    "This link is for your personal use.",
    "hwlbysmd.com",
  ]) {
    assert.match(
      email.text,
      new RegExp(phrase.replace(/[.?*+^$[\]\\(){}|-]/g, "\\$&"))
    )
  }
})

test("dynamic email labels and links are escaped while HTML has plain-text parity", () => {
  const email = renderBrandedEmail({
    bodyHtml:
      '<p>Hello &amp; welcome.</p><p>Visit <a href="https://www.hwlbysmd.com/the-den">The Den</a>.</p>',
    bodyText:
      "Hello & welcome.\n\nVisit The Den: https://www.hwlbysmd.com/the-den.",
    cta: {
      href: 'https://www.hwlbysmd.com/?a=1&b="safe"',
      label: "Open <The Den>",
    },
    eyebrow: "Care & <ritual>",
    heading: 'Hello <Shannon> & "friends"',
  })

  assert.match(email.html, /Hello &lt;Shannon&gt; &amp; &quot;friends&quot;/)
  assert.match(email.html, /Care &amp; &lt;ritual&gt;/)
  assert.match(email.html, /Open &lt;The Den&gt;/)
  assert.match(email.html, /\?a=1&amp;b=&quot;safe&quot;/)
  assert.doesNotMatch(email.html, /<Shannon>|<The Den>/)
  assert.equal(
    emailHtmlToText(
      '<p>Hello &amp; welcome.</p><p><a href="https://www.hwlbysmd.com">Visit HWL</a></p>'
    ),
    "Hello & welcome.\nVisit HWL (https://www.hwlbysmd.com)"
  )
  assert.match(email.text, /Hello & welcome\./)
  assert.match(email.text, /Open <The Den>:/)
})

test("every direct Resend sender applies the shared brand shell and a text alternative", () => {
  for (const path of [
    "app/api/contact/route.ts",
    "lib/commerce/reconciliation-alert.ts",
    "lib/connection-engine/scheduler.ts",
    "lib/email.ts",
    "lib/relationships/health-scan.ts",
  ]) {
    const source = readProjectFile(path)
    assert.match(source, /renderBrandedEmail/)
    assert.match(source, /html:/)
    assert.match(source, /text:/)
  }
})
