# First Executable Milestone Plan — Replit Standalone

## Milestone 1 (90 min): Command-First MVP Loop

### Deliverable Definition
A working command-first flow in the main app where a user can:
1) enter “I want to build this…” text,
2) see parsed intent (goal/platform/users/features + confidence),
3) get missing-field clarifier questions,
4) click starter prompt chips,
5) pass build + lint with no regressions.

---

## File-Level Task List

### 1) `src/commandFirst/components/CommandFirstComposer.tsx`
- Ensure submit handler calls `parseBuildIntent(input)`.
- Emit parsed result via `onIntentChange(parsed)`.
- Render starter prompt chips from `starterPrompts`.
- Add low-confidence/missing-field clarifier block.
- Add keyboard handling: `Enter` submit, `Shift+Enter` newline.

### 2) `src/commandFirst/components/IntentPreviewCard.tsx`
- Render normalized intent sections:
  - Goal
  - Target users
  - Platform
  - Features
  - Confidence
- Add explicit “Missing info” section.
- Add fallback UI for empty/unparsed state.

### 3) `src/commandFirst/intentParser.ts`
- Confirm deterministic output for same input.
- Normalize confidence bands (`high | medium | low` or numeric threshold mapping).
- Ensure missing fields array always returned.

### 4) `src/commandFirst/types.ts`
- Lock shared interfaces used by parser + UI.
- Ensure optional/required fields match UI assumptions.

### 5) `src/App.tsx`
- Keep `intentPreview` as single source of truth.
- Wire composer + preview together (already present; verify behavior).
- Remove any dead placeholder states in command-first block.

### 6) `src/App.css` (or command-first style block)
- Tighten spacing/readability for:
  - composer input,
  - prompt chips,
  - clarifier questions,
  - preview card.

### 7) `REPLIT_OVERNIGHT_PROGRESS.md`
- Append a short milestone note:
  - what shipped,
  - what remains,
  - known edge cases.

---

## Acceptance Checks (must pass)

### Functional
- [ ] Typing a free-form build command updates preview with parsed fields.
- [ ] Missing critical fields produce visible clarifier prompts.
- [ ] Clicking a starter prompt chip populates/executes parse flow.
- [ ] Low-confidence input clearly signals uncertainty.

### Quality
- [ ] Deterministic parser behavior for identical inputs.
- [ ] No runtime errors in browser console for command flow.
- [ ] Empty state is readable and non-broken.

### Build/Tooling
- [ ] `npm run build` passes.
- [ ] `npm run lint` passes (or records exact lint blockers if legacy).

---

## 90-Minute Execution Sequence

### 0:00–0:10 — Baseline + verify
- Run: `npm run build`
- Run: `npm run lint`
- Quick manual run: `npm run dev`
- Capture current issues before edits.

### 0:10–0:30 — Composer wiring
- Update `CommandFirstComposer.tsx` submit + chips + keyboard behavior.
- Ensure `onIntentChange` always receives latest parse.

### 0:30–0:45 — Preview + clarifier UX
- Update `IntentPreviewCard.tsx` to show missing info + confidence.
- Add empty state and low-confidence copy.

### 0:45–1:00 — Parser/type hardening
- Tighten `intentParser.ts` return shape and confidence mapping.
- Align `types.ts` with actual UI use.

### 1:00–1:15 — App integration + polish
- Validate `App.tsx` state flow.
- Apply CSS polish for command-first section.

### 1:15–1:25 — Acceptance pass
- Manual tests with 5 prompts:
  1. restaurant ordering app with SMS updates
  2. employee onboarding dashboard
  3. AI call-note summarizer
  4. contractor estimate + invoice tool
  5. ambiguous prompt: “build me something for my team”

### 1:25–1:30 — Final checks + log
- Re-run build/lint.
- Append results to `REPLIT_OVERNIGHT_PROGRESS.md`.
- Commit with message: `milestone1: command-first mvp loop executable`.

---

## Definition of Milestone Complete
Milestone is complete when the command-first loop is demonstrably usable end-to-end in local dev, with parser-driven preview + clarifiers, and build/lint status documented.