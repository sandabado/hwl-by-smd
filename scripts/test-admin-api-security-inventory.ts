import assert from "node:assert/strict"
import { readdir, readFile } from "node:fs/promises"
import { join, relative, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { test } from "node:test"
import ts from "typescript"

const PROJECT_ROOT = fileURLToPath(new URL("../", import.meta.url))
const ADMIN_API_ROOT = join(PROJECT_ROOT, "app/admin/api")
const HTTP_METHODS = new Set([
  "DELETE",
  "GET",
  "HEAD",
  "OPTIONS",
  "PATCH",
  "POST",
  "PUT",
])

type CallControlFlow =
  | { kind: "reject-if-falsy" }
  | { kind: "reject-if-property-falsy"; property: string }
  | { kind: "returned" }
  | {
      kind: "terminate-if-bound-truthy"
      valueFlow: "direct" | "truthy-conjunct"
    }

type ImportedCallRequirement = {
  controlFlow: CallControlFlow
  firstArgument?: string
  importedFrom: string
  importedName: string
  kind: "imported-call"
  requireOriginTrue?: boolean
  source: string
  withinFunction: string
}

type MemberCallRequirement = {
  controlFlow: CallControlFlow
  kind: "member-call"
  memberPath: string
  source: string
  withinFunction: string
}

type CallRequirement = ImportedCallRequirement | MemberCallRequirement

type AdminApiSecurityContract = {
  authentication: readonly CallRequirement[]
  csrf: readonly [CallRequirement, ...CallRequirement[]]
  dispatch?: readonly CallRequirement[]
  methods: readonly string[]
  sessionEffects?: readonly CallRequirement[]
}

/**
 * This allowlist is deliberately explicit. A new Admin Route Handler must be
 * reviewed here before the Auth or Preview release suites can pass.
 *
 * Login is a local-development credential exchange, so its browser CSRF
 * boundary is the local request/origin check rather than the hosted admin
 * session guard. Logout is safe to invoke without an authenticated session: it
 * requires exact same-origin, returns its delegated handler, and verifies that
 * each demo/Supabase cleanup result controls a terminating branch. All
 * privileged conversation writes require both an exact same-origin mutation
 * and a hosted/local administrator session.
 */
const ADMIN_API_SECURITY_CONTRACTS = {
  "app/admin/api/conversations/booking-cta/route.ts": {
    authentication: [
      {
        controlFlow: { kind: "reject-if-property-falsy", property: "ok" },
        firstArgument: "request",
        importedFrom: "@/lib/relationships/admin-api",
        importedName: "authenticateAdminApi",
        kind: "imported-call",
        source: "app/admin/api/conversations/booking-cta/route.ts",
        withinFunction: "POST",
      },
    ],
    csrf: [
      {
        controlFlow: { kind: "reject-if-falsy" },
        firstArgument: "request",
        importedFrom: "@/lib/relationships/request",
        importedName: "isSameOriginMutation",
        kind: "imported-call",
        requireOriginTrue: true,
        source: "app/admin/api/conversations/booking-cta/route.ts",
        withinFunction: "POST",
      },
    ],
    methods: ["POST"],
  },
  "app/admin/api/conversations/reply/route.ts": {
    authentication: [
      {
        controlFlow: { kind: "reject-if-property-falsy", property: "ok" },
        firstArgument: "request",
        importedFrom: "@/lib/relationships/admin-api",
        importedName: "authenticateAdminApi",
        kind: "imported-call",
        source: "app/admin/api/conversations/reply/route.ts",
        withinFunction: "POST",
      },
    ],
    csrf: [
      {
        controlFlow: { kind: "reject-if-falsy" },
        firstArgument: "request",
        importedFrom: "@/lib/relationships/request",
        importedName: "isSameOriginMutation",
        kind: "imported-call",
        requireOriginTrue: true,
        source: "app/admin/api/conversations/reply/route.ts",
        withinFunction: "POST",
      },
    ],
    methods: ["POST"],
  },
  "app/admin/api/login/route.ts": {
    authentication: [
      {
        controlFlow: { kind: "reject-if-falsy" },
        importedFrom: "@/lib/demo-admin",
        importedName: "verifyDemoAdminCredentials",
        kind: "imported-call",
        source: "app/admin/api/login/route.ts",
        withinFunction: "POST",
      },
    ],
    csrf: [
      {
        controlFlow: { kind: "reject-if-falsy" },
        importedFrom: "@/lib/demo-admin",
        importedName: "isDemoAdminEnabled",
        kind: "imported-call",
        source: "app/admin/api/login/route.ts",
        withinFunction: "POST",
      },
      {
        controlFlow: { kind: "reject-if-falsy" },
        firstArgument: "request",
        importedFrom: "@/lib/demo-admin",
        importedName: "isLocalRequest",
        kind: "imported-call",
        source: "app/admin/api/login/route.ts",
        withinFunction: "POST",
      },
    ],
    methods: ["POST"],
  },
  "app/admin/api/logout/route.ts": {
    authentication: [],
    csrf: [
      {
        controlFlow: { kind: "reject-if-falsy" },
        firstArgument: "request",
        importedFrom: "@/lib/relationships/request",
        importedName: "isSameOriginMutation",
        kind: "imported-call",
        requireOriginTrue: true,
        source: "lib/admin-logout.ts",
        withinFunction: "handleAdminLogout",
      },
    ],
    dispatch: [
      {
        controlFlow: { kind: "returned" },
        firstArgument: "request",
        importedFrom: "@/lib/admin-logout",
        importedName: "handleAdminLogout",
        kind: "imported-call",
        source: "app/admin/api/logout/route.ts",
        withinFunction: "POST",
      },
    ],
    methods: ["POST"],
    sessionEffects: [
      {
        controlFlow: {
          kind: "terminate-if-bound-truthy",
          valueFlow: "truthy-conjunct",
        },
        kind: "member-call",
        memberPath: "dependencies.hasDemoAdminSession",
        source: "lib/admin-logout.ts",
        withinFunction: "handleAdminLogout",
      },
      {
        controlFlow: {
          kind: "terminate-if-bound-truthy",
          valueFlow: "direct",
        },
        kind: "member-call",
        memberPath: "supabase.auth.signOut",
        source: "lib/admin-logout.ts",
        withinFunction: "handleAdminLogout",
      },
    ],
  },
} as const satisfies Record<string, AdminApiSecurityContract>

async function discoverRouteHandlers(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  const paths = await Promise.all(
    entries.map(async (entry) => {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) return discoverRouteHandlers(path)
      return entry.isFile() && isRouteHandlerCandidate(entry.name) ? [path] : []
    })
  )

  return paths
    .flat()
    .map((path) => relative(PROJECT_ROOT, path).split(sep).join("/"))
    .sort()
}

