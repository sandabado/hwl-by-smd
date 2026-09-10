import { resolve as resolveWithProjectLoader } from "./test-module-loader.mjs"

const supabaseStub = `
export function createAdminClient() {
  if (globalThis.__hwlCalcomRouteAdminMode === "missing") return null;

  return {
    async rpc(name, args) {
      const calls = globalThis.__hwlCalcomRouteRpcCalls ?? [];
      calls.push({ args, name });
      globalThis.__hwlCalcomRouteRpcCalls = calls;

      const results = globalThis.__hwlCalcomRouteRpcResults ?? [];
      return results.shift() ?? {
        data: [{ outcome: "applied" }],
        error: null,
      };
    },
  };
}
`

const stripeStub = `
export function getCommerceDeploymentTarget() {
  return globalThis.__hwlCalcomRouteDeploymentTarget ?? null;
}
`

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "@/lib/supabase/server") {
    return {
      shortCircuit: true,
      url: `data:text/javascript,${encodeURIComponent(supabaseStub)}`,
    }
  }

  if (specifier === "@/lib/stripe") {
    return {
      shortCircuit: true,
      url: `data:text/javascript,${encodeURIComponent(stripeStub)}`,
    }
  }

  return resolveWithProjectLoader(specifier, context, nextResolve)
}
