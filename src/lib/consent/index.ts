// Consent module entry point for octopad.ai.
//
// Loaded by BaseLayout.astro via <script>. Astro bundles this and its
// imports into a single _astro asset shared across pages.
//
// Responsibilities:
//   1. Read the geo from the meta tag emitted by BaseLayout (set by
//      middleware.ts via __geo search param).
//   2. Decide whether to show the first-load banner.
//   3. Wire DOM event handlers on banner + modal.
//   4. Install window.octopadConsent global.
//   5. Honor the Sec-GPC signal (accessed via navigator.globalPrivacyControl).
//
// Pairs with: docs/superpowers/specs/2026-04-28-cookie-banner-design.md (§3.2, §3.4)

import { CCPA_COUNTRIES, CONSENT_COUNTRIES, COPY, type Category } from "./config";
import {
  applyWithdrawal,
  buildConsentState,
  isBannerEnabled,
  postConsentRecord,
  readConsent,
  shouldShowBanner,
  writeConsent,
} from "./state";
import { emitConsentEvent, installOctopadConsentGlobal } from "./api";

interface DomRefs {
  banner: HTMLElement | null;
  modal: HTMLDialogElement | null;
  modalIntros: HTMLElement[];
  toggles: { functional: HTMLInputElement | null; analytics: HTMLInputElement | null };
  toast: HTMLElement | null;
  preferenceLinks: HTMLElement[];
  ccpaLinks: HTMLElement[];
}

function getRefs(): DomRefs {
  return {
    banner: document.getElementById("octopad-cookie-banner"),
    modal: document.getElementById("octopad-consent-modal") as HTMLDialogElement | null,
    modalIntros: Array.from(document.querySelectorAll<HTMLElement>(".modal-intro[data-mode]")),
    toggles: {
      functional: document.querySelector<HTMLInputElement>('[data-consent-toggle="functional"]'),
      analytics: document.querySelector<HTMLInputElement>('[data-consent-toggle="analytics"]'),
    },
    toast: document.getElementById("octopad-consent-toast"),
    preferenceLinks: Array.from(document.querySelectorAll<HTMLElement>("[data-consent-open-modal]")),
    ccpaLinks: Array.from(document.querySelectorAll<HTMLElement>("[data-consent-open-ccpa]")),
  };
}

function readGeoFromMeta(): string | undefined {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="x-octopad-geo"]');
  return meta?.content || undefined;
}

function isGpcOptOut(): boolean {
  const nav = navigator as Navigator & { globalPrivacyControl?: boolean };
  return nav.globalPrivacyControl === true;
}

function isEEA(country: string | undefined): boolean {
  if (!country) return true; // fail-open per Q8
  if (country === "XX" || country === "T1") return true;
  return CONSENT_COUNTRIES.has(country);
}

function isCCPA(country: string | undefined): boolean {
  if (!country) return false;
  return CCPA_COUNTRIES.has(country);
}

function setIntroMode(refs: DomRefs, mode: "default" | "ccpa"): void {
  for (const intro of refs.modalIntros) {
    intro.hidden = intro.dataset.mode !== mode;
  }
  if (refs.modal) refs.modal.dataset.consentMode = mode;
}

function syncTogglesFromState(refs: DomRefs): void {
  const state = readConsent();
  if (refs.toggles.functional) {
    refs.toggles.functional.checked = state?.categories.functional ?? false;
  }
  if (refs.toggles.analytics) {
    refs.toggles.analytics.checked = state?.categories.analytics ?? false;
  }
}

function showBanner(refs: DomRefs): void {
  if (refs.banner) refs.banner.hidden = false;
}

function hideBanner(refs: DomRefs): void {
  if (refs.banner) refs.banner.hidden = true;
}

function openModal(refs: DomRefs, mode: "default" | "ccpa" = "default"): void {
  if (!refs.modal) return;
  setIntroMode(refs, mode);
  syncTogglesFromState(refs);
  if (typeof refs.modal.showModal === "function") {
    refs.modal.showModal();
  } else {
    refs.modal.setAttribute("open", "");
  }
}

