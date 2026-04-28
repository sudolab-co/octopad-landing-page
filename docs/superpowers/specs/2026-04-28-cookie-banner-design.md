# Cookie banner frontend design (octopad.ai + octopad.app)

**Date:** 2026-04-28 (revised post-adversarial-review same day)
**Author:** Claude Opus 4.7 acting as Octopad chief legal counsel
**Source-of-truth copy:** Octopad page #Cookie banner copy v1.3 (revision of v1.2 with retention policy, CCPA acknowledgment, Mixpanel/PostHog "not yet active" framing)
**Implements task:** "Build cookie banner frontend (octopad.ai + octopad.app)" in stream Launch Legal & Compliance
**Implementer brief (execution model):** Sonnet 4.6 high
**Adversarial review log:** five parallel agents 2026-04-28 (Astro/Vercel, Next.js/React 19, Privacy/GDPR/ePrivacy, Supabase/security, DevOps/shipping). 14 critical findings integrated below; review notes archived in this session's transcript.

---

## 1. Plain-English summary

Octopad has two web surfaces. The marketing site (`octopad.ai`, Astro static on Vercel) and the product app (`octopad.app`, Next.js on Railway). Both are Cloudflare-proxied. The legal pack is published, but visitors from EEA, UK, Switzerland, and Brazil still need a cookie consent banner before any non-essential cookie or analytics script is allowed to fire. California visitors (and anyone sending Global Privacy Control) need a "Your Privacy Choices" path. This design describes how we ship that banner and the supporting plumbing on both surfaces in one motion, ready for Mixpanel and PostHog to land behind the gate later.

The user-facing copy is locked in #Cookie banner copy v1.3 and is not re-litigated here. This document describes the engineering shape only.

---

## 2. Strategic decisions (confirmed with Alex 2026-04-28)

| # | Decision | Choice | Why |
|---|---|---|---|
| Q1 | Banner posture | **Full banner on both surfaces, treat analytics as live for the gating** | "Ship and don't come back to this." Forward-compatible. When Mixpanel/PostHog land later they slot into an existing gate. |
| Q2 | Cookie preferences placement on octopad.app | **Banner + Settings page entry + small link on auth pages. No global footer on the dashboard.** | Peer-checked against Notion, Linear, Asana. Legal standard is "as easy to withdraw as to give," not "footer link literally." Avoids 32 pixels of chrome on every workspace screen. |
| Q3 | Consent record persistence | **Cookie + localStorage AND server-side Supabase table behind an Edge Function with HMAC integrity** | Article 7(1) demonstrability. A cookie alone is on the user's device; if they clear it, the controller cannot demonstrate consent. The Edge Function adds server-set integrity (IP-derived hash with daily salt) so the audit log is forensically defensible. |
| Q4 | Sharing strategy between repos | **Parallel `consent-config` files in each repo + a local snapshot test in each repo's build** | The two repos use different stacks. No cross-repo CI exists today; each repo's build runs the snapshot test independently, drift surfaces at next deploy on either side. |
| Q5 | Mixpanel / PostHog SDK install | **Out of scope. Banner ships first; SDK install is a separate task per stream sequencing.** | Engineering note: banner ships before any non-essential script is wired in. SDK loader contract is specified in §3.9 below. |
| Q6 | Stripe rows in cookie list | **Defer until the Stripe Integration stream wires Stripe.js into `/pricing`** | Stripe is not currently loaded on either surface. |
| Q7 (post-review) | CCPA/CPRA coverage | **Minimum-viable: "Your Privacy Choices" footer link + GPC handler on both surfaces. Same modal, US-specific copy.** | California exposure is real ($7,500/violation). Notion and Linear ship this pattern. Full CCPA Sale/Share categorization deferred until adtech enters the stack. |
| Q8 (post-review) | Geo-detection failure mode | **Fail-open: missing/unknown `CF-IPCountry` shows the banner** | Article 5(3) is strict-liability; missing the banner on a real EEA visitor is the violation. Showing the banner to a non-EEA visitor is consent fatigue, not illegal. |
| Q9 (post-review) | Kill switch | **`NEXT_PUBLIC_CONSENT_BANNER_ENABLED` env flag, default true** | Both repos auto-deploy on push. If the banner breaks something, env-flag flip is faster than `git revert` + redeploy. |

