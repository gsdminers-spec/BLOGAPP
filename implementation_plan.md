# Database Seeding: Phase 2 General Topics

## Goal Description
Seed the "General" topics for Phase 2, similar to how it was done for Phase 1. The user provided a specific list of 5 topics.

## User Review Required
> [!NOTE]
> Phase 3 topics were requested in a prior prompt but not provided in this one. This plan only covers Phase 2 topics.

## Proposed Changes

### Scripts
#### [NEW] [scripts/seed-phase2-general.ts](file:///e:/WEBSITE2.0/CORRECT_REPOS/BLOGAPP/scripts/seed-phase2-general.ts)
- Create a new script to:
  - Find "Phase 2".
  - Ensure "General" Category exists in Phase 2.
  - Ensure "General" Subcategory exists in Phase 2.
  - Insert the 5 provided topics:
    - ASIC Overheating Problems in Indian Summers
    - How Dust Build-Up Causes ASIC Hardware Failure
    - Moisture and Humidity Damage in ASIC Mining Environments
    - Voltage Fluctuation Damage in Indian Mining Setup
    - Why Monsoon Season Increases ASIC Failure Rates

## Verification Plan

### Automated Verification
- Run: `ts-node scripts/seed-phase2-general.ts` (using `npx tsx` or similar).
- Verify successful output.
- Check database via `debug-categories.js` if needed.
