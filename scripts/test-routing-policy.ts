import assert from "node:assert/strict"
import test from "node:test"

import nextConfig from "../next.config.ts"

async function configuredRedirects() {
  const redirects = nextConfig.redirects
  assert.equal(typeof redirects, "function")
  if (typeof redirects !== "function") {
    throw new Error("next.config.ts must define redirects()")
  }
  return redirects()
}

test("legacy /index requests redirect permanently before root-page resolution", async () => {
  const redirects = await configuredRedirects()
  const indexRedirects = redirects.filter(({ source }) => source === "/index")

  assert.deepEqual(indexRedirects, [
    {
      destination: "/",
      permanent: true,
      source: "/index",
    },
  ])
})

test("the canonical homepage never redirects back to /index", async () => {
  const redirects = await configuredRedirects()

  assert.equal(
    redirects.some(
      ({ destination, source }) => source === "/" && destination === "/index"
    ),
    false
  )
})
