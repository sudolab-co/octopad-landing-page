# Section 6 — Quick Start teaser (design spec)

**Date:** 2026-04-22
**Octopad task:** [Build homepage Section 6 — Quick Start teaser](https://octopad.app/tasks/3bb53f2e-748b-4bf5-90ff-3faca106edfa)
**Parent:** Build and publish octopad.ai website
**Work stream:** Launch Execution
**Source of truth for copy:** Decision "Homepage Section 7 Quick Start teaser locked v5 2026-04-21" (captured in Octopad, Launch Execution stream).

## Purpose

Add the locked Quick Start teaser as Section 6 of the octopad.ai homepage — the "set up in minutes" proof point that lowers CTA hesitation right before the FAQ. Claude Design omitted this section from the v1 site; this task restores it.

## Scope

**In scope**

1. New homepage section rendering the locked Quick Start teaser content (header, four numbered steps, embedded CTA, closing link).
2. Remove the "01 — / 02 — / 03 —" numeral prefix from the three existing pillar eyebrows (Context, Plans, Memory). "No numbering of the sections across the one-pager" per 2026-04-22 CMO session.

**Out of scope**

- Full Quick Start page at `/getting-started` (separate Octopad task: #Write Quick Start page copy).
- FAQ section (#Build homepage Section 7 — FAQ + FAQPage JSON-LD).
- Any other edits to pillar copy beyond the numeral removal.
- Signup URL wiring — `Start free →` links to the same placeholder the hero currently uses.

## Content (verbatim, locked v5)

**Section header**
`Set up in minutes.`

**Eyebrow**
`Quick Start`
(No "04 —" prefix, per the "no section numbering" decision.)

**Four steps**

1. **Sign up.** Free, no credit card. `[Start free →]` (inline primary button)
2. Follow the onboarding to connect your AI and set up your workspace.
3. In your AI, say **"use octopad"** and tell it about your company and what you are building. Your AI will capture that information and load it at each session.
4. Your AI's back-office is now ready for work.

**Closing link**
`See the full setup guide →` → `/getting-started`

(URL is `/getting-started`, not `/quickstart` — the original knowledge entry pre-dates the URL amendment. The locked sitemap maps `/getting-started` to the nav label "Quick Start".)

## Layout

Two-column section, **reversed** orientation (copy right, visual left) to continue the alternating rhythm of the three pillars above it:

| Section | Orientation |
|---|---|
| Pillar 01 · Context | Standard (copy left) |
| Pillar 02 · Plans | Reversed (copy right) |
| Pillar 03 · Memory | Standard (copy left) |
| **Section 6 · Quick Start** | **Reversed (copy right)** |

The reversal prevents two consecutive "copy-left" sections and puts the step list on the left, which reads as "here's the proof" before the "here's the promise" on the right.

```
[ steps card ]      [ eyebrow         ]
[   01 Sign up  ]   [ Set up in       ]
[   02 Onboard  ]   [   minutes.      ]
[   03 Say use  ]   [                 ]
[   04 Ready    ]   [ See the full    ]
                    [   setup guide → ]
```

## Component architecture

**Reuse `Pillar` with `reverse`.** No new component.

- Right-column (`copy` slot): eyebrow + `<h2>` + closing link.
- Left-column (default slot, "visual" side): a `<Card>` containing four step rows.

This matches the pattern of Pillars 2 and 3, which put a custom `<Card>` with structured content in the visual slot (Pillar 2: plan checklist; Pillar 3: shared brain rows).

The section is inlined directly in `src/pages/index.astro` between Pillar 3 and `CTABand`, the same way the pillars themselves are inlined.

## Visual specification

All values reference existing design tokens in `src/styles/global.css`. No new tokens.

### Card wrapper
- `background: var(--paper-raised)` (pure white)
- `border: 1px solid var(--line)`
- `border-radius: 10px`
- Flush padding — rows carry their own padding.

### Step row
- `display: grid; grid-template-columns: 40px 1fr; gap: 16px; align-items: start`
- `padding: 16px 20px`
- `border-top: 1px solid var(--line-soft)` on every row except the first

### Step number
- `font-weight: 600`, `color: var(--green)`, `font-size: 13px`
- `font-variant-numeric: tabular-nums`
- Rendered as "01", "02", "03", "04" (two-digit, matches the capture rows in Pillar 3)

### Step body
- `font-size: 15px`, `color: var(--ink)`, `line-height: 1.5`
- Bold fragments (e.g. **Sign up.**, **"use octopad"**) use `font-weight: 500`
- `"use octopad"` wrapped in `<code>` to inherit the site's inline-code treatment (makes the trigger phrase feel like a concrete command)

### Step 1 inline button
- Existing `.btn.btn-primary` class at **regular size** (9px 16px padding, not the hero's `.btn-lg` 13px 22px). The button sits inline after the "Free, no credit card." text, so it needs to fit inside a step row without blowing up the line height.
- Label: `Start free →`
- `href`: same placeholder as the hero's primary CTA (currently `#` — will be set when the signup URL is finalized in a separate task).

### Right column (copy side)
- Eyebrow: existing `.eyebrow` style, **no `.eyebrow-green` variant**, no numeric prefix. Just `Quick Start`.
- H2: existing `.section-title` style (`Set up in minutes.`)
- Closing link: existing link-with-arrow treatment used elsewhere on the site (e.g., the footer CTA links). Green color, medium weight.

### Eyebrow — additional note
Pillars currently use `.eyebrow.eyebrow-green`. Section 6 uses plain `.eyebrow` (no green) to visually differentiate: pillars are feature beats, Section 6 is a utility/action beat.

## Adjacent change — pillar eyebrows

In `src/pages/index.astro`, update three `<span class="eyebrow eyebrow-green">` elements:

| Before | After |
|---|---|
| `01 — Context` | `Context` |
| `02 — Plans` | `Plans` |
| `03 — Memory` | `Memory` |

No other changes to pillar copy, structure, or styling.

## Responsive behavior

Inherits `Pillar`'s existing media query:
- **≥860px:** two-column as designed.
- **<860px:** collapses to single column; right column (eyebrow + H2 + link) stacks above the step card. Step card remains full-width with the same row treatment.

## Testing / verification

1. `npx astro build` passes with no new warnings.
2. `astro preview` visual check at desktop (≥1200px), tablet (~900px), and mobile (~375px) widths.
3. Verify step rhythm matches Pillar 3's "Shared brain" card (same row height, same tabular number treatment).
4. Verify `See the full setup guide →` points to `/getting-started`.
5. Verify `Start free →` matches the hero primary CTA target.
6. Confirm the three pillar eyebrows now read `Context`, `Plans`, `Memory` with no numeric prefix.
7. Lighthouse: no regression on homepage score.

## Notes for implementation

- The locked content page in Octopad (#Website Content — octopad.ai) still shows the teaser as "Section 7" — that's pre-renumbering. The task title and homepage slot are Section 6 after Sections 6 (Emergent benefit) and 8 (Comparison table) were dropped.
- The locked knowledge entry says `/quickstart` for the closing link — use `/getting-started` per the URL amendment in the task description.
- Do NOT introduce any new button size variant. If the regular `.btn.btn-primary` needs visual adjustment to fit inline, raise it — don't silently add a new class.

## Open questions at hand-off

None. All content locked, orientation locked, component approach locked, adjacent pillar edit approved.
