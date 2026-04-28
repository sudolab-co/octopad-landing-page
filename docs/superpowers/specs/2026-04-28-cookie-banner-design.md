# Cookie banner frontend design (octopad.ai + octopad.app)

**Date:** 2026-04-28
**Author:** Claude Opus 4.7 acting as Octopad chief legal counsel
**Source-of-truth copy:** Octopad page #Cookie banner copy v1.2 (revision of v1.1 with placement note correction)
**Implements task:** "Build cookie banner frontend (octopad.ai + octopad.app)" in stream Launch Legal & Compliance
**Implementer brief (execution model):** Sonnet 4.6 high

---

## 1. Plain-English summary

Octopad has two web surfaces. The marketing site (`octopad.ai`, Astro static on Vercel) and the product app (`octopad.app`, Next.js on Railway). Both are Cloudflare-proxied. The legal pack is published, but visitors from EEA, UK, and Switzerland still need a cookie consent banner before any non-essential cookie or analytics script is allowed to fire. This design describes how we ship that banner and the supporting plumbing on both surfaces in one motion, ready for Mixpanel and PostHog to land behind the gate later.

The user-facing copy is locked in #Cookie banner copy v1.2 and is not re-litigated here. This document describes the engineering shape only.

---

## 2. Strategic decisions (confirmed with Alex 2026-04-28)

| # | Decision | Choice | Why |
|---|---|---|---|
| Q1 | Banner posture | **Full banner on both surfaces, treat analytics as live for the gating** | "Ship and don't come back to this." Forward-compatible. When Mixpanel/PostHog land later they slot into an existing gate. |
| Q2 | Cookie preferences placement on octopad.app | **Banner + Settings page entry + small link on auth pages. No global footer on the dashboard.** | Peer-checked against Notion, Linear, Asana. Legal standard is "as easy to withdraw as to give," not "footer link literally." Avoids 32 pixels of chrome on every workspace screen. |
| Q3 | Consent record persistence | **Cookie + localStorage AND server-side Supabase table** | Article 7(1) demonstrability. A cookie alone is on the user's device; if they clear it, the controller cannot demonstrate consent. A small append-only Supabase table closes that gap. |
| Q4 | Sharing strategy between repos | **Parallel `consent-config` files in each repo, byte-identical for shared copy + a build-time string-match test** | The two repos use different stacks (Astro vanilla CSS vs Next.js + Tailwind v4 + React 19). A shared npm package is overkill for two surfaces with a 1-week launch runway. Manual sync + automated drift detection is enough. |
| Q5 | Mixpanel / PostHog SDK install | **Out of scope. Banner ships first; SDK install is a separate task per stream sequencing.** | Engineering note in v1.2: "Banner ships before any non-essential script is wired in." |
| Q6 | Stripe rows in cookie list | **Defer until the Stripe Integration stream wires Stripe.js into `/pricing`** | Stripe is not currently loaded on either surface. Adding placeholder rows now would be inaccurate. Stripe Integration stream owns the row addition. |

---

## 3. Architecture

### 3.1 Two surfaces, two implementations, one config contract

There is no shared package and no shared build pipeline. Each surface gets its own implementation in its native stack. The contract that keeps them in sync is a TypeScript module called `consent-config.ts` that lives identically in both repos (in the shared-copy portions) and ships the per-surface cookie list.

The contract:

```ts
// consent-config.ts (parallel files in both repos)
export const CONSENT_VERSION = 1;

export const COPY = {
  banner: {
    title: "Cookies on Octopad",
    body: "We use cookies to make Octopad work, ...", // verbatim from v1.2
    rejectAll: "Reject all",
    customize: "Customize",
    acceptAll: "Accept all",
    footerLine: "See our [Privacy Policy](/privacy) and [Cookie preferences](#cookie-preferences) for details.",
  },
  modal: {
    title: "Your cookie preferences",
    intro: "Choose which cookies Octopad sets. ...",
    categories: {
      necessary: { label: "Strictly necessary", description: "..." },
      functional: { label: "Functional", description: "..." },
      analytics: { label: "Analytics", description: "..." },
    },
    rejectAll: "Reject all",
    savePreferences: "Save preferences",
    acceptAll: "Accept all",
    confirmation: "Saved. Your cookie preferences are stored. ...",
  },
} as const;

export const COOKIE_LIST: CookieRow[] = [/* per-surface, see §3.5 */];
```

