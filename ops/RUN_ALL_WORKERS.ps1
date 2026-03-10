# RUN_ALL_WORKERS.ps1
# Durable relaunch script for named worker roles.
# This script does NOT assume persistent agent dirs for each worker;
# it launches tasks via cron jobs / session prompts in a controlled order.

$ErrorActionPreference = 'Stop'

Write-Host '=== Worker Relaunch Plan ===' -ForegroundColor Cyan

$workers = @(
  @{ Name='Calvin';  Role='Coordinator';                Project='cross-project';      Prompt='Coordinate today''s queue across job-hunt, marketing-genius, tony-revops, swing-analyzer, dinner-app. Prioritize job-hunt outputs first.' },
  @{ Name='Albert';  Role='Job intelligence scout';     Project='job-hunt';           Prompt='Find high-value job and company opportunities; output structured lead list.' },
  @{ Name='Sam';     Role='Company enrichment';         Project='job-hunt';           Prompt='Enrich opportunities with company, decision-maker, and fit signals.' },
  @{ Name='William'; Role='Outreach drafting';          Project='job-hunt';           Prompt='Draft concise outreach messages for top opportunities.' },
  @{ Name='Bryer';   Role='Marketing builder';          Project='marketing-genius';   Prompt='Advance marketing-genius roadmap with smallest shippable improvements.' },
  @{ Name='Beckham'; Role='Replit integration';         Project='marketing-genius';   Prompt='Stabilize replit-related integration points and build steps.' },
  @{ Name='Saylor';  Role='Swing analyzer';             Project='swing-analyzer';     Prompt='Improve swing analyzer pipeline, reliability, and output quality.' },
  @{ Name='Bill';    Role='Dinner app';                 Project='dinner-app';         Prompt='Improve dinner app features and UX with small safe increments.' },
  @{ Name='Jared';   Role='RevOps pipeline';            Project='tony-revops';        Prompt='Build RevOps data model and automation pipeline from existing files.' },
  @{ Name='Azeem';   Role='Automation reliability';     Project='tony-revops';        Prompt='Add observability/checks and harden run scripts.' },
  @{ Name='Kelly';   Role='QA reviewer';                Project='cross-project';      Prompt='Review today''s outputs for quality and completeness; generate QA checklist.' }
)

$workers | ForEach-Object {
  "- $($_.Name): $($_.Role) [$($_.Project)]"
} | Write-Host

Write-Host "`nNext step: run queued jobs first, then trigger focused worker prompts in order." -ForegroundColor Yellow
Write-Host "Tip: Keep max concurrent reasoning low to control token usage." -ForegroundColor Yellow