function isRouteHandlerCandidate(fileName: string) {
  // Next documents both route.ts and route.js. Treat every route.* lookalike
  // as a candidate too so a future extension/configuration change fails closed
  // until its handler is explicitly reviewed and allowlisted.
  return fileName.startsWith("route.")
}

function scriptKindForPath(path: string) {
  if (path.endsWith(".js")) return ts.ScriptKind.JS
  if (path.endsWith(".jsx")) return ts.ScriptKind.JSX
  if (path.endsWith(".tsx")) return ts.ScriptKind.TSX
  return ts.ScriptKind.TS
}

function parseSourceText(relativePath: string, source: string) {
  return ts.createSourceFile(
    relativePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    scriptKindForPath(relativePath)
  )
}

async function parseSource(relativePath: string) {
  const source = await readFile(join(PROJECT_ROOT, relativePath), "utf8")
  return parseSourceText(relativePath, source)
}

function isExported(node: ts.Node) {
  return (
    ts.canHaveModifiers(node) &&
    ts
      .getModifiers(node)
      ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
  )
}

function exportedHttpMethods(sourceFile: ts.SourceFile) {
  const methods = new Set<string>()

  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      isExported(statement) &&
      statement.name &&
      HTTP_METHODS.has(statement.name.text)
    ) {
      methods.add(statement.name.text)
    }

    if (ts.isVariableStatement(statement) && isExported(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          HTTP_METHODS.has(declaration.name.text)
        ) {
          methods.add(declaration.name.text)
        }
      }
    }

    if (ts.isExportDeclaration(statement) && statement.exportClause) {
      if (!ts.isNamedExports(statement.exportClause)) continue
      for (const element of statement.exportClause.elements) {
        if (HTTP_METHODS.has(element.name.text)) methods.add(element.name.text)
      }
    }
  }

  return [...methods].sort()
}