---

## 3. Architecture

### 3.1 Two surfaces, two implementations, one config contract

There is no shared package and no shared build pipeline. Each surface gets its own implementation in its native stack. The contract that keeps them in sync is a TypeScript module called `consent-config.ts` that lives in both repos with byte-identical `COPY` constants and a build-time snapshot test.

```ts
// consent-config.ts (parallel files in both repos)
export const CONSENT_VERSION = 1;

export const COPY = {
  banner: { /* verbatim from v1.3 §1 */ },
  modal: { /* verbatim from v1.3 §2 */ },
  ccpa: { /* verbatim from v1.3 §5 */ },
} as const;

export const COOKIE_LIST: CookieRow[] = [/* per-surface, see §3.5 */];

// EEA + UK + CH + Brazil. Used to decide whether to show the banner.
export const CONSENT_COUNTRIES = new Set([
  // EU 27
  "AT","BE","BG","CY","CZ","DE","DK","EE","ES","FI","FR","GR","HR","HU","IE",
  "IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK",
  // EEA non-EU
  "IS","LI","NO",
  // UK + Switzerland
  "GB","CH",
  // Brazil (LGPD)
  "BR",
  // French overseas territories Cloudflare emits separately
  "GP","MQ","GF","RE","YT","BL","MF","PM","WF","PF","NC","TF",
  // Åland (Finland), Gibraltar (UK)
  "AX","GI",
]);

// California — separate code path for CCPA "Your Privacy Choices"
export const CCPA_COUNTRIES = new Set(["US"]);
```

Each repo includes `tests/consent-config.snapshot.test.ts` which asserts `COPY` matches a checked-in snapshot of v1.3. When v1.3 → v1.4 happens, the snapshot is regenerated in both repos in lockstep.

**Plain English:** Each repo has its own copy of the banner code, but the user-facing words sit in one TypeScript file in each. A test makes sure the words don't drift between the two surfaces. The cookie list itself differs between surfaces because each surface fires different cookies.

### 3.2 Geo detection

Both surfaces sit behind Cloudflare. Cloudflare sets the `CF-IPCountry` header on every request to the origin. We rely on this single header. No third-party geo-IP API. No client-side IP lookup.

**Failure mode (Q8):** missing or unknown country (`XX`, `T1` for Tor, empty) → banner shows. EEA-allowlist test is `country !== undefined && country !== "" && (CONSENT_COUNTRIES.has(country) || country === "XX" || country === "T1")` — the absence of a known country is treated as "could be EEA, show banner."

#### octopad.ai (Astro static on Vercel)

**Errata (2026-04-28):** the original design below — middleware rewrites the URL with a `__geo` search param, BaseLayout.astro reads it and emits a `<meta name="x-octopad-geo">` tag — does not work with `output: 'static'`. Astro evaluates `Astro.url.searchParams.get('__geo')` at build time, not request time, so the meta tag is permanently baked as `XX` for every visitor and the banner shows worldwide. Replaced with a JSON endpoint at `/api/geo` served by the middleware; the consent module fetches it on load. Trade-off: a one-roundtrip async delay before the banner appears for EEA visitors, in exchange for keeping the static site CDN-cacheable. The banner is hidden in markup by default, so the delay is "appears slightly later" not a visible flash.

**Web-standard Vercel Edge Middleware** (NOT Next.js style) at the project root, peer of `astro.config.mjs`:

```ts
// middleware.ts (project root)
export const config = { matcher: ["/api/geo"] };

export default function middleware(request: Request): Response {
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    "XX";
  return new Response(JSON.stringify({ country }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}
```

The consent module kicks off `fetch('/api/geo')` at module evaluation (in flight while the DOM parses) and `bootstrap()` awaits the result before deciding banner state. Failures (network error, non-2xx, malformed JSON) resolve to `undefined` → fail-open EEA per Q8.

`Cache-Control: private, no-store` on the `/api/geo` response prevents the edge from caching one visitor's country for the next.

#### octopad.app (Next.js)

Extend the existing `src/middleware.ts`. The existing middleware does Supabase auth refresh + maintenance gate redirects. Geo detection must be additive and survive existing redirects.