A unit test in each repo asserts `COPY` matches the verbatim strings from v1.2. A nightly CI job (or the Octopad agent that owns the spec) flags drift.

**Plain English:** Each repo has its own copy of the banner code, but the user-facing words sit in one TypeScript file in each. A test makes sure the words don't drift between the two surfaces. The cookie list itself differs between surfaces because each surface fires different cookies.

### 3.2 Geo detection

Both surfaces sit behind Cloudflare. Cloudflare sets the `CF-IPCountry` header on every request to the origin. We rely on this single header on both surfaces. No third-party geo-IP API. No client-side IP lookup.

**EEA + UK + Switzerland country code allowlist (constant in `consent-config.ts`):**

```
AT, BE, BG, CY, CZ, DE, DK, EE, ES, FI, FR, GR, HR, HU, IE, IS, IT,
LI, LT, LU, LV, MT, NL, NO, PL, PT, RO, SE, SI, SK,  // EEA = EU + Iceland, Liechtenstein, Norway
GB,                                                    // UK
CH                                                     // Switzerland
```

**octopad.ai (Astro static on Vercel):** add `src/middleware.ts`. Astro 6 supports middleware via the Vercel adapter (currently set to static output; we extend it minimally — see §6 risks for why this is a non-trivial config change). The middleware reads `CF-IPCountry` and writes the geo into a response cookie `geo_hint` (httpOnly false, 24h, not the consent record). The banner JS reads `geo_hint` synchronously on mount; if the country code is in the allowlist AND no `consent_v1` cookie exists, render the banner.

**octopad.app (Next.js):** extend the existing `src/middleware.ts`. Read `CF-IPCountry` from request headers. Set the same `geo_hint` cookie on the response. Root layout (server component) reads the cookie via `cookies()` and passes the geo-allowlist boolean as a prop to the client `CookieBannerMount` component.

**Plain English:** Cloudflare tells every request which country the visitor is in. Our middleware (a tiny piece of code that runs on every page load) reads that country, decides if the visitor needs the banner, and tells the banner code "yes" or "no" via a small cookie.

### 3.3 Consent state model

Three layers:

**Layer 1 — Active state on the visitor's browser. First-party cookie `consent_v1`:**

```json
{
  "v": 1,                              // consent string version
  "uuid": "uuid-v4-from-localStorage", // visitor identifier, generated on first banner action
  "ts": "2026-04-28T10:34:11Z",        // ISO timestamp of this consent action
  "categories": {
    "necessary": true,                 // always true (gloss for the user)
    "functional": false,
    "analytics": false
  }
}
```

`consent_v1` is set with `Domain=.octopad.ai` (or `.octopad.app` on the product app), `Secure`, `SameSite=Lax`, `Max-Age=33696000` (13 months in seconds). The two surfaces' cookies are independent (different domains, no shared cookie).

**Layer 2 — Visitor identifier persistence. localStorage key `octopad_consent_uuid`:**

Generated as a UUID v4 on the visitor's first banner interaction. Survives if the user clears `consent_v1` cookie but not localStorage. Used to correlate consent records across actions.

**Layer 3 — Server-side audit log. Supabase append-only `consent_records` table:**

```sql
create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  visitor_uuid uuid not null,
  surface text not null check (surface in ('octopad.ai', 'octopad.app')),
  consent_version integer not null,
  necessary boolean not null default true,
  functional boolean not null,
  analytics boolean not null,
  action text not null check (action in ('accept_all', 'reject_all', 'save_preferences')),
  page_url text not null,
  country_code text,        -- snapshot of CF-IPCountry at time of action
  user_agent text,
  created_at timestamptz not null default now()
);

alter table public.consent_records enable row level security;

-- Anyone can insert. No one (anon or authenticated) can read.
-- Service role bypasses RLS and is the only path to read for compliance demonstrations.
create policy "anonymous_insert"
  on public.consent_records
  for insert
  to anon, authenticated
  with check (true);
```

