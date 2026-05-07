# Spec: Trust & Team Signals Integration

## Objective
Enhance the landing page's credibility and professionalism by adding "team-run company" signals. This addresses the "lonely" and "unmaintained" look of the current page.

## Implementation Details

### 1. Status Update (The Date Fix)
- **Target:** The `.status` div.
- **Old Text:** `Private Alpha. Launching April 30, 2026.`
- **New Text:** `v0.4 Gold Demo is Live. Join the Public Alpha.`
- **Reasoning:** Removes the "past launch date" red flag and replaces it with an active status.

### 2. Corporate Footer
- **Location:** Bottom of the `container`.
- **Content:**
    - Copyright notice: `© 2026 Simway`
    - Links (Simple text links with consistent styling):
        - `GitHub` (Link to `https://github.com/sim-way/ple.simway.io`)
        - `X / Twitter` (Link to `https://x.com/simway_io` - Placeholder if not ready)
        - `Discord` (Link to community invite)
- **Style:** Small font size (0.8rem), muted color (#666), centered or spread out.

### 3. Partnership Signature (The "Team" Signal)
- **Location:** Above the footer or inside the Hero section.
- **Text:** `A Sim & Lobster Production.`
- **Reasoning:** Formally establishes the two-entity partnership (Sim & Lobster) and moves away from the "solo dev" look.

## Acceptance Criteria
- The launch date is no longer in the past.
- The footer provides physical links to the company's ecosystem (GitHub).
- The "Sim & Lobster" signature is present.
