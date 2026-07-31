import "server-only"

import { importPKCS8, SignJWT } from "jose"

export async function createMuxPlaybackToken(
  playbackId: string,
  durationSeconds = 3600
) {
  const keyId = process.env.MUX_SIGNING_KEY_ID
  const encodedKey = process.env.MUX_PRIVATE_KEY
  if (!keyId || !encodedKey) return null

  const pem = Buffer.from(encodedKey, "base64").toString("utf8")
  const key = await importPKCS8(pem, "RS256")
  const expiresIn = Math.max(durationSeconds + 900, 3600)

  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256", kid: keyId })
    .setSubject(playbackId)
    .setAudience("v")
    .setIssuedAt()
    .setExpirationTime(`${expiresIn}s`)
    .sign(key)
}