Each click on Accept all / Reject all / Save preferences fires one insert from the client via `supabase-js` using the public anon key. No user authentication required. Bot writes are acceptable cost; a regulator only cares that genuine consent rows exist when a real user disputes.

**Plain English:** When a visitor clicks Accept / Reject / Save, three things happen. (1) we set a cookie on their browser so we know what they chose for next time. (2) we save a UUID in localStorage so we can identify the same visitor across visits. (3) we write a row to a Supabase table on our backend, which is the legally-required proof we can produce if a regulator asks "prove this user consented on this date."

### 3.4 UI placement

#### octopad.ai (marketing)

| Surface | Where | Visibility |
|---|---|---|
| First-load banner | Bottom-fixed banner above the footer | Only when `geo_hint` ∈ allowlist AND no `consent_v1` set |
| Cookie preferences link | Existing footer Legal column, alongside Privacy / Terms / DPA | Always, all visitors |
| Preferences modal | Same modal opens from banner or footer link | On click |

Files:
- `src/components/CookieBanner.astro` (NEW)
- `src/components/CookiePreferencesModal.astro` (NEW)
- `src/components/Footer.astro` (EDIT) add Cookie preferences link
- `src/layouts/BaseLayout.astro` (EDIT) mount banner + modal
- `src/lib/consent/config.ts` (NEW) the shared config contract
- `src/lib/consent/state.ts` (NEW) read/write consent_v1, localStorage uuid, server insert
- `src/middleware.ts` (NEW) CF-IPCountry → geo_hint cookie

#### octopad.app (product)

| Surface | Where | Visibility |
|---|---|---|
| First-load banner | Bottom-fixed banner above all chrome | Only when `geo_hint` ∈ allowlist AND no `consent_v1` set, on every route |
| Cookie preferences link in user Settings | New "Privacy & Cookies" subsection in `/settings` | Authenticated users |
| Cookie preferences link on auth pages | Small bottom-of-card link on `/login`, `/signup`, `/forgot-password`, `/reset-password` | Unauthenticated visitors |
| Preferences modal | Same modal opens from banner / settings entry / auth-page link | On click |
| **No global footer on the dashboard** | n/a | Confirmed Q2 decision |

Files:
- `src/middleware.ts` (EDIT) extend with CF-IPCountry → geo_hint cookie
- `src/lib/consent/config.ts` (NEW)
- `src/lib/consent/state.ts` (NEW)
- `src/lib/consent/server.ts` (NEW) server-side helpers (read cookie in layout)
- `src/components/cookie-banner/banner.tsx` (NEW)
- `src/components/cookie-banner/preferences-modal.tsx` (NEW)
- `src/components/cookie-banner/category-toggle.tsx` (NEW) toggle primitive (no shadcn/ui in repo)
- `src/components/cookie-banner/cookie-banner-mount.tsx` (NEW) client component for root layout
- `src/app/layout.tsx` (EDIT) mount banner
- `src/app/(app)/settings/page.tsx` (EDIT) add Privacy & Cookies subsection
- `src/app/login/page.tsx` (EDIT), signup, forgot-password, reset-password (EDIT) add link

The product app has **no shadcn/ui or Radix primitives installed**. We build the modal/dialog with the native `<dialog>` element + a hand-rolled toggle. No new dependency.

### 3.5 Cookie list per surface

#### octopad.ai (rendered in modal cookie list)

| Category | Cookie name | Provider | Purpose | Duration |
|---|---|---|---|---|
| Strictly necessary | `__cf_bm` | Cloudflare | Bot-management challenge token | 30 minutes |
| Strictly necessary | `consent_v1` | Octopad | Records the visitor's cookie consent choice | 13 months |
| Strictly necessary | `geo_hint` | Octopad | Caches the visitor's country code so the banner does not flash on every page load | 24 hours |