type ImportedBinding = {
  importedFrom: string
  importedName: string
}

function importedBindings(sourceFile: ts.SourceFile) {
  const bindings = new Map<string, ImportedBinding>()

  for (const statement of sourceFile.statements) {
    if (
      !ts.isImportDeclaration(statement) ||
      !ts.isStringLiteral(statement.moduleSpecifier) ||
      !statement.importClause?.namedBindings ||
      !ts.isNamedImports(statement.importClause.namedBindings)
    ) {
      continue
    }

    for (const element of statement.importClause.namedBindings.elements) {
      bindings.set(element.name.text, {
        importedFrom: statement.moduleSpecifier.text,
        importedName: element.propertyName?.text ?? element.name.text,
      })
    }
  }

  return bindings
}

function propertyPath(expression: ts.Expression): string | null {
  if (ts.isIdentifier(expression)) return expression.text
  if (!ts.isPropertyAccessExpression(expression)) return null
  const parent = propertyPath(expression.expression)
  return parent ? `${parent}.${expression.name.text}` : null
}

function callsIn(sourceFile: ts.SourceFile) {
  const bindings = importedBindings(sourceFile)
  const calls: Array<{
    binding: ImportedBinding | null
    memberPath: string | null
    node: ts.CallExpression
  }> = []

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const binding = ts.isIdentifier(node.expression)
        ? (bindings.get(node.expression.text) ?? null)
        : null
      calls.push({
        binding,
        memberPath: propertyPath(node.expression),
        node,
      })
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return calls
}

type FunctionBoundary =
  | ts.ArrowFunction
  | ts.ConstructorDeclaration
  | ts.FunctionDeclaration
  | ts.FunctionExpression
  | ts.GetAccessorDeclaration
  | ts.MethodDeclaration
  | ts.SetAccessorDeclaration

function isFunctionBoundary(node: ts.Node): node is FunctionBoundary {
  return (
    ts.isArrowFunction(node) ||
    ts.isConstructorDeclaration(node) ||
    ts.isFunctionDeclaration(node) ||
    ts.isFunctionExpression(node) ||
    ts.isGetAccessorDeclaration(node) ||
    ts.isMethodDeclaration(node) ||
    ts.isSetAccessorDeclaration(node)
  )
}

