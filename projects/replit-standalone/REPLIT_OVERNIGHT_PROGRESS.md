# REPLIT Overnight Progress — Lane 2 (Replit UX)

## Scope completed
Implemented day-1/day-2 command-first UI integration in `replit-standalone` using existing `src/commandFirst/*` modules, with minimal disruption to the current page structure.

## What was added

### 1) New component: `CommandFirstComposer`
**File:** `src/commandFirst/components/CommandFirstComposer.tsx`

- Built a command-first input surface for prompts like `I want to build this: ...`
- Uses existing parser: `parseBuildIntent` from `src/commandFirst/intentParser.ts`
- Uses existing starter prompts: `starterPrompts` from `src/commandFirst/starterPrompts.ts`
- Emits parsed intent upward via `onIntentChange(intent)`
- Includes:
  - Textarea composer
  - “Parse intent” action
  - Starter prompt selector (auto-updates intent preview)

### 2) New component: `IntentPreviewCard`
**File:** `src/commandFirst/components/IntentPreviewCard.tsx`

- Displays parsed intent state using existing `BuildIntent` type
- Shows:
  - Goal
  - Platform
  - Confidence
  - Key features
- Uses existing clarifier logic: `getClarifierQuestions` from `intentParser.ts`
- Renders clarifier questions when fields are missing, or completion message when sufficient

### 3) `App.tsx` wiring (minimal disruption)
**File:** `src/App.tsx`

- Added imports for:
  - `parseBuildIntent`
  - `starterPrompts`
  - `CommandFirstComposer`
  - `IntentPreviewCard`
- Added local state:
  - Initializes from `starterPrompts[0]` parsed via `parseBuildIntent`
  - `intentPreview` state updated by composer
- Inserted a compact integration section directly after the page heading:
  - Left: `CommandFirstComposer`
  - Right: `IntentPreviewCard`

No broad refactors were made to preserve existing layout/content flow.

### 4) Styling for command-first surfaces
**File:** `src/App.css`

- Added scoped styles for:
  - `.command-first-grid`
  - `.command-first-card`
  - `.intent-preview-card`
  - `.command-first-form`
  - `.command-first-actions`
  - `.intent-preview-*`
- Kept styles additive and localized.

## Build/verification
Ran:

```bash
npm run build
```

Result: ✅ success (`tsc -b && vite build` passed, production bundle generated).

## Notes
- Existing `commandFirst` parsing logic was reused as requested.
- Integration is intentionally lightweight (day-1/day-2 UX layer) and ready for next steps (e.g., scaffold trigger, command execution pipeline, persistence).

## Runnable checkpoint — 2026-03-02 21:43 CST
- `npm run build` passes (`tsc -b && vite build`).
- `npm run lint` passes (`eslint .`).
- App remains runnable via `npm run dev` with command-first composer + intent preview flow intact.
- Checkpoint focus: verified executable baseline before scaffold/execution pipeline work.

## Incremental progress — 2026-03-03 evening
- Added intent-parser unit tests (`src/commandFirst/intentParser.test.ts`) and verified deterministic confidence/missing-field behavior with `vitest`.
- Extended parser to extract practical constraints (e.g., `must ...`, `without ...`, `under $...`, `by Friday`) into `BuildIntent.constraints`.
- Updated intent preview UI to render constraints before clarifier prompts.
- Verification:
  - `npm run test` ✅
  - `npm run build` ✅

### Next step
Wire a **"Generate build plan"** action that turns parsed intent (+ constraints) into a day-1 scaffold checklist and execution task list.

## Incremental progress — 2026-03-03 21:03 CST
- Implemented build-plan generation pipeline:
  - Added `generateBuildPlan(intent)` with deterministic day-1 checklist, execution tasks, assumptions, and risk flags.
  - Added UI trigger in intent preview (`Generate build plan`) and build-plan rendering card.
  - Reset build plan automatically when intent changes (prevents stale scaffold plans).