```ts
// Inside updateSession(), immediately after the line:
//   let supabaseResponse = NextResponse.next({ request });
const country = request.headers.get("CF-IPCountry") ?? "XX";
supabaseResponse.headers.set("x-octopad-geo", country);
// Do NOT set as cookie — the existing redirectWithCookies copies all cookies,
// but a header is cheaper and avoids cache-fragmentation concerns.
```

The root layout (server component) reads the header via `headers()` from `next/headers` and passes the geo string + the EEA-allowlist boolean to the client `CookieBannerMount` component as a prop. No cookie, no race, no client fetch.

**Plain English:** Cloudflare tells every request which country the visitor is in. Our middleware reads that country and stamps it onto the page (as a meta tag on octopad.ai, as a response header on octopad.app). The banner JS reads it synchronously when the page renders. No fetch, no flash, no cookie race.

### 3.3 Consent state model

Three layers + a Supabase Edge Function as the integrity boundary.

**Layer 1 — Active state on the visitor's browser. First-party cookie `consent_v1`:**

```json
{
  "v": 1,
  "uuid": "uuid-v4-from-localStorage",
  "ts": "2026-04-28T10:34:11Z",
  "categories": { "necessary": true, "functional": false, "analytics": false }
}
```

`Domain=.octopad.ai` (or `.octopad.app`), `Path=/`, `Secure`, `SameSite=Lax`, `Max-Age=33696000` (13 months in seconds).

**Layer 2 — Visitor identifier persistence. localStorage key `octopad_consent_uuid`:**

UUID v4 generated client-side on the visitor's first banner interaction.

**Layer 3 — Server-side audit log. Supabase Edge Function `record-consent` writing to `consent_records`:**

The client does NOT use `supabase-js` (too heavy — 30KB gz). The client posts a small JSON payload to `https://<supabase-ref>.supabase.co/functions/v1/record-consent` via raw `fetch`. The Edge Function:

1. Validates origin against `https://octopad.ai`, `https://www.octopad.ai`, `https://octopad.app`.
2. Reads `CF-IPCountry` and the IP from request headers.
3. Computes `request_ip_hash = sha256(ip + DAILY_SALT_FROM_VAULT)` — daily salt rotated by a cron, prevents correlating across days while still allowing same-day audit lookup.
4. Strips query strings and fragments from `page_url` (tokens, emails, oauth state can leak via `?email=`, `?token=`).
5. Truncates `user_agent` to 256 chars.
6. Inserts into `consent_records` using the service role.

Schema:

```sql
create table public.consent_records (
  id uuid primary key default gen_random_uuid(),
  visitor_uuid uuid not null,
  user_id uuid references auth.users(id) on delete set null,  -- nullable, populated post-signup via claim RPC
  surface text not null check (surface in ('octopad.ai', 'octopad.app', 'staging.octopad.ai', 'staging.octopad.app')),
  consent_version integer not null,
  necessary boolean not null default true,
  functional boolean not null,
  analytics boolean not null,
  action text not null check (action in ('accept_all', 'reject_all', 'save_preferences')),
  page_url text not null check (length(page_url) <= 2048),
  user_agent text check (length(user_agent) <= 256),
  country_code text check (length(country_code) <= 4),
  request_ip_hash text not null,  -- server-set, integrity tag
  created_at timestamptz not null default now()
);

create index consent_records_visitor_uuid_created_at_idx
  on public.consent_records (visitor_uuid, created_at desc);

alter table public.consent_records enable row level security;

-- No anon insert (Edge Function uses service role).
-- Service role bypasses RLS for reads.
revoke update, delete on public.consent_records from anon, authenticated;

comment on table public.consent_records is
  'GDPR Article 7(1) consent demonstrability log. Append-only. Service-role-read-only. Retention: 6 years per UK Limitation Act 1980; FR Civil Code Art 2224 = 3 years. Purged by cron job consent_records_purge_old.';
```

Retention purge: a Supabase scheduled function (pg_cron) runs nightly:

```sql
delete from public.consent_records
where created_at < now() - interval '6 years';
```

