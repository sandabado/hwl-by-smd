import "server-only"

import {
  type AdminAccess,
  requireSuperAdmin,
  type SuperAdminAccess,
} from "@/lib/admin-auth"
import {
  CANONICAL_LAUNCH_AUTHORITY,
  getCanonicalSiteUrl,
  getCommerceDeploymentTarget,
  isCanonicalSupabasePublicConfiguration,
} from "@/lib/commerce/launch-authority"
import { createClient } from "@/lib/supabase/server"

export const GHOSTHAND_SUPER_ADMIN_EMAIL = "admin@ghosthand.studio"
export const SHANNON_ADMIN_EMAIL = "shannon@hwlbysmd.com"

export const SHANNON_ADMIN_HANDOFF = {
  grant: {
    confirmationPhrase: "GRANT SHANNON ADMINISTRATOR",
    expectedRole: "member",
    newRole: "administrator",
  },
  revoke: {
    confirmationPhrase: "REVOKE SHANNON ADMINISTRATOR",
    expectedRole: "administrator",
    newRole: "member",
  },
} as const

type HandoffMode = keyof typeof SHANNON_ADMIN_HANDOFF
type RuntimeEnvironment = Readonly<Record<string, string | undefined>>

const APPROVAL_REFERENCE_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/#-]{7,119}$/
const SECRET_SHAPED_REFERENCE_PATTERN =
  /(?:(?:sk|rk)_(?:live|test)_|whsec_|re_|sb_(?:secret|publishable)_|eyJ|gh[pousr]_|github_pat_|vercel_(?:token|access_token)|bearer[:_-])/i
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
const GIT_SHA_PATTERN = /^[0-9a-f]{40}$/

export type ShannonAdminHandoffConfig = {
  actorUserId: string
  approvalReference: string
  confirmationPhrase: string
  expectedGitSha: string
  expectedRole: "member" | "administrator"
  mode: HandoffMode
  newRole: "member" | "administrator"
  targetUserId: string
}

export type ShannonAdminHandoffState = {
  status: "idle" | "success" | "error" | "unavailable" | "unverified"
  message: string
}

type TargetState = {
  email: string
  id: string
  isAdmin: boolean
  role: "member" | "administrator" | "super_admin" | "invalid"
}

type RoleChangeInput = {
  approvalReference: string
  expectedRole: "member" | "administrator"
  newRole: "member" | "administrator"
  targetEmail: typeof SHANNON_ADMIN_EMAIL
  targetUserId: string
}

type RoleChangeResult = {
  isAdmin: boolean
  role: string
  targetUserId: string
}

export type ShannonAdminHandoffDependencies = {
  authorizeSuperAdmin: () => Promise<SuperAdminAccess>
  changeRole: (input: RoleChangeInput) => Promise<RoleChangeResult | null>
  environment: RuntimeEnvironment
  readTarget: (config: ShannonAdminHandoffConfig) => Promise<TargetState | null>
}

function exactValue(environment: RuntimeEnvironment, key: string) {
  const value = environment[key] ?? ""
  return value === value.trim() ? value : ""
}

function isApprovalReference(value: string) {
  return (
    APPROVAL_REFERENCE_PATTERN.test(value) &&
    !SECRET_SHAPED_REFERENCE_PATTERN.test(value)
  )
}

export function getShannonAdminHandoffConfig(
  environment: RuntimeEnvironment = process.env
): ShannonAdminHandoffConfig | null {
  const mode = exactValue(environment, "ADMIN_SHANNON_HANDOFF_MODE")
  if (mode !== "grant" && mode !== "revoke") return null

  const actorUserId = exactValue(
    environment,
    "ADMIN_SHANNON_HANDOFF_ACTOR_USER_ID"
  )
  const targetUserId = exactValue(
    environment,
    "ADMIN_SHANNON_HANDOFF_TARGET_USER_ID"
  )
  const approvalReference = exactValue(
    environment,
    "ADMIN_SHANNON_HANDOFF_APPROVAL_REFERENCE"
  )
  const expectedGitSha = exactValue(
    environment,
    "ADMIN_SHANNON_HANDOFF_EXPECTED_GIT_SHA"
  )

  if (
    getCommerceDeploymentTarget(environment) !== "production" ||
    getCanonicalSiteUrl(environment) !==
      CANONICAL_LAUNCH_AUTHORITY.production.siteUrl ||
    !isCanonicalSupabasePublicConfiguration(environment) ||
    exactValue(environment, "COMMERCE_SALES_READY") !== "false" ||
    !UUID_PATTERN.test(actorUserId) ||
    !UUID_PATTERN.test(targetUserId) ||
    actorUserId === targetUserId ||
    !isApprovalReference(approvalReference) ||
    !GIT_SHA_PATTERN.test(expectedGitSha) ||
    exactValue(environment, "VERCEL_GIT_COMMIT_SHA") !== expectedGitSha
  ) {
    return null
  }

  return {
    actorUserId,
    approvalReference,
    expectedGitSha,
    mode,
    targetUserId,
    ...SHANNON_ADMIN_HANDOFF[mode],
  }
}

