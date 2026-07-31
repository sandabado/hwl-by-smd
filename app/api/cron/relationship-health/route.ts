import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"

import { runRelationshipHealthScan } from "@/lib/relationships/health-scan"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

function secretsMatch(value: string, expected: string) {
  const valueBuffer = Buffer.from(value)
  const expectedBuffer = Buffer.from(expected)

  return (
    valueBuffer.length === expectedBuffer.length &&
    timingSafeEqual(valueBuffer, expectedBuffer)
  )
}

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Relationship health scans are not configured." },
      { status: 503 }
    )
  }

  const authorization = request.headers.get("authorization")
  const suppliedSecret = authorization?.startsWith("Bearer ")
    ? authorization.slice(7)
    : ""
  if (!suppliedSecret || !secretsMatch(suppliedSecret, cronSecret)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const result = await runRelationshipHealthScan()
  if (result.kind === "unavailable") {
    return NextResponse.json(
      { error: "The relationship database is not configured." },
      { status: 503 }
    )
  }
  if (result.kind === "error") {
    return NextResponse.json(
      { error: "The relationship health scan could not be completed." },
      { status: 500 }
    )
  }

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" },
  })
}