- Added unit coverage for build-plan determinism + risk behavior.
- Verification:
  - `npm run test` ✅ (8 tests passing)
  - `npm run build` ✅
## Incremental progress � 2026-03-03 21:36 CST
- Implemented scaffold-execution stub pipeline:
  - Added `createScaffoldExecution(intent, plan)` to emit deterministic project slug, root directory, starter command, ordered scaffold steps, warnings, and runnable command runbook.
  - Added UI action `Create scaffold runbook` in build-plan card and rendered execution stub details inline.
  - Auto-resets scaffold execution output when intent/plan changes (prevents stale runbooks).
- Added unit coverage for deterministic scaffold output and warning behavior.
- Verification:
  - `npm run test` ? (10 tests passing)
  - `npm run build` ?

### Next step
Convert scaffold stub into a real filesystem executor (write starter files + capture live execution logs/status timeline).

## Incremental progress — 2026-03-03 22:03 CST
- Advanced scaffold pipeline from simple runbook stub to a **deterministic scaffold package generator**:
  - `createScaffoldExecution` now emits generated starter artifacts (`README.md`, `docs/BUILD_PLAN.md`, `src/app.config.json`).
  - Added status timeline entries and richer step states (`generated`) to make execution handoff clearer.
  - Build plan card now renders generated files + timeline so operators can act immediately.
- Verification:
  - `npm run test` ✅ (10 tests passing)
  - `npm run build` ✅

### Next step
Add a local execution bridge (desktop/CLI sidecar) that can consume generated file manifests and perform real writes/bootstraps with streamed logs.

## Incremental progress — 2026-03-03 22:34 CST
- Added scaffold execution bundle export path for sidecar handoff:
  - New `buildScaffoldBundle(execution)` + `scaffoldBundleToJson(bundle)` in `src/commandFirst/scaffoldBundle.ts`.
  - Build-plan UI now supports `Export execution bundle JSON` and renders the generated JSON payload for operator handoff.
  - Resets exported bundle state when intent/plan/execution context changes.
- Added unit coverage for bundle determinism and serialization shape.
- Verification:
  - `npm run test` ✅ (11 tests passing)
  - `npm run build` ✅

### Next step
Implement the sidecar consumer that takes exported bundle JSON, writes files under `rootDir`, executes bootstrap commands, and streams status/log updates back to the UI.

## Incremental progress — 2026-03-03 23:03 CST
- Added sidecar execution planning bridge to move from JSON export toward runnable execution handoff:
  - New `createSidecarExecutionReport(bundle)` + `sidecarExecutionReportToJson(report)` in `src/commandFirst/sidecarBridge.ts`.
  - Report includes deterministic file ops, command ops, and event timeline entries to prep real sidecar execution.
  - Build-plan UI now supports `Prepare sidecar execution plan` and renders sidecar-plan JSON next to bundle JSON.
- Added unit coverage for sidecar report determinism and serialization.
- Verification:
  - `npm run test` ✅ (13 tests passing)
  - `npm run build` ✅

### Next step
Replace sidecar planning stub with an actual Node sidecar worker that consumes bundle JSON, writes files to disk, executes commands, and emits streaming status events back into the UI bridge.

## Incremental progress — 2026-03-03 23:31 CST
- Implemented an actual Node sidecar worker CLI:
  - Added `scripts/sidecar-worker.mjs` to consume scaffold bundle JSON, validate shape, write files, execute commands, and emit structured JSONL-style event logs.
  - Supports `--dry-run` for safe rehearsal mode before touching filesystem/commands.
- Wired package script `npm run sidecar:run -- --bundle <bundle.json> [--dry-run]`.
- Updated sidecar bridge next-action guidance in UI payload to point at the real worker command.
- Verification:
  - `npm run test` ✅ (13 tests passing)
  - `npm run build` ✅
  - `npm run sidecar:run -- --bundle runs/demo-bundle.json --dry-run` ✅

