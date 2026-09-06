import "server-only"

import {
  sendCommerceRecoveryAlert,
  type CommerceRecoveryAlertInput,
  type CommerceRecoveryAlertResult,
} from "@/lib/commerce/reconciliation-alert"
import { hasAuthorizedCronBearer } from "@/lib/commerce/scheduled-reconciliation"

type PreviewAlertSmokeEnvironment = {
  readonly CRON_SECRET?: string
  readonly HWL_DEPLOYMENT_TARGET?: string
  readonly VERCEL?: string
  readonly VERCEL_ENV?: string
}

type PreviewAlertSender = (
  input: CommerceRecoveryAlertInput
) => Promise<CommerceRecoveryAlertResult>

type PreviewAlertSmokeDependencies = {
  environment?: PreviewAlertSmokeEnvironment
  now?: () => Date
  sendAlert?: PreviewAlertSender
}

function smokeResponse(kind: string, status = 200) {
  return Response.json(
    { kind },
    {
      headers: { "Cache-Control": "no-store" },
      status,
    }
  )
}

function isExactVercelPreview(environment: PreviewAlertSmokeEnvironment) {
  return (
    environment.VERCEL === "1" &&
    environment.VERCEL_ENV === "preview" &&
    environment.HWL_DEPLOYMENT_TARGET === "preview"
  )
}

function runtimeEnvironment(): PreviewAlertSmokeEnvironment {
  return {
    CRON_SECRET: process.env.CRON_SECRET,
    HWL_DEPLOYMENT_TARGET: process.env.HWL_DEPLOYMENT_TARGET,
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV,
  }
}

export async function handlePreviewCommerceAlertSmoke(
  request: Request,
  {
    environment = runtimeEnvironment(),
    now = () => new Date(),
    sendAlert = sendCommerceRecoveryAlert,
  }: PreviewAlertSmokeDependencies = {}
) {
  if (!isExactVercelPreview(environment)) {
    return smokeResponse("not_found", 404)
  }

  const cronSecret = environment.CRON_SECRET
  if (!cronSecret || cronSecret.length < 32) {
    return smokeResponse("not_configured", 503)
  }

  if (
    !hasAuthorizedCronBearer(request.headers.get("authorization"), cronSecret)
  ) {
    return smokeResponse("unauthorized", 401)
  }

  const { kind } = await sendAlert({
    alertsPending: 1,
    deploymentTarget: "preview",
    manualReview: 0,
    occurredAt: now(),
  })

  return smokeResponse(kind)
}