**Plain English:** When a visitor clicks Accept/Reject/Save, the browser posts a small JSON to our Supabase Edge Function. The Edge Function adds a server-side fingerprint (a daily-rotating hash of the IP) so a regulator can verify the row came from a real visitor, then writes to an append-only table. We keep rows for six years then auto-delete.

### 3.4 UI placement

#### octopad.ai (marketing)

| Surface | Where | Visibility |
|---|---|---|
| First-load banner | Bottom-fixed banner above the footer | EEA/UK/CH/BR allowlist + no `consent_v1` set |
| Cookie preferences link | Footer Legal column, alongside Privacy / Terms / DPA | Always |
| "Your Privacy Choices" link | Footer Legal column, only for US visitors AND visitors sending GPC | Conditional |
| Preferences modal | Same modal opens from any link | On click |

Files (in `/Users/alexandre/GitHub/octopad-landing-page`):
- `middleware.ts` (NEW, project root, Web-standard Edge Middleware) CF-IPCountry → meta tag injection
- `src/components/CookieBanner.astro` (NEW)
- `src/components/CookiePreferencesModal.astro` (NEW)
- `src/components/Footer.astro` (EDIT) add Cookie preferences link + conditional Your Privacy Choices link
- `src/layouts/BaseLayout.astro` (EDIT) emit `<meta name="x-octopad-geo">` + mount banner + mount modal
- `src/lib/consent/config.ts` (NEW) shared config contract
- `src/lib/consent/snapshot.ts` (NEW) checked-in COPY snapshot for the build-time test
- `public/scripts/consent.js` (NEW) vanilla TS/JS banner logic, loaded with `<script is:inline defer src="/scripts/consent.js">` matching the existing `tweaks.js` pattern
- `tests/consent-config.snapshot.test.ts` (NEW)
- `tests/consent.spec.ts` (NEW Playwright tests)
- `.env.example` (EDIT) document `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_CONSENT_BANNER_ENABLED`

#### octopad.app (product)

| Surface | Where | Visibility |
|---|---|---|
| First-load banner | Bottom-fixed banner mounted in root layout | EEA/UK/CH/BR allowlist + no `consent_v1` set, on every route |
| Cookie preferences entry in Settings | New "Privacy & Cookies" section in `account-settings-client.tsx` (the actual UI; the Server `page.tsx` just hydrates) | Authenticated users |
| Cookie preferences link on auth pages | `(auth)/layout.tsx` shared layout under `/login`, `/signup`, `/forgot-password`, `/reset-password` | Unauthenticated |
| "Your Privacy Choices" link | Same `(auth)/layout.tsx` shared layout + Settings entry | US visitors + GPC senders |
| Preferences modal | Same modal opens from any entry point | On click |
| **No global footer on the dashboard** | n/a | Confirmed Q2 |