### Next step
Connect worker event stream back into UI state (live timeline panel) and add cancellation/timeout handling for long-running commands.

## Incremental progress — 2026-03-04 00:02 CST
- Hardened sidecar worker execution controls:
  - Added `--timeout-ms` per-command timeout support with explicit timeout events.
  - Added SIGINT cancellation handling to terminate in-flight command execution cleanly.
  - Improved command event hygiene (skip empty chunks, signal-aware exit logging).
- Updated sidecar bridge next-action guidance to include dry-run + timeout flags.
- Verification:
  - `npm run test` ✅ (13 tests passing)
  - `npm run build` ✅
  - `npm run sidecar:run -- --bundle runs/demo-bundle.json --dry-run --timeout-ms 5000` ✅

### Next step
Surface sidecar worker JSONL events in the React UI as a live timeline panel (with run status + cancel button) so operators can monitor execution without leaving the app.

## Incremental progress — 2026-03-04 00:34 CST
- Added sidecar event timeline panel directly in build-plan UI:
  - Build-plan card now accepts JSONL event paste, replays events in-order, shows run status (`idle/running/complete/cancelled/error`), and supports cancel action during replay.
  - Added parse/error handling for malformed JSONL chunks.
- Added a reusable demo JSONL artifact at `runs/demo-events.jsonl` for immediate operator testing.
- Styling pass for timeline input/error/hint states in `App.css`.
- Verification:
  - `npm run test` ✅ (13 tests passing)
  - `npm run build` ✅

### Next step
Replace replay-only timeline with a real sidecar process bridge (spawn worker + stream stdout JSONL into UI state in real time, with true process cancellation).

## Incremental progress — 2026-03-04 01:00 CST
- Added sidecar stream runner (`scripts/sidecar-runner.mjs`) to launch the worker and persist stdout JSONL directly to a file while still printing live console events.
- Added npm script `sidecar:stream` for repeatable runs:
  - `npm run sidecar:stream -- --bundle runs/demo-bundle.json --out runs/latest-events.jsonl --dry-run --timeout-ms 5000`
- Improved timeline usability in UI:
  - Build plan panel now supports loading `.jsonl` files directly (not only manual paste), making sidecar output handoff practical.
  - Updated sidecar bridge next-action guidance to the new streaming command and file-load workflow.
- Verification:
  - `npm run test` ✅
  - `npm run build` ✅
  - `npm run sidecar:stream -- --bundle runs/demo-bundle.json --out runs/latest-events.jsonl --dry-run --timeout-ms 5000` ✅

### Next step
Add a tiny local bridge endpoint (or Electron/Tauri host hook) so the UI can trigger `sidecar:stream` directly and subscribe to run status/events without manual command execution.

## Incremental progress — 2026-03-04 01:35 CST
- Implemented a local sidecar bridge API to move from manual CLI-only flow toward app-triggered execution:
  - Added `scripts/sidecar-bridge.mjs`.
  - Endpoints:
    - `POST /run` (start sidecar worker run)
    - `GET /events` (SSE live event stream)
    - `GET /status` (run status + recent events)
    - `POST /cancel` (SIGINT cancellation)
    - `GET /healthz`
  - Persists worker stdout JSONL to requested output file while also broadcasting parsed events.
- Added npm script `sidecar:bridge`.
- Updated command-first bridge next-action guidance to use the bridge API flow.
- Updated README with bridge usage examples (`curl` run/events/status/cancel).

### Changed files
- `scripts/sidecar-bridge.mjs`
- `package.json`
- `README.md`
- `src/commandFirst/sidecarBridge.ts`

### Verification
- `npm run test` ✅ (13 passing)
- `npm run build` ✅
- `node --check scripts/sidecar-bridge.mjs` ✅

### Next step
Wire the React BuildPlan timeline panel to this local bridge (SSE subscribe + trigger/cancel buttons) so execution monitoring is truly live from inside the UI without manual file loading.