**Hard rule (resolves the v1.2 engineering note for our specific situation):** render the Functional and Analytics categories on octopad.ai with the row text "No cookies in this category on octopad.ai today." Do NOT hide them. This is the explicit consequence of Alex's "ship as if analytics were already live" directive: visitors should see the category exists and what it would contain when the SDKs land. The v1.2 hide-or-render guidance defers to the implementer; this design picks render.

#### octopad.app (rendered in modal cookie list — names to be audited at build time)

| Category | Cookie name | Provider | Purpose | Duration |
|---|---|---|---|---|
| Strictly necessary | `sb-<project-ref>-auth-token` (and chunked `.0`, `.1` if cookie size > 4kb) | Supabase via `@supabase/ssr` | Authenticate session | Session and 7 days |
| Strictly necessary | `__cf_bm` | Cloudflare | Bot-management challenge token | 30 minutes |
| Strictly necessary | `consent_v1` | Octopad | Records consent choice | 13 months |
| Strictly necessary | `geo_hint` | Octopad | Caches visitor country | 24 hours |
| Functional | `theme` | Octopad | Remembers light/dark/system theme | 12 months |
| Functional | `lang` | Octopad | Remembers language preference | 12 months |
| Analytics | `mp_*_mixpanel` | Mixpanel | Event tracking, funnels, retention | 12 months |
| Analytics | `ph_*`, `ph_*_window_id` | PostHog | Event tracking, feature flags | 12 months |

**Audit at build time:** the implementer must verify the actual `sb-<project-ref>-auth-token` cookie name emitted by `@supabase/ssr` v0.8 against the Supabase project's URL ref (e.g. `sb-abcd1234-auth-token` if the project URL is `abcd1234.supabase.co`). The project ref is in `NEXT_PUBLIC_SUPABASE_URL`. **Do not infer; read the env var and assert at build time.**

**`next-themes` storage check:** verify whether `next-themes` is currently configured for cookie storage or localStorage. Default is localStorage. If localStorage, drop the `theme` cookie row from Functional (the row is for cookies, not localStorage) and replace with a one-line note in the modal: "Theme is stored in your browser's local storage, not a cookie." If cookie, keep it. Implementer reports the result in the PR description.

**`lang` cookie:** Octopad is English-only as of 2026-04-28 and `lang` is not yet emitted by the app. The row is listed in the modal per Alex's "ship as if analytics were live" directive (forward-compatible). Render the row with text "Set when language preference UI ships. Not currently emitted." If the implementer prefers, drop the row entirely and reinstate when i18n lands; flag at PR.

### 3.6 Withdrawal flow

When a visitor toggles a category off and clicks Save preferences:

1. Update `consent_v1` cookie with new state.
2. Insert a new row in `consent_records` (action=`save_preferences`).
3. **Functional toggled off:** delete first-party cookies in the category (`theme` if cookie-stored). The site falls back to system theme.
4. **Analytics toggled off:** call `posthog.opt_out_capturing()` and `mixpanel.opt_out_tracking()` if the SDKs are loaded. No-op if not loaded yet (SDKs land in a future task). Delete `mp_*_mixpanel`, `ph_*`, `ph_*_window_id` cookies.
5. Show confirmation toast.

The withdrawal flow is identical from the banner, the settings entry, and the auth-page link. It's the same modal.

**Plain English:** Turning a category off and clicking Save does three things. (1) we update the cookie that remembers the choice. (2) we delete the cookies in that category from the visitor's browser. (3) we tell Mixpanel and PostHog to stop tracking via their built-in opt-out functions, if those SDKs happen to be loaded.

### 3.7 Re-prompt logic

On every page load, after geo check passes:

1. If no `consent_v1` cookie exists → show banner.
2. If `consent_v1.v < CONSENT_VERSION` → show banner (consent string version bumped means a new category was added; re-collect).
3. If `Date.now() - consent_v1.ts > 13 months` → show banner.
4. Else → no banner.

Cookie additions within an existing category do NOT bump `CONSENT_VERSION`. Only category additions or removals do. (A new advertising category in the future would bump v=1 to v=2.)

