# HWL BY SMD — WORKLOG

**Repository:** `sandabado/hwl-by-smd`

**Nature:** Append-only journal of executed work, results, and verification
evidence. Entries are never edited after recording; corrections are new
entries. Decisions belong in `decisions.md` (why); this file records what
happened and was verified.

## CONVENTIONS

- Timestamps: Git-derived where a commit exists (exact, with timezone);
  approximate otherwise (marked ~, with timezone). Approximate times are
  derived from UTC-stamped report records and converted to the working
  timezone (PDT).
- Fields (Actions / Result / Gates affected / Next) are filled or explicitly
  marked "none" / "n/a". "Actions" describes what was done — including what a
  read-only audit compared and against what sources.
- Evidence: commit SHAs, file:line refs, or dated Codex audit reports. Hosted
  provider claims (e.g., migrations applied, event types published) are
  evidenced by the audit reports that checked them — repository files alone
  do not prove hosted state.

---

## FOUNDING ENTRIES — DOCUMENTATION GOVERNANCE TRACK

### 2026-09-23 ~12:34 PDT — Codex audit #1: decisions.md draft (rev 1)

- **Actor:** Codex
- **Actions:** Read-only audit of draft decisions.md claims against code,
  Stripe CLI, Supabase CLI, and Cal.com browser state.
- **Result:** Verdict BLOCKED. Materially stale claims: Stripe sandbox exists
  with active $11.11 catalog (not missing); Cal publishes 11 services with
  real availability + conflict checks (not zero/set); homepage is three-world
  editorial (not Four Doors); migrations applied through 021; LIFT uses
  cart-shelf flow. Nine revisions required.
- **Gates affected:** none moved.
- **Next:** Revise draft per nine required changes.
- **Evidence:** Codex audit report, 2026-09-23 ~12:34 PDT (includes file:line
  citations for launch-authority.ts, stripe.ts, checkout route, calcom.ts,
  booking-services.ts, hero-entry.tsx, migrations 010/011, lift page).

### 2026-09-23 ~13:09 PDT — Codex audit #2: decisions.md rev 2

- **Actor:** Codex
- **Actions:** Compared decisions.md rev 2 against prior provider evidence
  (Stripe account/catalog/webhook state, staging migration ledger, LIFT page
  gating) and code at `lib/commerce/launch-authority.ts:342`.
- **Result:** Verdict NEEDS-REVISION. ADRs 1–6 verified with caveats; ADR-007
  circular (checkout requires the flag it gates); Gate 6 media already
  uploaded and verified; live webhook shows no deliveries.
- **Gates affected:** Gate 6 corrected (media delivery done; captions remain).
- **Next:** Revise canary sequence; correct Gate 6.
- **Evidence:** Codex audit report, 2026-09-23 ~13:09 PDT.

### 2026-09-23 ~14:18 PDT — Codex audit #3: decisions.md rev 3

- **Actor:** Codex
- **Actions:** Compared rev 3 against page metadata
  (`app/lift/page.tsx:22`), asset records (`docs/launch-packet.md`), and Cal
  configuration evidence.
- **Result:** Verdict NEEDS-REVISION. Six items: bound live-charge claim to
  evidence window; add CALCOM_API_KEY to Cal gate; scope homepage claim to
  checkpoint/Preview; name PDF asset identity; flip canonical URL to
  `/beauty/lift`; define protected Production canary.
- **Gates affected:** Gate 3 scope expanded (Admin API key).
- **Next:** Apply six edits.
- **Evidence:** Codex audit report, 2026-09-23 ~14:18 PDT.

### 2026-09-23 ~14:30 PDT — Codex audit #4: decisions.md rev 4

- **Actor:** Codex
- **Actions:** Compared rev 4's Production canary sequence against the
  deployment topology (live webhook targeting `www.hwlbysmd.com` vs. public
  Production SHA).
- **Result:** Verdict NEEDS-REVISION (one item): Production canary ordering
  conflicted with Gate 8 — alias promotion before canary would route the live
  webhook to the old deployment. Reorder required.
- **Gates affected:** none moved; ordering dependency added.
- **Next:** Reorder canary sequence; full asset hashes.
- **Evidence:** Codex audit report, 2026-09-23 ~14:30 PDT.

### 2026-09-23 14:34:20 PDT — Commit: decisions.md rev 5 (push verified after)

- **Actor:** Codex (edits), Lumo (draft/reconcile), Sandābādo (approvals)
- **Actions:** Applied five edits: full asset hashes (PDF + MP4 SHA-256),
  reordered Production canary (alias-free candidate → routed canary → alias
  promotion), dual Cal verification, captions unscheduled, Gate 8 ordering
  dependency. Committed; (push verification: see Result).