## Incremental progress — 2026-03-04 02:00 CST
- Wired BuildPlan timeline panel to the local sidecar bridge API:
  - Added in-app SSE connect/reconnect to `GET /events`.
  - Added in-app `POST /run` trigger (dry-run path) and `POST /cancel` controls.
  - Added bridge base URL + output path inputs to avoid hardcoded local assumptions.
- Extended bridge server to accept inline bundle payloads:
  - `POST /run` now supports either `bundle` path or `bundleJson` content.
  - Inline payloads are persisted to `runs/<executionId>.bundle.json` before worker execution.
- Updated sidecar guidance/docs to reflect inline bundle runs.
- Added runnable sample payload: `runs/demo-inline-run.json`.

### Changed files
- `src/commandFirst/components/BuildPlanCard.tsx`
- `scripts/sidecar-bridge.mjs`
- `src/commandFirst/sidecarBridge.ts`
- `README.md`
- `runs/demo-inline-run.json`

### Verification
- `npm run test` ✅ (13 passing)
- `npm run build` ✅
- `node --check scripts/sidecar-bridge.mjs` ✅
- `POST /run` with `runs/demo-inline-run.json` ✅ (`bundlePath` + `outPath` returned)

### Next step
Replace manual bridge URL entry with environment-backed auto-discovery + `/status` polling fallback so the UI can self-heal when SSE disconnects.

## Incremental progress — 2026-03-04 02:33 CST
- Completed bridge resilience + discovery pass in Build Plan UI:
  - Bridge base URL now auto-seeds from `VITE_SIDECAR_BRIDGE_URL` (with localhost fallback) and persists to localStorage.
  - BuildPlan panel now auto-attempts SSE connection when execution context exists.
  - Added `/status` polling fallback (3s) that activates when SSE errors/disconnects and merges recent bridge events without duplicates.
  - Improved event ingestion with dedupe keys to avoid duplicated timeline entries across SSE + polling + replay.
- Updated README with `.env.local` bridge discovery configuration note.

### Changed files
- `src/commandFirst/components/BuildPlanCard.tsx`
- `README.md`

### Verification
- `npm run test` ✅ (13 passing)
- `npm run build` ✅

### Next step
Add a lightweight “Bridge health” indicator row (healthz latency + last status poll time + last event ts) so operators can instantly tell whether they are on live SSE or degraded polling mode.


## Incremental progress � 2026-03-04 03:04 CST
- Added BuildPlan bridge observability row in React UI:
  - Health check latency from `/healthz` (15s cadence).
  - `Last status poll` timestamp tracking for degraded polling mode.
  - `Last event` timestamp tracking for SSE/poll event flow.
  - Clear bridge mode state (`connected (SSE)` / `polling /status` / `disconnected`).
- Added pill/health styling for quick operator scanability.

### Changed files
- `src/commandFirst/components/BuildPlanCard.tsx`
- `src/App.css`

### Verification
- `npm run test -- --run` ? (13 passing)
- `npm run build` ?

### Next step
- Add explicit stale-event warning thresholds (e.g., >10s no event while running) and optional auto-reconnect backoff messaging in the bridge health row.

## Incremental progress � 2026-03-04 03:34 CST
- Completed bridge resilience UX pass in BuildPlan timeline:
  - Added stale-event warning when run is active and no events arrive for >10s.
  - Added automatic SSE reconnect with exponential backoff and visible countdown messaging.
  - Kept `/status` polling fallback active during reconnect windows.
- Updated README with stale-warning + reconnect behavior note.

### Changed files
- `src/commandFirst/components/BuildPlanCard.tsx`
- `src/App.css`
- `README.md`

### Verification
- `npm run test -- --run` ? (13 passing)
- `npm run build` ?

### Next step
Add operator control for reconnect policy (max retries/backoff cap) and a hard "bridge unavailable" banner when health checks stay down.

