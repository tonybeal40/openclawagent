# Replit Polish Sprint Plan (5 Days)

## Objective
Deliver a premium, command-first UX centered on the user sentence:

> **“I want to build this…”**

The flow should feel instant, trustworthy, and guided from first prompt to running app.

## Success Metrics (Sprint-Level)
- Time-to-first-valid-plan from first prompt: **< 30 seconds**
- Time-to-first-runnable scaffold: **< 2 minutes**
- Command input completion rate (no abandon on first step): **> 85%** in internal testing
- Prompt clarity score (team rubric): **4/5+**
- No regression in existing build/lint pipeline

---

## Day 1 — Command-First Foundation (Kickoff + Immediate Build)
### Focus
Create the core UX contract for parsing and structuring “I want to build this…” requests.

### Tasks
1. Define intent model for command-first requests (`src/commandFirst/types.ts`)
2. Add starter prompt library for premium onboarding (`src/commandFirst/starterPrompts.ts`)
3. Add deterministic parser helper to extract build intent (`src/commandFirst/intentParser.ts`)
4. Create implementation checklist + handoff notes (`DAY1_COMMAND_FIRST_IMPLEMENTATION.md`)
5. Validate no compile-break from added modules

### Acceptance Criteria
- [ ] Intent type schema exists and is reusable
- [ ] Parser returns normalized intent payload with confidence + missing fields
- [ ] Starter prompts include at least 8 high-quality examples across app categories
- [ ] Implementation checklist is actionable for next developer session
- [ ] `npm run build` passes

---

## Day 2 — Command Bar + Guided Clarifier UI
### Focus
Introduce the actual command-first UI shell in the app.

### Tasks
1. Add top-level command composer with “I want to build this…” default
2. Add smart follow-up questions when parser confidence is low
3. Show extracted spec preview (goal, users, platform, auth/data needs)
4. Add keyboard support (`Enter`, `Shift+Enter`, `Ctrl/Cmd+K` focus)
5. Add loading + error microstates

### Acceptance Criteria
- [ ] User can submit free-form build command from primary surface
- [ ] Clarifier asks only for missing critical fields (not generic spam)
- [ ] Spec preview updates live after each refinement
- [ ] Keyboard-only flow works end-to-end
- [ ] Empty/error states are polished and readable

---

## Day 3 — Plan-to-Scaffold Experience
### Focus
Turn command intent into immediate build momentum.

### Tasks
1. Generate concise build plan card stack (MVP scope, milestones, risks)
2. Add one-click “Generate starter scaffold” action
3. Display generated file tree + first-run instructions
4. Add trust messaging (what was assumed, what user can edit)
5. Add optimistic progress timeline for generation steps

### Acceptance Criteria
- [ ] Build plan appears in < 30s for standard prompts
- [ ] Scaffold action produces deterministic output structure
- [ ] User sees assumptions and can override them before generate
- [ ] Progress states clearly map to backend steps
- [ ] First-run instructions are copy/paste ready

---

## Day 4 — Premium UX Polish Pass
### Focus
Make the flow feel high-end, calm, and confident.

### Tasks
1. Refine spacing, hierarchy, and typography for command flow
2. Add tasteful motion for transitions (input → parse → plan)
3. Improve empty states with concrete examples + “try this” chips
4. Add sticky recent commands and quick rerun
5. Polish accessibility (focus rings, contrast, aria labels)

### Acceptance Criteria
- [ ] Visual consistency across all command-first states
- [ ] Motion aids comprehension (no unnecessary animation noise)
- [ ] Empty states reduce first-time confusion
- [ ] Recent command recall works and is persistent per session
- [ ] Basic a11y checks pass manual review

---

## Day 5 — Validation, Hardening, and Launch Readiness
### Focus
De-risk and finalize for internal launch.

### Tasks
1. Run end-to-end walkthroughs for 10 representative prompts
2. Log parser misses and add fallback prompts
3. Tighten copy for confidence and decision transparency
4. Add final QA checklist + known limitations
5. Produce launch note with before/after UX summary

### Acceptance Criteria
- [ ] 10/10 prompt walkthroughs complete without blocker bugs
- [ ] Parser fallback quality acceptable for low-confidence inputs
- [ ] UX copy is concise, clear, and user-trust aligned
- [ ] QA checklist complete with ownership assigned
- [ ] Launch note ready for team handoff

---

## Prompt Set for Validation (Use Daily)
1. I want to build this: a local restaurant ordering app with SMS updates
2. I want to build this: an employee onboarding dashboard with role-based access
3. I want to build this: an AI note summarizer for sales calls
4. I want to build this: a parent/teacher communication portal
5. I want to build this: a real-estate lead tracker with map view
6. I want to build this: a fitness challenge app with streaks and leaderboard
7. I want to build this: a nonprofit donor CRM with campaign reporting
8. I want to build this: a contractor estimate + invoice tool
9. I want to build this: a social event planning app with group polls
10. I want to build this: a clinic appointment + reminder workflow

## Risks to Watch
- Overly generic clarifier prompts that feel robotic
- Parser overconfidence on ambiguous goals
- Slow first response undermining “premium” feel
- Scope creep into full agent orchestration before UX is stable

## Definition of Done (Sprint)
- Command-first “I want to build this…” flow is the primary happy path
- User can move from idea → structured plan → scaffold with confidence
- Experience is visually polished, keyboard-friendly, and launch-ready