function functionBoundaryName(node: FunctionBoundary): string | null {
  if (ts.isFunctionDeclaration(node)) return node.name?.text ?? null
  if (ts.isMethodDeclaration(node) && ts.isIdentifier(node.name)) {
    return node.name.text
  }
  if (
    (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
    ts.isVariableDeclaration(node.parent) &&
    ts.isIdentifier(node.parent.name)
  ) {
    return node.parent.name.text
  }
  return null
}

function enclosingFunction(node: ts.Node) {
  for (let current = node.parent; current; current = current.parent) {
    if (isFunctionBoundary(current)) return current
  }
  return null
}

function isWithinNamedFunction(node: ts.Node, functionName: string) {
  const boundary = enclosingFunction(node)
  return boundary ? functionBoundaryName(boundary) === functionName : false
}

function hasRequiredFirstArgument(
  call: ts.CallExpression,
  expected: string | undefined
) {
  if (!expected) return true
  const firstArgument = call.arguments[0]
  return ts.isIdentifier(firstArgument) && firstArgument.text === expected
}

function hasRequiredOriginOption(
  call: ts.CallExpression,
  required: boolean | undefined
) {
  if (!required) return true
  const options = call.arguments[1]
  if (!ts.isObjectLiteralExpression(options)) return false

  return options.properties.some(
    (property) =>
      ts.isPropertyAssignment(property) &&
      ((ts.isIdentifier(property.name) &&
        property.name.text === "requireOrigin") ||
        (ts.isStringLiteral(property.name) &&
          property.name.text === "requireOrigin")) &&
      property.initializer.kind === ts.SyntaxKind.TrueKeyword
  )
}

type ForcedTruth = boolean | "unknown"

function invertTruth(value: ForcedTruth): ForcedTruth {
  return value === "unknown" ? value : !value
}

function combineTruth(
  left: ForcedTruth,
  right: ForcedTruth,
  operator: ts.SyntaxKind.AmpersandAmpersandToken | ts.SyntaxKind.BarBarToken
): ForcedTruth {
  if (operator === ts.SyntaxKind.AmpersandAmpersandToken) {
    if (left === false || right === false) return false
    if (left === true && right === true) return true
    return "unknown"
  }

  if (left === true || right === true) return true
  if (left === false && right === false) return false
  return "unknown"
}

function forcedTruthiness(
  expression: ts.Expression,
  isTarget: (candidate: ts.Expression) => boolean,
  targetValue: boolean
): ForcedTruth {
  if (isTarget(expression)) return targetValue
  if (
    ts.isParenthesizedExpression(expression) ||
    ts.isAsExpression(expression) ||
    ts.isNonNullExpression(expression) ||
    ts.isAwaitExpression(expression)
  ) {
    return forcedTruthiness(expression.expression, isTarget, targetValue)
  }
  if (
    ts.isPrefixUnaryExpression(expression) &&
    expression.operator === ts.SyntaxKind.ExclamationToken
  ) {
    return invertTruth(
      forcedTruthiness(expression.operand, isTarget, targetValue)
    )
  }
  if (
    ts.isBinaryExpression(expression) &&
    (expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
      expression.operatorToken.kind === ts.SyntaxKind.BarBarToken)
  ) {
    return combineTruth(
      forcedTruthiness(expression.left, isTarget, targetValue),
      forcedTruthiness(expression.right, isTarget, targetValue),
      expression.operatorToken.kind
    )
  }
  if (expression.kind === ts.SyntaxKind.TrueKeyword) return true
  if (expression.kind === ts.SyntaxKind.FalseKeyword) return false
  return "unknown"
}

function statementAlwaysTerminates(statement: ts.Statement): boolean {
  if (ts.isReturnStatement(statement) || ts.isThrowStatement(statement)) {
    return true
  }
  if (ts.isBlock(statement)) {
    return statement.statements.some(statementAlwaysTerminates)
  }
  if (ts.isIfStatement(statement) && statement.elseStatement) {
    return (
      statementAlwaysTerminates(statement.thenStatement) &&
      statementAlwaysTerminates(statement.elseStatement)
    )
  }
  return false
}

function terminatingBranchForForcedValue(
  statement: ts.IfStatement,
  isTarget: (candidate: ts.Expression) => boolean,
  targetValue: boolean
) {
  const outcome = forcedTruthiness(statement.expression, isTarget, targetValue)
  if (outcome === true)
    return statementAlwaysTerminates(statement.thenStatement)
  if (outcome === false && statement.elseStatement) {
    return statementAlwaysTerminates(statement.elseStatement)
  }
  return false
}

function enclosingVariableDeclaration(node: ts.Node) {
  for (let current = node.parent; current; current = current.parent) {
    if (ts.isVariableDeclaration(current)) return current
    if (isFunctionBoundary(current)) return null
  }
  return null
}

function boundIdentifiers(name: ts.BindingName): string[] {
  if (ts.isIdentifier(name)) return [name.text]
  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : boundIdentifiers(element.name)
  )
}