Files (in `/Users/alexandre/GitHub/octopad/frontend`):
- `src/middleware.ts` (EDIT) add `CF-IPCountry` → response header line, immediately after `NextResponse.next` and before maintenance gate
- `src/lib/consent/config.ts` (NEW)
- `src/lib/consent/snapshot.ts` (NEW)
- `src/lib/consent/state.ts` (NEW) read/write consent_v1, localStorage uuid, post to Edge Function
- `src/lib/consent/api.ts` (NEW) public consent API surface (§3.8)
- `src/components/cookie-banner/banner.tsx` (NEW)
- `src/components/cookie-banner/preferences-modal.tsx` (NEW)
- `src/components/cookie-banner/category-toggle.tsx` (NEW)
- `src/components/cookie-banner/cookie-banner-mount.tsx` (NEW client component, reads geo prop from server layout)
- `src/components/cookie-banner/your-privacy-choices-link.tsx` (NEW)
- `src/app/layout.tsx` (EDIT) mount banner via `next/dynamic({ ssr: false })`, pass geo prop read from `headers()`
- `src/app/(auth)/layout.tsx` (NEW) shared layout for `/login`, `/signup`, `/forgot-password`, `/reset-password`. Move existing pages under this group (or wrap in this layout if they remain at their current paths — Next.js route groups don't change URLs, just colocate files).
- `src/app/(app)/settings/account-settings-client.tsx` (EDIT) add "Privacy & Cookies" section entry that opens the modal
- `tests/consent-config.snapshot.test.ts` (NEW)
- `tests/consent.spec.ts` (NEW Playwright)
- `.env.local.example` (EDIT) document `NEXT_PUBLIC_CONSENT_BANNER_ENABLED`

The product app has **no shadcn/ui or Radix primitives installed**. We build the modal/dialog with the native `<dialog>` element + a hand-rolled toggle. **React 19 hydration note:** render `<dialog>` without `open` attribute on the server; call `dialogRef.current?.showModal()` in `useEffect` to avoid hydration desync. Escape closes the modal but does NOT count as consent (closing without saving is a no-op on consent state).

**Escape hatch:** if axe-core or Lighthouse accessibility tests fail with the native `<dialog>` + hand-rolled toggle, the implementer is allowlisted to add `@radix-ui/react-dialog` and `@radix-ui/react-switch` without further sign-off.

### 3.5 Cookie list per surface

#### octopad.ai (rendered in modal cookie list)

| Category | Cookie name | Provider | Purpose | Duration |
|---|---|---|---|---|
| Strictly necessary | `__cf_bm` | Cloudflare | Bot-management challenge token | 30 minutes |
| Strictly necessary | `consent_v1` | Octopad | Records the visitor's cookie consent choice | 13 months |

(`geo_hint` cookie removed in this revision — geo flows via meta tag injection now.)

The Functional and Analytics categories on octopad.ai render with row text **"Not currently active on octopad.ai. Will appear when the relevant SDKs ship."** This addresses the privacy reviewer's transparency concern: visitors are not told consent is being asked for cookies that exist; they are told the categories exist for forward compatibility.

#### octopad.app (rendered in modal cookie list — names audited at build time)

| Category | Cookie name | Provider | Purpose | Duration |
|---|---|---|---|---|
| Strictly necessary | `sb-<project-ref>-auth-token` (and chunked `.0`, `.1` if >4kb) | Supabase via `@supabase/ssr` | Authenticate session | Session and 7 days |
| Strictly necessary | `__cf_bm` | Cloudflare | Bot-management challenge token | 30 minutes |
| Strictly necessary | `consent_v1` | Octopad | Records consent choice | 13 months |
| Analytics | `mp_*_mixpanel` | [Mixpanel](https://example.com/privacy#subprocessors-mixpanel) | Event tracking, funnels, retention. **Not currently active. Will appear when SDK ships.** | 12 months |
| Analytics | `ph_*`, `ph_*_window_id` | [PostHog](https://example.com/privacy#subprocessors-posthog) | Event tracking, feature flags. **Not currently active. Will appear when SDK ships.** | 12 months |

(`theme` and `lang` rows removed: `next-themes` default is localStorage and `lang` is not yet emitted. Per privacy review, listing cookies that aren't set = regulator-bait inaccuracy.)

**Subprocessor links:** the provider column links to the Privacy Policy section that names the processor (GDPR Article 13(1)(e)).

**Audit at build time:** the implementer must verify the actual `sb-<project-ref>-auth-token` cookie name emitted by `@supabase/ssr` v0.8 against the Supabase project's URL ref. The project ref is in `NEXT_PUBLIC_SUPABASE_URL`. **Read the env var; do not infer.**

### 3.6 Withdrawal flow

When a visitor toggles a category off and clicks Save preferences:

1. Update `consent_v1` cookie with new state.
2. POST to Edge Function `record-consent` with action=`save_preferences`.
3. **Functional toggled off:** delete first-party cookies in the category. (No-op today — neither surface emits Functional cookies.)
4. **Analytics toggled off:** call `posthog.opt_out_capturing()` and `mixpanel.opt_out_tracking()` if the SDKs are loaded. No-op if not loaded yet. Delete `mp_*_mixpanel`, `ph_*`, `ph_*_window_id` cookies.
5. Show confirmation toast.

The withdrawal flow is identical from banner / settings entry / auth-page link / Your Privacy Choices link.

### 3.7 Re-prompt logic

On every page load, after geo check passes:

1. No `consent_v1` → show banner.
2. `consent_v1.v < CONSENT_VERSION` → show banner (category added; re-collect).
3. `Date.now() - consent_v1.ts > 13 months` → show banner.
4. Else → no banner.

Cookie additions within an existing category do NOT bump `CONSENT_VERSION`. Only category additions or removals do.

### 3.8 Public consent API contract

Both surfaces expose the same API for SDK loaders to consume.

**Browser global** (window-scoped, set by the banner module on load):

```ts
window.octopadConsent = {
  has(category: "necessary" | "functional" | "analytics"): boolean,
  on(event: "change" | "accept" | "reject", cb: (state: ConsentState) => void): () => void,
  get(): ConsentState | null,
  isEnabled(): boolean,  // returns false when CONSENT_BANNER_ENABLED env flag is off
};
```

**React hook (octopad.app only):**

```ts
import { useConsent } from "@/lib/consent/api";

function MyComponent() {
  const consent = useConsent();
  if (consent.has("analytics")) {
    /* load analytics */
  }
}
```

When the Mixpanel/PostHog SDK install task lands, those SDKs are loaded inside an effect that gates on `useConsent().has("analytics") === true` (octopad.app) or `window.octopadConsent.has("analytics") === true` (octopad.ai).

### 3.9 SDK loader contract (for the future Mixpanel/PostHog install task)

When the SDK install task runs:

1. Loader checks `window.octopadConsent.has("analytics")` BEFORE any SDK init or capture call.
2. If false, the loader registers an `on("change")` listener and waits.
3. If true, init the SDK normally.
4. SDK init must call its provider's "respect existing opt-out" handshake on every load (Mixpanel: check `mixpanel.has_opted_out_tracking()` after init; PostHog: pass `opt_out_capturing_by_default: true` in init config and call `opt_in_capturing()` only if consent allows).
5. On `change` event with `analytics: false`, call the SDK's opt-out function and stop loading new events.

This contract is documented here so the SDK-install PR doesn't redesign the gate.

### 3.10 CCPA / GPC handling

**Detection:**
- US visitors: `CF-IPCountry === "US"` in middleware. If California-specific detection is added later, use the Cloudflare `cf-region-code` header (state-level).
- GPC: parse the `Sec-GPC: 1` header in middleware (or check `navigator.globalPrivacyControl === true` client-side).

**Behavior:**
- If `CF-IPCountry === "US"` OR GPC signal received: show "Your Privacy Choices" link in footer.
- Clicking the link opens the same preferences modal, with US-specific intro copy from v1.3 §5.
- GPC signal is treated as automatic opt-out from Analytics. Cookie banner does NOT show; analytics SDKs respect opt-out automatically; consent_records row written with action=`reject_all`, source=`gpc`.

**Plain English:** a GPC-honoring browser is signaling "I refuse tracking" via an HTTP header. We respect it without showing a banner.

---

## 4. Tests (acceptance gates)

Each surface ships with these tests. Failing tests block the PR.

### 4.1 Button parity test (CNIL critical)

Playwright test: capture banner. Assert all three buttons (`Reject all`, `Customize`, `Accept all`) have:
- Identical computed CSS `color`, `background-color`, `border`, `font-weight`, `padding`, `font-size`.
- Identical CSS class on the button element.
- Bounding-box width within 2px of each other.

Same against the modal's three buttons. (Pixel-perfect bounding-box comparison dropped per privacy reviewer's font-rendering flake concern.)

### 4.2 No cookies before consent (ePrivacy 5(3) critical)

Playwright test: load `/`, do nothing, wait 5s. Assert:
- `document.cookie` contains ONLY `__cf_bm` and (on octopad.app) `sb-*-auth-token` if logged in.
- No `mp_*`, `ph_*`, `theme` cookies.
- No network request to `mixpanel.com`, `posthog.com`, or any analytics domain.

### 4.3 X / Escape / scroll / click-outside don't count as consent

Playwright test: load page, click outside banner, scroll, press Escape on banner, press Escape on modal. Assert no `consent_v1` cookie set. Assert zero rows posted to `record-consent` Edge Function (intercept fetch).

### 4.4 13-month re-prompt logic (unit)

Test `shouldShowBanner({ consentRecord, now })` with `ts = 14 months ago`. Assert true.

### 4.5 Version bump triggers re-prompt (unit)

Test with `consentRecord.v = 0` and `CONSENT_VERSION = 1`. Assert true.

### 4.6 Geo fail-open (unit)

Test `shouldShowBanner` with `geo = undefined`, `geo = ""`, `geo = "XX"`, `geo = "T1"`. Assert true for all.

### 4.7 Withdrawal flow

Playwright: visit, accept all, verify cookies set. Open modal, toggle Analytics off, save. Assert `mp_*` and `ph_*` cookies deleted. Assert `consent_v1.categories.analytics === false`. Assert `record-consent` Edge Function called once with action=`save_preferences`.

### 4.8 No cookie wall (manual)

Documented in PR. Visit, dismiss banner, verify site usable. Visit, reject all, verify site usable.

### 4.9 GPC honoring (Playwright)

Set `Sec-GPC: 1` request header (Playwright `setExtraHTTPHeaders`). Load page. Assert no banner shown. Assert `consent_v1` set with `action=reject_all`, `source=gpc`. Assert no network request to analytics.

### 4.10 Kill switch (Playwright)

With `NEXT_PUBLIC_CONSENT_BANNER_ENABLED=false` (or `PUBLIC_CONSENT_BANNER_ENABLED=false` on Astro). Visit page from EEA-headers. Assert no banner DOM mounted. Assert `window.octopadConsent.isEnabled() === false`.

### 4.11 SDK loader contract (unit, in shared lib)

Mock SDK loader registers `on("change")`. Manually set consent state to `{ analytics: false }`. Assert SDK opt-out called. Set to `{ analytics: true }`. Assert SDK init called.

### 4.12 French CNIL dummy visit (manual)

Documented in PR. Screen recording attached.

---

## 5. Implementation sequencing

| Phase | Scope | Why this order |
|---|---|---|
| 1 | Supabase migration `267_consent_records.sql` + Edge Function `record-consent` deployed (with daily salt secret in Supabase Vault) + retention cron | Both surfaces depend on this. Land first. |
| 2 | `consent-config.ts` + `state.ts` + Edge Function poster + `useConsent` hook + `window.octopadConsent` global. Author once in octopad.app, copy to octopad-landing-page. | Same shape on both surfaces. |
| 3 | octopad.ai: middleware.ts + meta-tag injection + footer link + banner + modal + tests + `PUBLIC_SUPABASE_URL` etc. plumbed into Vercel project env | Smaller surface, simpler stack, proves the model. |
| 4 | octopad.app: middleware extension + banner mount + `(auth)/layout.tsx` + Settings entry + tests | Larger surface. |
| 5 | Privacy Policy update on octopad.ai/privacy: add data-flow paragraph for consent_records, name the Edge Function as a processing step | In-scope per adversarial review (originally excluded; reinstated). |
| 6 | Snapshot test in each repo's build pipeline | Drift detection. |
| 7 | (Done in this design session) Octopad page Cookie banner copy v1.2 → v1.3 | Spec hygiene. |
| 8 | PR review + manual CNIL dummy visit + sign-off | Launch gate. |

Phases 3 and 4 can run in parallel after phase 2.

---

## 6. Implementation risks and notes

### 6.1 octopad.ai is currently `output: "static"` on Astro

Vercel Edge Middleware at the project root works alongside Astro static output. Vercel runs the middleware before serving the static asset; Astro never sees it. **The middleware must use the Web-standard `Request`/`Response` signature, NOT Next.js `NextRequest`/`NextResponse` — copying a Next.js middleware will ship a 500.**

### 6.2 No shadcn/ui in octopad/frontend

Build `<dialog>` + hand-rolled toggle. **React 19:** render `<dialog>` without the `open` attribute server-side; call `showModal()` in `useEffect`. Otherwise hydration desyncs.

**Escape hatch:** Radix dialog/switch allowlisted if axe/Lighthouse a11y tests fail.

### 6.3 Cloudflare cache fragmentation

Edge Middleware that rewrites with geo could fragment cache. Mitigation: middleware sets `Cache-Control: private, no-store` on the rewritten response. Static asset cache hit rate drops on the first request per visitor; subsequent loads use the meta tag in HTML and don't re-rewrite (the banner JS reads the meta synchronously and stores no further state).

### 6.4 Geo cookie removed

Earlier draft used a `geo_hint` cookie. Adversarial review surfaced a first-load race (cookie set on response, not yet readable in same parse). Replaced with meta-tag injection on octopad.ai and request-header read on octopad.app. No client-side cookie for geo.

### 6.5 Localized copy

v1.3 is English-only. Localized copy (FR, DE, ES, IT) is out of scope. If/when localization happens, `COPY` becomes a per-locale lookup.

### 6.6 Performance budget

Banner JS payload: < 8KB gzipped on octopad.ai (vanilla TS, raw `fetch` to Edge Function — NOT `supabase-js` which is ~30KB gz). On octopad.app, banner is lazy-loaded via `next/dynamic({ ssr: false })` so non-EEA non-CCPA sessions pay zero kilobytes.

### 6.7 Kill switch

`NEXT_PUBLIC_CONSENT_BANNER_ENABLED` (or `PUBLIC_CONSENT_BANNER_ENABLED` on Astro). Default true. Set to false to immediately disable the banner without redeploy. Banner module checks this before any DOM mount.

### 6.8 Observability

Failed Edge Function POST → `console.error` + Sentry breadcrumb (octopad.app already has Sentry per launch hardening; octopad.ai does not — log to console only on the marketing site, accept the gap). Supabase Logs alert on `record-consent` Edge Function error rate > 1% over 1h.

### 6.9 Staging

Both surfaces have staging envs. The `surface` field in `consent_records` includes `staging.octopad.ai` and `staging.octopad.app` so production audit log isn't polluted. Staging may not have Cloudflare proxy → `CF-IPCountry` missing → fail-open shows banner (acceptable).

---

## 7. Out of scope (explicit exclusions)

- Mixpanel SDK install (separate task — uses §3.9 contract)
- PostHog SDK install (separate task — uses §3.9 contract)
- Stripe.js install + cookie list rows (Stripe Integration stream)
- External counsel review (deferred per parent legal stance)
- Localized copy beyond English
- Drafting copy (v1.3 is the source of truth)
- Full CCPA Sale/Share categorization with separate toggle (deferred until adtech enters the stack — minimum-viable today is GPC honoring + "Your Privacy Choices" link)
- TCF/IAB integration (skip until ad-tech enters the stack)
- IAB GDPR TC string format (out of scope; we use our own consent string)

---

## 8. Done when

- Banner ships on both surfaces.
- Banner copy matches #Cookie banner copy v1.3 verbatim (snapshot test).
- Cookie list renders per-surface; SDK-emitted names audited against env at build time.
- Consent record persists with version tracking (cookie + localStorage + Edge Function → Supabase append-only table with HMAC integrity).
- Retention cron deployed (6-year purge).
- 13-month re-prompt scheduled.
- Geo fail-open implemented and tested.
- Kill switch env flag implemented and tested.
- GPC honoring implemented and tested.
- "Your Privacy Choices" link visible to US visitors.
- Public consent API (`window.octopadConsent` + `useConsent` hook) shipped.
- Privacy Policy updated to reference consent_records data flow.
- French CNIL dummy visit screen recording attached to PR.
- Cookie banner copy v1.3 (Octopad page) reflects retention, CCPA, and "not yet active" framing.

---

## 9. References

- #Cookie banner copy v1.3 (source of truth for user-facing copy)
- #Cookie banner copy v1.0 Adversarial Review 2026-04-25
- #Legal Documents Launch Handoff 2026-04-23
- ePrivacy Directive 2002/58/EC Article 5(3)
- GDPR Article 7(1) (demonstrability), Article 5(1)(a) (transparency), Article 5(1)(e) (storage limitation), Article 13(1)(e) (subprocessor disclosure), Article 8 (children)
- CNIL Recommendation 2020-091 (Reject all parity)
- ICO PECR guidance + Limitation Act 1980 (UK retention)
- TTDSG (Germany)
- Garante Guidance June 2021 (Italy, X-to-close)
- LGPD (Brazil) Art 8 §1
- CCPA / CPRA Cal. Civ. Code §1798.135 + §1798.140(ah); Sephora settlement (2022); CPPA 2025 GPC enforcement actions
- French Civil Code Art 2224 (3-year limitation)
- EDPB Guidelines 05/2020 v1.1 (consent)