## Incremental progress - 2026-03-04 04:07 CST
- Completed bridge control hardening pass in BuildPlan timeline UI:
  - Added operator-configurable reconnect policy controls (base delay, cap delay, max retries).
  - Added configurable stale-event threshold for active runs.
  - Added health-failure tracking + hard-down banner after repeated `/healthz` failures or reconnect exhaustion.
  - Persisted bridge policy settings in localStorage for repeatable operator behavior across reloads.
- Updated README with policy-control + hard-down behavior notes.

### Changed files
- `src/commandFirst/components/BuildPlanCard.tsx`
- `src/App.css`
- `README.md`

### Verification
- `npm run test -- --run` ? (13 passing)
- `npm run build` ?

### Next step
Move bridge policy controls into a compact "advanced" section and add explicit one-click "reset bridge policy defaults" to reduce operator error during degraded runs.

## Incremental progress - 2026-03-04 04:36 CST
- Completed the bridge-policy ergonomics pass in BuildPlan timeline UI:
  - Moved reconnect/stale/hard-down tuning controls into a compact **advanced bridge policy** section.
  - Added one-click **Reset bridge policy defaults** action to restore safe baseline values.
  - Kept bridge URL + output path controls visible in the primary row for fast day-to-day use.
- Updated README bridge notes to document advanced policy grouping and reset workflow.

### Changed files
- `src/commandFirst/components/BuildPlanCard.tsx`
- `src/App.css`
- `README.md`

### Verification
- `npm run test` ? (13 passing)
- `npm run build` ?

### Next step
Persist bridge-policy presets (e.g., conservative/balanced/aggressive) so operators can switch recovery behavior quickly without manual numeric tuning.

## Incremental progress - 2026-03-04 05:03 CST
- Added persisted bridge-policy presets in BuildPlan timeline advanced controls:
  - Presets: **Conservative**, **Balanced**, **Aggressive**.
  - One-click preset application updates reconnect/stale/hard-down policy fields as a profile.
  - Active preset now persists in localStorage (`sidecar.policyPreset`) and restores on reload.
  - Reset defaults now explicitly maps back to **Balanced** preset.
- Updated README bridge notes with preset workflow.

### Changed files
- `src/commandFirst/components/BuildPlanCard.tsx`
- `README.md`

### Verification
- `npm run test -- --run` ✅ (13 passing)
- `npm run build` ✅

### Next step
Add a compact run-mode toggle (dry-run vs apply) with confirmation guardrails before non-dry sidecar execution is triggered from the UI.

## Incremental progress - 2026-03-04 05:35 CST
- Implemented sidecar run-mode safety controls in BuildPlan timeline UI:
  - Added explicit run-mode toggle: **Dry-run (safe)** vs **Apply (writes + commands)**.
  - `POST /run` payload now maps `dryRun` from selected mode instead of forcing dry-run.
  - Added confirmation guardrail (`window.confirm`) before apply-mode execution starts.
  - Updated trigger CTA label to reflect current run mode.
- Added supporting style row for mode controls and updated README with run-mode/guardrail behavior.

### Changed files
- `src/commandFirst/components/BuildPlanCard.tsx`
- `src/App.css`
- `README.md`

### Verification
- `npm run test -- --run` ✅ (13 passing)
- `npm run build` ✅

### Next step
Add an optional typed confirmation phrase (not just OK/Cancel) for apply mode on high-risk bundles (e.g., destructive commands) before bridge `/run` submission.

## Incremental progress - 2026-03-04 06:03 CST
- Added high-risk apply-mode guardrail in BuildPlan bridge execution flow:
  - Introduced high-risk command detection from execution bundle `commands` (e.g., `rm -rf`, `del /f`, `rmdir /s`, `mkfs`, `format`, `git clean -fdx`, `shutdown`, `reboot`, shell redirects to `/`).
  - Apply runs now require existing confirm dialog **plus** typed phrase `APPLY` when high-risk commands are present.
  - Keeps dry-run path frictionless while tightening destructive execution safety in UI-triggered bridge runs.