function unwrapTransparentExpression(expression: ts.Expression): ts.Expression {
  let current = expression
  while (
    ts.isParenthesizedExpression(current) ||
    ts.isAwaitExpression(current) ||
    ts.isAsExpression(current) ||
    ts.isNonNullExpression(current) ||
    ts.isSatisfiesExpression(current) ||
    ts.isTypeAssertionExpression(current)
  ) {
    current = current.expression
  }
  return current
}

function initializerPreservesCallValue(
  initializer: ts.Expression,
  call: ts.CallExpression,
  valueFlow: "direct" | "truthy-conjunct"
): boolean {
  const expression = unwrapTransparentExpression(initializer)
  if (expression === call) return true
  if (
    valueFlow === "truthy-conjunct" &&
    ts.isBinaryExpression(expression) &&
    expression.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken
  ) {
    return (
      initializerPreservesCallValue(expression.left, call, valueFlow) ||
      initializerPreservesCallValue(expression.right, call, valueFlow)
    )
  }
  return false
}

function directlyControlsFalsyRejection(call: ts.CallExpression) {
  const boundary = enclosingFunction(call)
  for (let current = call.parent; current; current = current.parent) {
    if (ts.isIfStatement(current)) {
      if (current.parent !== boundary?.body) return false
      return terminatingBranchForForcedValue(
        current,
        (candidate) => candidate === call,
        false
      )
    }
    if (isFunctionBoundary(current)) return false
  }
  return false
}

function boundResultControlsTermination(
  call: ts.CallExpression,
  targetValue: boolean,
  property?: string,
  valueFlow: "direct" | "truthy-conjunct" = "direct"
) {
  const declaration = enclosingVariableDeclaration(call)
  if (
    !declaration?.initializer ||
    !initializerPreservesCallValue(declaration.initializer, call, valueFlow)
  ) {
    return false
  }
  if (
    !ts.isVariableDeclarationList(declaration.parent) ||
    (declaration.parent.flags & ts.NodeFlags.Const) === 0 ||
    !ts.isVariableStatement(declaration.parent.parent)
  ) {
    return false
  }

  const declarationStatement = declaration.parent.parent
  const blockCandidate = declarationStatement.parent
  if (!ts.isBlock(blockCandidate)) return false
  const containingBlock = blockCandidate
  if (property && containingBlock !== enclosingFunction(call)?.body) {
    return false
  }
  const declarationIndex =
    containingBlock.statements.indexOf(declarationStatement)
  const statement = containingBlock.statements[declarationIndex + 1]
  if (!ts.isIfStatement(statement)) return false
  const names = boundIdentifiers(declaration.name)

  return terminatingBranchForForcedValue(
    statement,
    (candidate) => {
      if (property) {
        const path = propertyPath(candidate)
        return names.some((name) => path === `${name}.${property}`)
      }
      return ts.isIdentifier(candidate) && names.includes(candidate.text)
    },
    targetValue
  )
}

function isDirectlyReturned(call: ts.CallExpression) {
  for (let current = call.parent; current; current = current.parent) {
    if (ts.isReturnStatement(current)) {
      let expression = current.expression
      while (
        expression &&
        (ts.isParenthesizedExpression(expression) ||
          ts.isAwaitExpression(expression) ||
          ts.isAsExpression(expression) ||
          ts.isNonNullExpression(expression))
      ) {
        expression = expression.expression
      }
      return expression === call
    }
    if (isFunctionBoundary(current)) return false
  }
  return false
}