- **Result:** Commit `a7e3a98` — `docs: commit canonical decisions ledger
  (rev 5)`. Contains only `docs/decisions.md`. Push not timestamped at
  execution; later verified with branch and origin both at `a7e3a98` (per
  Codex ref-check, ~14:42 PDT). Asset identities recorded: LIFT PDF
  `member-content/lift/lift-guide.pdf` SHA-256
  `652c3c6eb6e87a44d47e5326e4e3a385d3704596a19020bc75ae318c6c117ad6`;
  LIFT MP4 SHA-256 computed from local asset and included in the ledger.
- **Gates affected:** none moved.
- **Next:** Worklog creation; triage of three pre-existing modified files.
- **Evidence:** Git log — commit timestamp 2026-09-23 14:34:20 PDT
  (21:34:20 UTC).

### 2026-09-23 ~14:42 PDT — Codex review #5: worklog founding draft

- **Actor:** Codex
- **Actions:** Read-only review of worklog draft.
- **Result:** Verdict NEEDS-REVISION. Push already happened (branch and origin
  at `a7e3a98`); triage review already complete (owner decision pending);
  Gate 6 is a post-launch follow-up, not a blocking gate — blocking gates are
  1–5, 7, 8. Commit timestamp is 14:34:20 PDT, not ~21:45 (likely UTC
  confusion). Entry fields incomplete; evidence references required
  pre-commit given append-only rule.
- **Gates affected:** none moved.
- **Next:** Worklog rev 2 (the next draft at the time), then file-triage entry.
- **Evidence:** Codex review report, 2026-09-23 ~14:42 PDT; Git ref-check of
  origin.

### 2026-09-23 ~14:50 PDT — Triage of three pre-existing modified files

- **Actor:** Codex (review), Sandābādo (disposition — PENDING)
- **Actions:** Diff-scanned `scripts/validate-launch-env.ts`,
  `scripts/test-launch-env.ts`, and `docs/launch-packet.md`.
- **Result:** Recommendations (owner decision pending):
  - `scripts/validate-launch-env.ts:522`: now requires Cal API key when
    booking history is enabled; rejects malformed/placeholder keys.
    Recommended: commit as ADR-002-linked change.
  - `scripts/test-launch-env.ts:212`: covers missing/placeholder/malformed/
    plausible keys; fixture-leak checks. No live credentials found in diff.
    Recommended: commit paired with validator under ADR-002.
  - `docs/launch-packet.md:12`: Sept 19 snapshot is stale — describes branch
    `329587c` and an 18-path uncommitted candidate as current authority;
    branch/origin are now `a7e3a98`. Recommended: preserve Sept 19 evidence
    as historical, reconcile current snapshot (repo SHA vs Preview SHA
    distinguished; Preview claim freshly verified) before committing.
- **Consistency note:** `docs/decisions.md` rev 5 says repo and Preview are at
  `c639305`; repo is now `a7e3a98` (ledger commit). Preview SHA claim requires
  fresh verification before being called current.
- **Gates affected:** none moved.
- **Next:** Owner decides dispositions on all three files.

---

## OPEN THREADS

1. ~~Push checkpoint branch~~ ✅ Complete — branch and origin at `a7e3a98`.
2. Owner disposition on three modified files (validator, test, launch packet)
   — PENDING.
3. Doc suite remaining: architecture, plan, design, agents, ethos (suite of
   seven total, incl. decisions and worklog).
4. Launch gates 1–5, 7, 8 (blocking) — all open; Gate 6 (captions) is
   post-launch follow-up, unscheduled.

### 2026-09-23 ~16:10 PDT — Production schema verification (BLOCKED)

- **Actor:** Codex
- **Actions:** Checked the configured Supabase URL without printing secrets,
  listed projects with the authenticated Supabase CLI, inventoried Production
  Vercel variable names, attempted a guarded Production-only migration/schema
  read, and reconciled the packet's historical migration statements.
- **Result:** The repository `.env.local` targets staging
  `lkxppynmdfzljuptauxf`; it was not used as Production evidence. The Supabase
  CLI account can list Production `qwprhsrwiihfllmgallr` as
  `ACTIVE_HEALTHY`, but `migration list` requires a database URL or password.
  Vercel Production has Supabase URL/publishable/service-role variable names,
  while this session receives encrypted/masked values and has no
  `SUPABASE_DB_PASSWORD`, `DATABASE_URL`, or `POSTGRES_URL` by name. A clean
  temp-directory pull did not yield a usable Production endpoint/key. A
  Production-linked read-only CLI query stalled at `Initialising login role...`
  and was interrupted before returning data; no migration or application-data
  SQL was issued, and transient CLI setup cannot be ruled out. Migration ledger,
  Production public-table inventory, and migrations 019–021 remain unverified.
  `docs/schema-verification-kit.md` records the safe follow-up. The packet's
  later text says Production is through 021 and labels the 018/019–020-pending
  text historical, but that current claim could not be live-confirmed.