function closeModal(refs: DomRefs): void {
  if (!refs.modal) return;
  if (typeof refs.modal.close === "function") {
    refs.modal.close();
  } else {
    refs.modal.removeAttribute("open");
  }
}

function showToast(refs: DomRefs): void {
  if (!refs.toast) return;
  refs.toast.hidden = false;
  setTimeout(() => {
    if (refs.toast) refs.toast.hidden = true;
  }, 4000);
}

type ConsentChoice = { action: "accept_all" | "reject_all" | "save_preferences" | "gpc"; categories: Record<Category, boolean> };

async function commitConsent(refs: DomRefs, choice: ConsentChoice): Promise<void> {
  const prev = readConsent();
  const next = buildConsentState(choice.categories);
  writeConsent(next);
  applyWithdrawal(prev, next);
  hideBanner(refs);
  closeModal(refs);
  showToast(refs);

  emitConsentEvent("change", next);
  if (choice.action === "accept_all") emitConsentEvent("accept", next);
  if (choice.action === "reject_all" || choice.action === "gpc") emitConsentEvent("reject", next);

  await postConsentRecord({
    state: next,
    action: choice.action,
    pageUrl: window.location.origin + window.location.pathname,
  });
}

function attachActionHandlers(refs: DomRefs): void {
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const actionEl = target.closest<HTMLElement>("[data-consent-action]");
    if (!actionEl) return;

    const action = actionEl.dataset.consentAction;
    if (!action) return;

    if (action === "customize") {
      openModal(refs, "default");
      return;
    }

    if (action === "accept_all") {
      void commitConsent(refs, {
        action: "accept_all",
        categories: { necessary: true, functional: true, analytics: true },
      });
      return;
    }

    if (action === "reject_all") {
      void commitConsent(refs, {
        action: "reject_all",
        categories: { necessary: true, functional: false, analytics: false },
      });
      return;
    }

    if (action === "save_preferences") {
      void commitConsent(refs, {
        action: "save_preferences",
        categories: {
          necessary: true,
          functional: refs.toggles.functional?.checked ?? false,
          analytics: refs.toggles.analytics?.checked ?? false,
        },
      });
      return;
    }
  });

  for (const link of refs.preferenceLinks) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(refs, "default");
    });
  }

  for (const link of refs.ccpaLinks) {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(refs, "ccpa");
    });
  }

  // Modal close button (X). Closing != consenting; just dismiss.
  const closeBtn = document.querySelector<HTMLElement>("[data-consent-modal-close]");
  if (closeBtn) {
    closeBtn.addEventListener("click", () => closeModal(refs));
  }

  // Escape closes the modal but does NOT count as consent — native <dialog>
  // fires a 'close' event on Escape but writes nothing to consent_v1
  // unless commitConsent was called. No wiring needed here.
}

export function initConsent(): void {
  if (!isBannerEnabled()) {
    // Kill switch — install no-op global so SDK loaders don't crash.
    installOctopadConsentGlobal();
    return;
  }

  // Toggle CCPA link visibility based on geo + GPC.
  const country = readGeoFromMeta();
  const ccpaApplies = isCCPA(country) || isGpcOptOut();
  for (const el of document.querySelectorAll<HTMLElement>("[data-ccpa-link]")) {
    el.hidden = !ccpaApplies;
  }

  installOctopadConsentGlobal();

  if (typeof document === "undefined") return;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => bootstrap(country));
  } else {
    bootstrap(country);
  }
}

function bootstrap(country: string | undefined): void {
  const refs = getRefs();
  attachActionHandlers(refs);

  // GPC fast-path: write a reject_all record without showing the banner.
  if (isGpcOptOut() && !readConsent()) {
    void commitConsent(refs, {
      action: "gpc",
      categories: { necessary: true, functional: false, analytics: false },
    });
    return;
  }

  const state = readConsent();
  const eea = isEEA(country);
  if (shouldShowBanner({ state, geoCountry: country, isEEA: eea, now: Date.now() })) {
    showBanner(refs);
  }
}

initConsent();