function satisfiesControlFlow(
  call: ts.CallExpression,
  requirement: CallRequirement
) {
  switch (requirement.controlFlow.kind) {
    case "reject-if-falsy":
      return directlyControlsFalsyRejection(call)
    case "reject-if-property-falsy":
      return boundResultControlsTermination(
        call,
        false,
        requirement.controlFlow.property
      )
    case "returned":
      return isDirectlyReturned(call)
    case "terminate-if-bound-truthy":
      return boundResultControlsTermination(
        call,
        true,
        undefined,
        requirement.controlFlow.valueFlow
      )
  }
}

function findRequiredCall(
  sourceFile: ts.SourceFile,
  requirement: CallRequirement
) {
  return callsIn(sourceFile).find((call) => {
    if (!isWithinNamedFunction(call.node, requirement.withinFunction)) {
      return false
    }
    const matchesCall =
      requirement.kind === "member-call"
        ? call.memberPath === requirement.memberPath
        : call.binding?.importedFrom === requirement.importedFrom &&
          call.binding.importedName === requirement.importedName &&
          hasRequiredFirstArgument(call.node, requirement.firstArgument) &&
          hasRequiredOriginOption(call.node, requirement.requireOriginTrue)

    return matchesCall && satisfiesControlFlow(call.node, requirement)
  })
}

const fixtureSameOriginRequirement = {
  controlFlow: { kind: "reject-if-falsy" },
  firstArgument: "request",
  importedFrom: "@/lib/relationships/request",
  importedName: "isSameOriginMutation",
  kind: "imported-call",
  requireOriginTrue: true,
  source: "fixture/route.js",
  withinFunction: "POST",
} as const satisfies ImportedCallRequirement

const fixtureAuthenticationRequirement = {
  controlFlow: { kind: "reject-if-property-falsy", property: "ok" },
  firstArgument: "request",
  importedFrom: "@/lib/relationships/admin-api",
  importedName: "authenticateAdminApi",
  kind: "imported-call",
  source: "fixture/route.js",
  withinFunction: "POST",
} as const satisfies ImportedCallRequirement

const fixtureDispatchRequirement = {
  controlFlow: { kind: "returned" },
  firstArgument: "request",
  importedFrom: "@/lib/admin-logout",
  importedName: "handleAdminLogout",
  kind: "imported-call",
  source: "fixture/route.js",
  withinFunction: "POST",
} as const satisfies ImportedCallRequirement

const fixtureDemoSessionRequirement = {
  controlFlow: {
    kind: "terminate-if-bound-truthy",
    valueFlow: "truthy-conjunct",
  },
  kind: "member-call",
  memberPath: "dependencies.hasDemoAdminSession",
  source: "fixture/route.js",
  withinFunction: "POST",
} as const satisfies MemberCallRequirement

const fixtureSignOutRequirement = {
  controlFlow: { kind: "terminate-if-bound-truthy", valueFlow: "direct" },
  kind: "member-call",
  memberPath: "supabase.auth.signOut",
  source: "fixture/route.js",
  withinFunction: "POST",
} as const satisfies MemberCallRequirement

function fixtureSource(body: string) {
  return parseSourceText(
    "fixture/route.js",
    `
      import { authenticateAdminApi } from "@/lib/relationships/admin-api"
      import { handleAdminLogout } from "@/lib/admin-logout"
      import { isSameOriginMutation } from "@/lib/relationships/request"
      export async function POST(request) {
        ${body}
      }
    `
  )
}

test("Admin Route Handler discovery covers route.ts and route.js and fails closed on route.* lookalikes", () => {
  assert.equal(isRouteHandlerCandidate("route.ts"), true)
  assert.equal(isRouteHandlerCandidate("route.js"), true)
  assert.equal(isRouteHandlerCandidate("route.tsx"), true)
  assert.equal(isRouteHandlerCandidate("route.jsx"), true)
  assert.equal(isRouteHandlerCandidate("route.future"), true)
  assert.equal(isRouteHandlerCandidate("page.ts"), false)
})