- Updated README bridge notes with typed-confirmation behavior.

### Changed files
- `src/commandFirst/components/BuildPlanCard.tsx`
- `README.md`

### Validation
- `npm run test -- --run` ✅ (13 passing)
- `npm run build` ✅

### Next step
Add per-command risk badges in the sidecar plan/execution panel so operators can see why a bundle is flagged high-risk before pressing apply.

## Incremental progress - 2026-03-04 06:34 CST
- Implemented per-command risk review in BuildPlan sidecar panel:
  - Added command risk classification rules (`high`/`medium`/`low`) with explicit reason text.
  - Reused parsed execution bundle commands to render a `Command risk review` list with severity badges before execution.
  - Kept high-risk apply guardrail behavior intact (typed `APPLY` still required when high-risk commands exist).
- Added UI styling for risk badges + command list readability.
- Updated README bridge notes to mention the new pre-apply risk review surface.

### Changed files
- `src/commandFirst/components/BuildPlanCard.tsx`
- `src/App.css`
- `README.md`

### Validation
- `npm run test -- --run` ✅ (13 passing)
- `npm run build` ✅

### Next step
Promote risk classification into shared sidecar metadata (bridge/server side) so UI, worker logs, and audit exports all use the same risk taxonomy.

## Incremental progress - 2026-03-04 07:06 CST
- Promoted command-risk taxonomy into shared command-first metadata:
  - Added `src/commandFirst/commandRisk.ts` (`assessCommandRisks`, `summarizeCommandRisk`) as the single risk-classification source.
  - Updated `BuildPlanCard` to consume shared risk assessments (removed duplicated inline rule set).
  - Extended `createSidecarExecutionReport` with `commandRisk` metadata (`summary` + per-command assessments) for audit/log consumers.
- Added tests to lock risk behavior:
  - New `commandRisk.test.ts` for deterministic classification + summary counts.
  - Updated `sidecarBridge.test.ts` to assert `commandRisk` coverage in report payloads.
- Updated README notes to document shared `commandRisk` sidecar metadata.

### Changed files
- `src/commandFirst/commandRisk.ts`
- `src/commandFirst/commandRisk.test.ts`
- `src/commandFirst/components/BuildPlanCard.tsx`
- `src/commandFirst/sidecarBridge.ts`
- `src/commandFirst/sidecarBridge.test.ts`
- `README.md`

### Validation
- `npm run test -- --run` ✅ (15 passing)
- `npm run build` ✅

### Next step
Surface `commandRisk` from bridge `/status` and worker event envelopes so runtime telemetry and exported run logs carry the same shared severity taxonomy as the UI/report layer.

## Incremental progress - 2026-03-04 07:35 CST
- Completed command-risk telemetry propagation through runtime surfaces:
  - `ScaffoldBundle` now carries shared `commandRisk` metadata (summary + per-command assessments) generated from the same taxonomy module used by UI/report.
  - Sidecar bridge now reads bundle risk metadata at run start and exposes it in `GET /status`.
  - Sidecar worker now emits risk-aware command event details and logs bundle-level risk summary at execution start.
- Updated operator docs to call out `/status` risk metadata and risk-tagged worker events.

### Changed files
- `src/commandFirst/scaffoldBundle.ts`
- `src/commandFirst/scaffoldBundle.test.ts`
- `scripts/sidecar-bridge.mjs`
- `scripts/sidecar-worker.mjs`
- `README.md`

### Validation
- `npm run test -- --run` ✅ (15 passing)
- `npm run build` ✅

### Next step
Render bridge `/status.commandRisk` directly in the BuildPlan runtime panel (outside pre-run plan view) so operators always see active-run severity context even when joining mid-run.

