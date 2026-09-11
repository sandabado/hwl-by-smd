import { resolve as resolveWithProjectLoader } from "./test-module-loader.mjs"

const adminApiAuthStub = `
export async function authenticateAdminApi() {
  const key = "__hwlAdminApiAuthenticationCalls";
  globalThis[key] = (globalThis[key] ?? 0) + 1;
  if (globalThis.__hwlAdminApiAuthenticationMode === "authorized") {
    return {
      access: {
        email: "shannon@hwlbysmd.com",
        role: "administrator",
        source: "supabase",
        userId: "00000000-0000-4000-8000-000000000108"
      },
      ok: true
    };
  }
  return { ok: false, status: 503 };
}
`

const supabaseServerStub = `
export function createAdminClient() {
  const key = "__hwlAdminClientCreationCalls";
  globalThis[key] = (globalThis[key] ?? 0) + 1;
  return null;
}

export async function createClient() {
  const key = "__hwlMemberClientCreationCalls";
  globalThis[key] = (globalThis[key] ?? 0) + 1;
  return null;
}
`

const memberAccessStub = `
export async function getAuthenticatedUser() {
  const key = "__hwlMemberAuthenticationCalls";
  globalThis[key] = (globalThis[key] ?? 0) + 1;
  if (globalThis.__hwlMemberAuthenticationMode !== "authenticated") return null;
  return { id: "00000000-0000-4000-8000-000000000107" };
}

export async function getMemberAccess() {
  const key = "__hwlMemberEntitlementCalls";
  globalThis[key] = (globalThis[key] ?? 0) + 1;
  return { isMember: globalThis.__hwlMemberEntitled === true };
}
`

const memberConversationsStub = `
export async function getOwnedConversation() {
  throw new Error("Member conversation lookup must not run in route-boundary tests");
}

export function isRelationshipSchemaUnavailable() {
  return false;
}
`

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "@/lib/relationships/admin-api") {
    return {
      shortCircuit: true,
      url: `data:text/javascript,${encodeURIComponent(adminApiAuthStub)}`,
    }
  }

  if (specifier === "@/lib/supabase/server") {
    return {
      shortCircuit: true,
      url: `data:text/javascript,${encodeURIComponent(supabaseServerStub)}`,
    }
  }

  if (specifier === "@/lib/access") {
    return {
      shortCircuit: true,
      url: `data:text/javascript,${encodeURIComponent(memberAccessStub)}`,
    }
  }

  if (specifier === "@/lib/relationships/conversations") {
    return {
      shortCircuit: true,
      url: `data:text/javascript,${encodeURIComponent(memberConversationsStub)}`,
    }
  }

  return resolveWithProjectLoader(specifier, context, nextResolve)
}