test("security inventory accepts enforced JavaScript guard and authorization results", () => {
  const sourceFile = fixtureSource(`
    if (!isSameOriginMutation(request, { requireOrigin: true })) {
      return new Response("Forbidden", { status: 403 })
    }
    const authorization = await authenticateAdminApi(request)
    if (!authorization.ok) return new Response("Unauthorized", { status: 401 })
    return new Response("OK")
  `)

  assert.ok(findRequiredCall(sourceFile, fixtureSameOriginRequirement))
  assert.ok(findRequiredCall(sourceFile, fixtureAuthenticationRequirement))
})

test("security inventory rejects ignored, inverted, conditional, and nested guard calls", () => {
  const bodies = [
    `
      isSameOriginMutation(request, { requireOrigin: true })
      return new Response("OK")
    `,
    `
      if (isSameOriginMutation(request, { requireOrigin: true })) {
        return new Response("Forbidden", { status: 403 })
      }
      return new Response("OK")
    `,
    `
      if (!isSameOriginMutation(request, { requireOrigin: true })) {
        console.warn("ignored rejection")
      }
      return new Response("OK")
    `,
    `
      if (!isSameOriginMutation(request, { requireOrigin: true }) && request.body) {
        return new Response("Forbidden", { status: 403 })
      }
      return new Response("OK")
    `,
    `
      function misleadingNestedGuard() {
        if (!isSameOriginMutation(request, { requireOrigin: true })) {
          return new Response("Forbidden", { status: 403 })
        }
      }
      return new Response("OK")
    `,
  ]

  for (const body of bodies) {
    assert.equal(
      findRequiredCall(fixtureSource(body), fixtureSameOriginRequirement),
      undefined
    )
  }
})

test("security inventory rejects ignored, inverted, non-terminating, and displaced authorization results", () => {
  const bodies = [
    `
      const authorization = await authenticateAdminApi(request)
      authorization.ok
      return new Response("OK")
    `,
    `
      const authorization = await authenticateAdminApi(request)
      if (authorization.ok) return new Response("Unauthorized", { status: 401 })
      return new Response("OK")
    `,
    `
      const authorization = await authenticateAdminApi(request)
      if (!authorization.ok) console.warn("ignored rejection")
      return new Response("OK")
    `,
    `
      const authorization = await authenticateAdminApi(request)
      authorization.ok = true
      if (!authorization.ok) return new Response("Unauthorized", { status: 401 })
      return new Response("OK")
    `,
    `
      let authorization = await authenticateAdminApi(request)
      if (!authorization.ok) return new Response("Unauthorized", { status: 401 })
      return new Response("OK")
    `,
    `
      if (request.body) {
        const authorization = await authenticateAdminApi(request)
        if (!authorization.ok) return new Response("Unauthorized", { status: 401 })
      }
      return new Response("OK")
    `,
    `
      const authorization = (await authenticateAdminApi(request), { ok: true })
      if (!authorization.ok) return new Response("Unauthorized", { status: 401 })
      return new Response("OK")
    `,
    `
      const authorization = { discarded: await authenticateAdminApi(request), ok: true }
      if (!authorization.ok) return new Response("Unauthorized", { status: 401 })
      return new Response("OK")
    `,
  ]

  for (const body of bodies) {
    assert.equal(
      findRequiredCall(fixtureSource(body), fixtureAuthenticationRequirement),
      undefined
    )
  }
})

