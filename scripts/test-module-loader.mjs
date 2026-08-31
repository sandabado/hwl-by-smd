import { existsSync } from "node:fs"
import { resolve as resolvePath } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const projectRoot = fileURLToPath(new URL("../", import.meta.url))

export async function resolve(specifier, context, nextResolve) {
  if (specifier === "server-only") {
    return {
      shortCircuit: true,
      url: "data:text/javascript,export%20{}",
    }
  }

  if (specifier === "@/lib/supabase/server") {
    return {
      shortCircuit: true,
      url: "data:text/javascript,export%20function%20createAdminClient()%7Breturn%20null%7D",
    }
  }

  if (specifier.startsWith("@/")) {
    const unresolvedPath = resolvePath(projectRoot, specifier.slice(2))
    const resolvedPath = [
      unresolvedPath,
      `${unresolvedPath}.ts`,
      `${unresolvedPath}.tsx`,
      resolvePath(unresolvedPath, "index.ts"),
      resolvePath(unresolvedPath, "index.tsx"),
    ].find(existsSync)

    if (resolvedPath) {
      return {
        shortCircuit: true,
        url: pathToFileURL(resolvedPath).href,
      }
    }
  }

  return nextResolve(specifier, context)
}
