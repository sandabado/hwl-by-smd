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