---

## 4. Tests (acceptance gates)

Each surface ships with these tests. Failing tests block the PR.

### 4.1 Button parity test (CNIL critical)

Playwright test: take a screenshot of the first-load banner. Assert all three buttons (`Reject all`, `Customize`, `Accept all`) have:
- Bounding boxes within 1px of each other in width AND height.
- Identical computed CSS color, background-color, border, font-weight.
- Identical CSS class on the button element.

Same test against the modal's three buttons.

**Why:** CNIL Recommendation 2020-091 explicitly forbids visually-asymmetric Reject vs Accept. This test is the single biggest legal hygiene gate.

### 4.2 No cookies before consent (ePrivacy 5(3) critical)

Playwright test: load `/`, do not click anything, wait 5s. Assert:
- `document.cookie` contains ONLY `__cf_bm`, `geo_hint`, and (on octopad.app) `sb-*-auth-token` if logged in.
- No `mp_*`, `ph_*`, `theme`, `lang` cookies are present.
- No network request to `mixpanel.com`, `posthog.com`, or any analytics domain.

This test is the single biggest ePrivacy 5(3) hygiene gate.

### 4.3 X / Escape / scroll / click-outside don't count as consent

Playwright test: load page, click outside the banner, scroll, press Escape. Assert no `consent_v1` cookie is set. Assert no row in `consent_records`.

(Italy Garante June 2021 specifically calls out the X.)

### 4.4 13-month re-prompt logic

Unit test on `shouldShowBanner({ consentRecord, now })`. Pass a `consentRecord` with `ts = 14 months ago`. Assert returns true.

### 4.5 Version bump triggers re-prompt

Unit test: pass a `consentRecord` with `v = 0` and `CONSENT_VERSION = 1`. Assert returns true.

### 4.6 Withdrawal flow

Playwright test: visit page, accept all, verify cookies set. Open preferences modal, toggle Analytics off, save. Assert `mp_*` and `ph_*` cookies deleted. Assert `consent_v1.categories.analytics === false`.

### 4.7 No cookie wall

Manual checklist (documented in PR): visit page, dismiss banner, verify the site is fully usable. Visit page, reject all, verify the site is fully usable.

### 4.8 French CNIL dummy visit

Manual checklist (documented in PR):
- Reject all and Accept all visually identical (verified by 4.1)
- No dark patterns: no pre-checked toggles, no "Continue" buttons that imply consent
- No cookie wall (verified by 4.7)
- Reachable Cookie preferences link from any state (footer on octopad.ai, settings + auth-page link on octopad.app)
- 13-month re-prompt logic (verified by 4.4)

The implementer attaches a screen recording of the dummy visit to the PR.

---

## 5. Implementation sequencing

| Phase | Scope | Why this order |
|---|---|---|
| 1 | Supabase migration: `consent_records` table + RLS | Both surfaces depend on this. Land first to unblock parallel surface work. |
| 2 | Shared `consent-config.ts` + state module + server insert helper | Same shape on both surfaces. Author once, copy to both repos. |
| 3 | octopad.ai: middleware + footer link + banner + modal + tests | Smaller surface, cleaner stack, proves the model. |
| 4 | octopad.app: middleware extension + banner + settings entry + auth-page links + modal + tests | Larger surface, integrates with existing layout / auth / sidebar. |
| 5 | Cross-repo string-match test in CI for COPY constants | Drift detection. |
| 6 | (Done 2026-04-28 in this design session) Octopad page Cookie banner copy v1.1 → v1.2 placement-note correction | Spec hygiene; included for traceability. |
| 7 | PR review + manual CNIL dummy visit + sign-off | Launch gate. |

Phases 3 and 4 can run in parallel after phase 2 if the implementer is comfortable; otherwise serialize.

---

## 6. Implementation risks and notes

### 6.1 octopad.ai is currently `output: "static"` on Astro

