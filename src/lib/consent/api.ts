// Public consent API for octopad.ai.
//
// One surface only: window.octopadConsent (browser global). No React hook
// because the marketing site has no React.
//
// Pairs with: docs/superpowers/specs/2026-04-28-cookie-banner-design.md (§3.8, §3.9)

import { type Category, type ConsentState } from "./config";
import { isBannerEnabled, readConsent } from "./state";

type ConsentEvent = "change" | "accept" | "reject";
type Listener = (state: ConsentState | null) => void;

const listeners: Map<ConsentEvent, Set<Listener>> = new Map([
  ["change", new Set()],
  ["accept", new Set()],
  ["reject", new Set()],
]);

export function emitConsentEvent(event: ConsentEvent, state: ConsentState | null): void {
  const set = listeners.get(event);
  if (!set) return;
  for (const fn of set) {
    try {
      fn(state);
    } catch (err) {
      console.error(`[consent] listener for "${event}" threw:`, err);
    }
  }
}

function subscribe(event: ConsentEvent, cb: Listener): () => void {
  const set = listeners.get(event);
  if (!set) return () => {};
  set.add(cb);
  return () => set.delete(cb);
}

export interface OctopadConsent {
  has(category: Category): boolean;
  on(event: ConsentEvent, cb: Listener): () => void;
  get(): ConsentState | null;
  isEnabled(): boolean;
}

declare global {
  interface Window {
    octopadConsent?: OctopadConsent;
  }
}

export function installOctopadConsentGlobal(): void {
  if (typeof window === "undefined") return;
  if (window.octopadConsent) return;
  window.octopadConsent = {
    has(category: Category): boolean {
      const state = readConsent();
      if (!state) return category === "necessary";
      return Boolean(state.categories[category]);
    },
    on(event: ConsentEvent, cb: Listener): () => void {
      return subscribe(event, cb);
    },
    get(): ConsentState | null {
      return readConsent();
    },
    isEnabled(): boolean {
      return isBannerEnabled();
    },
  };
}