test("security inventory rejects discarded logout session-effect results", () => {
  const discardedSignOutSources = [
    fixtureSource(`
      const { error } = (await supabase.auth.signOut(), { error: null })
      if (error) return new Response("Unavailable", { status: 503 })
      return new Response("OK")
    `),
    fixtureSource(`
      const { error } = { discarded: await supabase.auth.signOut(), error: null }
      if (error) return new Response("Unavailable", { status: 503 })
      return new Response("OK")
    `),
  ]
  const discardedDemoSessionSources = [
    fixtureSource(`
      const demoSession = (await dependencies.hasDemoAdminSession(), true)
      if (demoSession) return new Response("OK")
      return new Response("OK")
    `),
    fixtureSource(`
      const demoSession = { discarded: await dependencies.hasDemoAdminSession() }
      if (demoSession) return new Response("OK")
      return new Response("OK")
    `),
    fixtureSource(`
      const demoSession = await dependencies.hasDemoAdminSession() || true
      if (demoSession) return new Response("OK")
      return new Response("OK")
    `),
  ]

  for (const sourceFile of discardedSignOutSources) {
    assert.equal(
      findRequiredCall(sourceFile, fixtureSignOutRequirement),
      undefined
    )
  }
  for (const sourceFile of discardedDemoSessionSources) {
    assert.equal(
      findRequiredCall(sourceFile, fixtureDemoSessionRequirement),
      undefined
    )
  }
})

test("security inventory requires delegated dispatch to be returned", () => {
  const ignored = fixtureSource(`
    handleAdminLogout(request)
    return new Response("OK")
  `)
  const returned = fixtureSource(`return handleAdminLogout(request)`)
  const wrapped = fixtureSource(
    `return Promise.resolve(handleAdminLogout(request))`
  )

  assert.equal(findRequiredCall(ignored, fixtureDispatchRequirement), undefined)
  assert.ok(findRequiredCall(returned, fixtureDispatchRequirement))
  assert.equal(findRequiredCall(wrapped, fixtureDispatchRequirement), undefined)
})

function requirementLabel(requirement: CallRequirement) {
  return requirement.kind === "member-call"
    ? `${requirement.source}#${requirement.withinFunction}: ${requirement.memberPath}()`
    : `${requirement.source}#${requirement.withinFunction}: ${requirement.importedFrom}#${requirement.importedName}()`
}

test("every Admin API Route Handler has an explicit reviewed security contract", async () => {
  assert.deepEqual(
    await discoverRouteHandlers(ADMIN_API_ROOT),
    Object.keys(ADMIN_API_SECURITY_CONTRACTS).sort(),
    "Update ADMIN_API_SECURITY_CONTRACTS when adding, moving, or removing an Admin API route."
  )
})

const contractEntries = Object.entries(ADMIN_API_SECURITY_CONTRACTS) as Array<
  [string, AdminApiSecurityContract]
>

for (const [route, contract] of contractEntries) {
  test(`${route} exposes only its approved HTTP methods`, async () => {
    const sourceFile = await parseSource(route)
    assert.deepEqual(
      exportedHttpMethods(sourceFile),
      [...contract.methods].sort()
    )
  })

  test(`${route} retains its approved authentication and CSRF boundaries`, async () => {
    const sourceCache = new Map<string, ts.SourceFile>()
    async function sourceFor(path: string) {
      const cached = sourceCache.get(path)
      if (cached) return cached
      const parsed = await parseSource(path)
      sourceCache.set(path, parsed)
      return parsed
    }

    const positions = new Map<CallRequirement, number>()
    for (const requirement of [
      ...contract.csrf,
      ...contract.authentication,
      ...(contract.dispatch ?? []),
      ...(contract.sessionEffects ?? []),
    ]) {
      const sourceFile = await sourceFor(requirement.source)
      const call = findRequiredCall(sourceFile, requirement)
      assert.ok(
        call,
        `Missing reviewed boundary: ${requirementLabel(requirement)}`
      )
      positions.set(requirement, call.node.getStart(sourceFile))
    }

    for (const csrf of contract.csrf) {
      for (const authentication of contract.authentication) {
        if (csrf.source !== authentication.source) continue
        assert.ok(
          (positions.get(csrf) ?? Number.POSITIVE_INFINITY) <
            (positions.get(authentication) ?? Number.NEGATIVE_INFINITY),
          `CSRF boundary must run before authentication: ${route}`
        )
      }
    }
  })
}
