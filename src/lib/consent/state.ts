// Consent state primitives for octopad.ai. Pure functions on
// document.cookie + localStorage + a fetch to the Edge Function.
//
// Mirrors octopad/frontend/src/lib/consent/state.ts. The only differences
// are the env-var prefix (Astro uses PUBLIC_ instead of NEXT_PUBLIC_) and
// the cookie domain (.octopad.ai instead of .octopad.app).
//
// Pairs with: docs/superpowers/specs/2026-04-28-cookie-banner-design.md (§3.3, §3.7)

import {
  CONSENT_VERSION,
  type Category,
  type ConsentAction,
  type ConsentState,
  SURFACE,
} from "./config";

const COOKIE_NAME = "consent_v1";
const LS_UUID_KEY = "octopad_consent_uuid";
const COOKIE_MAX_AGE = 13 * 30 * 24 * 60 * 60;
const REPROMPT_AFTER_MS = 13 * 30 * 24 * 60 * 60 * 1000;

// Astro exposes import.meta.env at build time. PUBLIC_ prefix is required
// for client-side access.
export function getEdgeFunctionUrl(): string | null {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;
  return `${supabaseUrl}/functions/v1/record-consent`;
}

export function isBannerEnabled(): boolean {
  return import.meta.env.PUBLIC_CONSENT_BANNER_ENABLED !== "false";
}

// ─── Cookie I/O ──────────────────────────────────────────

export function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = name + "=";
  const segments = document.cookie ? document.cookie.split("; ") : [];
  for (const seg of segments) {
    if (seg.startsWith(prefix)) return decodeURIComponent(seg.slice(prefix.length));
  }
  return null;
}

function writeCookie(name: string, value: string, maxAgeSeconds: number): void {
  if (typeof document === "undefined") return;
  const encoded = encodeURIComponent(value);
  const domain =
    typeof window !== "undefined" && window.location.hostname.endsWith("octopad.ai")
      ? "; Domain=.octopad.ai"
      : "";
  document.cookie =
    `${name}=${encoded}` +
    `; Path=/` +
    domain +
    `; Max-Age=${maxAgeSeconds}` +
    `; SameSite=Lax` +
    (window.location.protocol === "https:" ? `; Secure` : ``);
}

function deleteCookie(name: string, domainSuffix?: string): void {
  if (typeof document === "undefined") return;
  const domain = domainSuffix ? `; Domain=${domainSuffix}` : "";
  document.cookie = `${name}=; Path=/${domain}; Max-Age=0; SameSite=Lax`;
}

// ─── Visitor UUID ─────────────────────────────────────────

function generateUuidV4(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

export function getOrCreateVisitorUuid(): string {
  if (typeof localStorage === "undefined") return generateUuidV4();
  const existing = localStorage.getItem(LS_UUID_KEY);
  if (existing) return existing;
  const fresh = generateUuidV4();
  try {
    localStorage.setItem(LS_UUID_KEY, fresh);
  } catch {
    // Private mode / storage disabled.
  }
  return fresh;
}

// ─── Consent state ────────────────────────────────────────

export function readConsent(): ConsentState | null {
  const raw = readCookie(COOKIE_NAME);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConsentState;
    if (
      typeof parsed.v !== "number" ||
      typeof parsed.uuid !== "string" ||
      typeof parsed.ts !== "string" ||
      !parsed.categories ||
      typeof parsed.categories.necessary !== "boolean" ||
      typeof parsed.categories.functional !== "boolean" ||
      typeof parsed.categories.analytics !== "boolean"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeConsent(state: ConsentState): void {
  writeCookie(COOKIE_NAME, JSON.stringify(state), COOKIE_MAX_AGE);
}

export interface ShouldShowBannerInput {
  state: ConsentState | null;
  geoCountry: string | undefined;
  isEEA: boolean;
  now: number;
}

export function shouldShowBanner(input: ShouldShowBannerInput): boolean {
  if (!input.isEEA) return false;
  if (!input.state) return true;
  if (input.state.v < CONSENT_VERSION) return true;
  const tsMs = Date.parse(input.state.ts);
  if (Number.isNaN(tsMs)) return true;
  if (input.now - tsMs > REPROMPT_AFTER_MS) return true;
  return false;
}

// ─── Posting to Edge Function ─────────────────────────────

export interface RecordConsentInput {
  state: ConsentState;
  action: ConsentAction;
  pageUrl: string;
}

export async function postConsentRecord(input: RecordConsentInput): Promise<void> {
  const url = getEdgeFunctionUrl();
  if (!url) {
    console.warn("[consent] no edge function URL configured; skipping audit log post");
    return;
  }
  const payload = {
    visitor_uuid: input.state.uuid,
    surface: SURFACE,
    consent_version: input.state.v,
    necessary: input.state.categories.necessary,
    functional: input.state.categories.functional,
    analytics: input.state.categories.analytics,
    action: input.action,
    page_url: input.pageUrl,
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
    if (!res.ok) {
      console.error("[consent] audit log post failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("[consent] audit log post error:", err);
  }
}

// ─── Building a fresh consent state ───────────────────────

export function buildConsentState(categories: Record<Category, boolean>): ConsentState {
  return {
    v: CONSENT_VERSION,
    uuid: getOrCreateVisitorUuid(),
    ts: new Date().toISOString(),
    categories: {
      necessary: true,
      functional: categories.functional,
      analytics: categories.analytics,
    },
  };
}

// ─── Withdrawal ────────────────────────────────────────────

export function applyWithdrawal(prev: ConsentState | null, next: ConsentState): void {
  if (prev?.categories.functional && !next.categories.functional) {
    // Reserved for when functional cookies are emitted on octopad.ai.
  }

  if (prev?.categories.analytics && !next.categories.analytics) {
    type WithOptOut = { opt_out_capturing?: () => void; opt_out_tracking?: () => void };
    const w = window as unknown as { posthog?: WithOptOut; mixpanel?: WithOptOut };
    try {
      w.posthog?.opt_out_capturing?.();
    } catch {}
    try {
      w.mixpanel?.opt_out_tracking?.();
    } catch {}

    if (typeof document !== "undefined") {
      const all = document.cookie.split("; ");
      for (const seg of all) {
        const name = seg.split("=")[0];
        if (name.startsWith("mp_") || name.startsWith("ph_") || name === "_mixpanel") {
          deleteCookie(name);
          deleteCookie(name, ".octopad.ai");
        }
      }
    }
  }
}
