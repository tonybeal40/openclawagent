# Replit Finish Checklist

## Objective
Ship Replit-related components to a stable, runnable state.

## Phase 1 - Inventory (Now)
- [ ] Confirm which folder is canonical: `replit-standalone` vs `replit-standalone-ui`
- [ ] List run commands and required env vars
- [ ] Identify missing dependencies / broken imports

## Phase 2 - Build/Run Validation
- [ ] Install dependencies
- [ ] Run build script
- [ ] Run local start script
- [ ] Capture errors into `workspace/logs/replit_finish.log`

## Phase 3 - Hardening
- [ ] Add `.env.example` and secret handling notes
- [ ] Add healthcheck command
- [ ] Add restart script for stable run

## Phase 4 - Mission Control Integration
- [ ] Add replit status section to mission control report
- [ ] Add daily verification task
- [ ] Add recovery steps in runbook

## Current Notes
- Replit artifacts detected in restored projects and linked TonyOS references.
- Keep one canonical source to avoid drift.