export function isShannonAdminHandoffOperator(
  access: Extract<AdminAccess, { source: "supabase" }>,
  config: ShannonAdminHandoffConfig
) {
  return (
    access.source === "supabase" &&
    access.role === "super_admin" &&
    access.email === GHOSTHAND_SUPER_ADMIN_EMAIL &&
    access.userId === config.actorUserId
  )
}

function normalizeRole(value: unknown): TargetState["role"] {
  if (value === null) return "member"
  if (value === "administrator" || value === "super_admin") return value
  return "invalid"
}

async function readTargetThroughHumanSession(
  config: ShannonAdminHandoffConfig
): Promise<TargetState | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, email, is_admin, admin_role")
    .eq("id", config.targetUserId)
    .eq("email", SHANNON_ADMIN_EMAIL)
    .maybeSingle()

  if (
    error ||
    !profile ||
    profile.id !== config.targetUserId ||
    profile.email !== SHANNON_ADMIN_EMAIL ||
    typeof profile.is_admin !== "boolean"
  ) {
    return null
  }

  return {
    email: SHANNON_ADMIN_EMAIL,
    id: profile.id,
    isAdmin: profile.is_admin,
    role: normalizeRole(profile.admin_role),
  }
}

async function changeRoleThroughHumanSession(
  input: RoleChangeInput
): Promise<RoleChangeResult | null> {
  const supabase = await createClient()
  if (!supabase) return null

  const { data, error } = await supabase.rpc("change_admin_role", {
    p_approval_reference: input.approvalReference,
    p_expected_role: input.expectedRole,
    p_new_role: input.newRole,
    p_target_email: input.targetEmail,
    p_target_user_id: input.targetUserId,
  })

  if (error || !Array.isArray(data) || data.length !== 1) return null

  const row = data[0] as Record<string, unknown>
  if (
    row.target_user_id !== input.targetUserId ||
    row.role !== input.newRole ||
    row.is_admin !== (input.newRole === "administrator")
  ) {
    return null
  }

  return {
    isAdmin: row.is_admin as boolean,
    role: row.role as string,
    targetUserId: row.target_user_id as string,
  }
}

const runtimeDependencies: ShannonAdminHandoffDependencies = {
  authorizeSuperAdmin: requireSuperAdmin,
  changeRole: changeRoleThroughHumanSession,
  environment: process.env,
  readTarget: readTargetThroughHumanSession,
}

export async function handoffShannonAdministratorWithDependencies(
  confirmationValue: FormDataEntryValue | null,
  dependencies: ShannonAdminHandoffDependencies = runtimeDependencies
): Promise<ShannonAdminHandoffState> {
  // Server Actions are public POST endpoints. Re-authorize and re-evaluate the
  // one-time runtime gate here; render-time visibility is never authorization.
  const access = await dependencies.authorizeSuperAdmin()
  const config = getShannonAdminHandoffConfig(dependencies.environment)

  if (!config || !isShannonAdminHandoffOperator(access, config)) {
    return {
      status: "unavailable",
      message: "The administrator handoff is not available in this runtime.",
    }
  }

  if (
    typeof confirmationValue !== "string" ||
    confirmationValue !== config.confirmationPhrase
  ) {
    return {
      status: "error",
      message: `Type ${config.confirmationPhrase} exactly to continue.`,
    }
  }

  let target: TargetState | null
  try {
    target = await dependencies.readTarget(config)
  } catch {
    target = null
  }

  if (
    !target ||
    target.email !== SHANNON_ADMIN_EMAIL ||
    target.id !== config.targetUserId ||
    target.role !== config.expectedRole ||
    target.isAdmin !== (config.expectedRole === "administrator")
  ) {
    return {
      status: "error",
      message:
        "Shannon’s exact current role does not match the approved handoff. Nothing changed; review the identity and role audit before retrying.",
    }
  }

  let result: RoleChangeResult | null
  try {
    result = await dependencies.changeRole({
      approvalReference: config.approvalReference,
      expectedRole: config.expectedRole,
      newRole: config.newRole,
      targetEmail: SHANNON_ADMIN_EMAIL,
      targetUserId: config.targetUserId,
    })
  } catch {
    result = null
  }

  if (
    !result ||
    result.targetUserId !== config.targetUserId ||
    result.role !== config.newRole ||
    result.isAdmin !== (config.newRole === "administrator")
  ) {
    return {
      status: "unverified",
      message:
        "The role request did not return the exact expected result. Do not retry; inspect the append-only role audit first.",
    }
  }

  let verified: TargetState | null
  try {
    verified = await dependencies.readTarget(config)
  } catch {
    verified = null
  }

  if (
    !verified ||
    verified.id !== config.targetUserId ||
    verified.email !== SHANNON_ADMIN_EMAIL ||
    verified.role !== config.newRole ||
    verified.isAdmin !== (config.newRole === "administrator")
  ) {
    return {
      status: "unverified",
      message:
        "The role request returned, but the resulting profile could not be verified. Do not retry; inspect the append-only role audit first.",
    }
  }

  return {
    status: "success",
    message:
      config.mode === "grant"
        ? "Shannon’s permanent administrator profile is verified. Before closing the handoff, verify the matching append-only audit row through the owner operations procedure."
        : "Shannon’s member profile is verified after the separately approved recovery action. Before closing the handoff, verify the matching append-only audit row through the owner operations procedure.",
  }
}