- **Gates affected:** none moved; Production schema verification remains
  blocked.
- **Next:** Provide a securely injected, Production-scoped read-only Postgres
  credential for `qwprhsrwiihfllmgallr`; rerun the catalog/ledger query set in
  `docs/schema-verification-kit.md` after confirming the project ref.
- **Evidence:** Supabase CLI project list; repository `.env.local` variable
  names/target; Vercel Production environment-name inventory; CLI output
  requiring `--db-url` or `--password`; read-only Management API attempt
  stopped at login-role initialization; packet references in
  `docs/launch-packet.md:398-417`, `:452-455`, `:615-616`, and `:2528-2529`.

### 2026-09-23 ~16:12 PDT — Governance batch: worklog committed, validators merged, Production audited, navigation + runbook drafted

- **Actor:** Codex
- **Actions:** Consolidated the previously verified Production route/image/
  Cal/store audit, repeated the hydration comparison on exact Preview SHA
  `5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f`, reviewed the navigation and
  operations-runbook drafts, and committed the two drafts.
- **Result:** Worklog Rev 3 is commit `78d9c0e0dc75cbc7ecd4aec1cb00556c8662fb76`;
  the Cal API-key validator change linked to ADR-002 is in
  `5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f`, with 66 launch-boundary tests
  passing. The prior Production audit recorded public routes HTTP 200, 11/11
  images, real Cal slots, and Store fail-closed; it also recorded one homepage
  React hydration error 418 and two historical fetch-failed events for
  `/contact` and `/book` on September 19. Fresh-cache traversal of exact Preview
  deployment `dpl_3cE9FZLnW1woGqDFaHyXT7NBDkZX` (SHA 5ed) reached the bottom,
  loaded all 11 images, had no overflow, set the hydration sentinel, and
  produced zero browser console errors. Production `403fc5f` reproduced one
  React error 418 in the corresponding fresh homepage check. Navigation and
  runbook drafts are commit `97344abf1a258a7ee3347f7843d1df349ecf1a13`.
- **Gates affected:** Validator disposition CLOSED (committed); hydration
  comparison PASS on exact Preview, FAIL reproduced on Production; no launch
  gate or provider/database state changed.
- **Next:** Keep the schema verification kit uncommitted pending a usable
  Production read-only credential; continue implementation only on checkpoint.
- **Evidence:** `78d9c0e0dc75cbc7ecd4aec1cb00556c8662fb76`,
  `5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f`,
  `97344abf1a258a7ee3347f7843d1df349ecf1a13`, exact Preview browser audit,
  Production homepage browser audit, and the earlier dated Production audit.

### 2026-09-23 ~16:13 PDT — Frozen release cut and ADR-008

- **Actor:** Codex (branch/docs), Sandābādo (scope and release policy)
- **Actions:** Created `release/1.0.0` directly from the audited checkpoint
  SHA `5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f` without cherry-pick or amend;
  added ADR-008, aligned the Gate 2/Production candidate references and
  snapshot, and added the freeze rule to the runbook.
- **Result:** `release/1.0.0` and `origin/release/1.0.0` remain exactly at
  `5ed2aa4d80580cb87e1d44e6795cb49fabc7af9f`. ADR-008 and the corrected
  release-cut snapshot are in commit
  `352e131d5d5e981baf03a0393519b7431a9d2118`. The navigation/runbook commit
  `97344abf1a258a7ee3347f7843d1df349ecf1a13` and ADR-008 commit were pushed;
  checkpoint origin is `352e131d5d5e981baf03a0393519b7431a9d2118`.
- **Gates affected:** Gate 2 candidate is now the frozen release-branch head;
  a release-branch change resets its exact-SHA canary. No canary passed or
  launch gate closed by this documentation action.
- **Next:** Keep new work on checkpoint; merge into release only after an
  explicit decision naming the exact audited change. Production schema remains
  blocked as recorded above.
- **Evidence:** `git show-ref` / `git ls-remote` exact refs; commits
  `97344abf1a258a7ee3347f7843d1df349ecf1a13` and
  `352e131d5d5e981baf03a0393519b7431a9d2118`.