Adding middleware on Astro Vercel adapter requires either (a) switching to `output: "hybrid"` or (b) running the middleware as a Vercel Edge Middleware function (`middleware.ts` at the project root, outside Astro's adapter, in standard Next.js-style Vercel Edge format).

**Recommendation: option (b).** Place `middleware.ts` at the project root (peer of `astro.config.mjs`). Vercel auto-detects and runs it on the edge. Astro stays static. This is the lowest-blast-radius change.

### 6.2 No shadcn/ui in octopad/frontend

The product app does not currently have a Dialog / Switch / Button primitive library. We build:
- `<dialog>` native HTML element with custom styling (Tailwind v4)
- A small toggle component (~40 lines)
- Re-use existing button styles from the app

**Escape hatch:** if axe-core or Lighthouse accessibility tests fail with the native `<dialog>` + hand-rolled toggle (e.g. focus trap or screen-reader announcement issues), the implementer is allowlisted to add `@radix-ui/react-dialog` and `@radix-ui/react-switch` without further sign-off. Otherwise stay native.

### 6.3 Supabase anon insert on both domains

The Supabase client uses the public anon key. It works from any origin including `octopad.ai`. Confirm CORS on Supabase project allows both domains. (Supabase by default allows all origins for client SDK; check project settings.)

### 6.4 Geo cookie privacy

`geo_hint` is set by us, contains a country code, lasts 24h. This is a strictly-necessary cookie used to suppress the banner on subsequent page loads in the same session — without it, every page navigation would re-evaluate geo and re-flash the banner. List it under Strictly Necessary in both surfaces' cookie tables.

### 6.5 Localized copy

v1.2 is English-only. Localized copy (French, German, Spanish, Italian) is out of scope for this design. If/when localization happens, the `COPY` constant in `consent-config.ts` becomes a per-locale lookup. No structural change.

### 6.6 Performance budget

Banner JS payload should be < 8 KB gzipped on both surfaces. octopad.ai is a static marketing site where every byte matters; do not pull in a UI framework just for the banner.

---

## 7. Out of scope (explicit exclusions)

- Mixpanel SDK install (separate task, gated behind Analytics consent at install time)
- PostHog SDK install (separate task, gated behind Analytics consent at install time)
- Stripe.js install + cookie list rows (Stripe Integration stream)
- External counsel review (deferred per parent legal stance)
- Localized copy beyond English
- Drafting copy (v1.2 is the source of truth)
- Privacy Policy edit to reference the consent log (separate task; the Policy already broadly references "consent management")

---

## 8. Done when

Per the parent task acceptance criteria:

- ✅ Banner ships on both surfaces (octopad.ai + octopad.app).
- ✅ Banner copy matches #Cookie banner copy v1.2 verbatim (string-match test in CI).
- ✅ Cookie list table renders per-surface with actual SDK-emitted cookie names (audit-at-build-time enforced by build script).
- ✅ Consent record persists with version tracking (cookie + localStorage + Supabase table).
- ✅ 13-month re-prompt scheduled (unit test).
- ✅ Tested with French CNIL dummy visit (manual checklist + screen recording attached to PR).
- ✅ Mixpanel, PostHog, and Stripe.js (when added) wire behind the appropriate consent gate (gate API exists; SDK install is separate task).
- ✅ Cookie banner copy v1.1 page on Octopad updated to v1.2 with the placement-note correction (engineering note: "reachable from banner, account settings, and unauthenticated auth pages" replacing "permanent footer link on every page of octopad.app").

---

## 9. References

- #Cookie banner copy v1.2 (Octopad page, source of truth for user-facing copy)
- #Cookie banner copy v1.0 Adversarial Review 2026-04-25 (Octopad page, full rationale on per-surface render and identity-claim corrections)
- #Legal Documents Launch Handoff 2026-04-23 (Octopad page, pre-publish checklist item 3)
- ePrivacy Directive 2002/58/EC Article 5(3)
- GDPR Article 7(1) (demonstrability of consent)
- CNIL Recommendation 2020-091 (Reject all parity)
- ICO PECR guidance
- TTDSG (Germany)
- Garante Guidance June 2021 (Italy, X-to-close)
