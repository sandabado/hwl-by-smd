import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import test from "node:test"

import { createElement, type ComponentType } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import ts from "typescript"

type ProgressComponent = ComponentType<{ steps: string[] }>

function loadProgressComponent(): ProgressComponent {
  const source = readFileSync(
    new URL("./lift-sequence-progress.tsx", import.meta.url),
    "utf8"
  )
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactJSX,
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText
  const loadedModule: {
    exports: { LiftSequenceProgress?: ProgressComponent }
  } = { exports: {} }

  new Function("require", "module", "exports", compiled)(
    createRequire(import.meta.url),
    loadedModule,
    loadedModule.exports
  )

  assert.ok(loadedModule.exports.LiftSequenceProgress)
  return loadedModule.exports.LiftSequenceProgress
}

test("LIFT progressbar has a direct accessible name and truthful initial value", () => {
  const steps = [
    "Arrive",
    "Lengthen",
    "Integrate",
    "Flow",
    "Transform",
    "Restore",
    "Close",
  ]
  const Progress = loadProgressComponent()
  const markup = renderToStaticMarkup(createElement(Progress, { steps }))
  const progressbar = markup.match(/<[^>]*\brole="progressbar"[^>]*>/)?.[0]

  assert.ok(progressbar, "expected a rendered progressbar")
  assert.match(progressbar, /aria-label="LIFT sequence progress"/)
  assert.match(progressbar, /aria-valuemax="7"/)
  assert.match(progressbar, /aria-valuemin="0"/)
  assert.match(progressbar, /aria-valuenow="0"/)
  assert.match(progressbar, /aria-valuetext="Sequence not started"/)
})
