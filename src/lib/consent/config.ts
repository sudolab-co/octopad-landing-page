// Cookie consent config — single source of truth for octopad.ai.
//
// COPY is byte-identical with octopad/frontend/src/lib/consent/config.ts.
// Drift between the two is caught by snapshot.test.ts in each repo.
//
// COOKIE_LIST differs per surface — this is the octopad.ai (marketing) list.
//
// Pairs with: Octopad page #Cookie banner copy v1.3
// Pairs with: docs/superpowers/specs/2026-04-28-cookie-banner-design.md (§3.1)

export const CONSENT_VERSION = 1;

export const SURFACE = (() => {
  if (typeof window === "undefined") return "octopad.ai";
  const host = window.location.hostname;
  if (host === "octopad.ai" || host === "www.octopad.ai") return "octopad.ai";
  if (host === "staging.octopad.ai") return "staging.octopad.ai";
  return "octopad.ai";
})();

export type Category = "necessary" | "functional" | "analytics";

export type ConsentAction = "accept_all" | "reject_all" | "save_preferences" | "gpc";

export interface ConsentState {
  v: number;
  uuid: string;
  ts: string;
  categories: Record<Category, boolean>;
}

export interface CookieRow {
  category: Category;
  name: string;
  provider: string;
  purpose: string;
  duration: string;
  notActive?: boolean;
  subprocessorAnchor?: string;
}

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
  // French overseas territories
  "GP","MQ","GF","RE","YT","BL","MF","PM","WF","PF","NC","TF",
  // Åland (Finland), Gibraltar (UK)
  "AX","GI",
]);

export const CCPA_COUNTRIES = new Set(["US"]);

// User-facing copy. Verbatim from #Cookie banner copy v1.3.
// NOTE: any change here must mirror octopad/frontend/src/lib/consent/config.ts.
export const COPY = {
  banner: {
    title: "Cookies on Octopad",
    body: "We use cookies to make Octopad work, remember your preferences, and understand how the site is used. Strictly necessary cookies are always on. Everything else is your call. You can change your choice anytime from the Cookie preferences link in the footer.",
    rejectAll: "Reject all",
    customize: "Customize",
    acceptAll: "Accept all",
    footerHtml: 'See our <a href="/privacy">Privacy Policy</a> and <button type="button" data-consent-open-modal>Cookie preferences</button> for details.',
  },
  modal: {
    title: "Your cookie preferences",
    intro: "Choose which cookies Octopad sets. Strictly necessary cookies are always on because the site does not run without them. Everything else is off by default until you turn it on. You can change these settings at any time.",
    categories: {
      necessary: {
        label: "Strictly necessary",
        alwaysOn: "Always on",
        description: "These cookies authenticate your session, remember which workspace you are in, and protect against cross-site request forgery and similar attacks. The site does not work without them. Your consent is not required for these because they are strictly necessary to deliver the service you requested.",
      },
      functional: {
        label: "Functional",
        offByDefault: "Off by default",
        description: "These cookies remember your interface preferences such as theme and language so the site looks the way you left it on your next visit. No tracking, no profile.",
      },
      analytics: {
        label: "Analytics",
        offByDefault: "Off by default",
        description: "These cookies tell us how the product is used so we can improve it. Providers: Mixpanel and PostHog.",
      },
    },
    rejectAll: "Reject all",
    savePreferences: "Save preferences",
    acceptAll: "Accept all",
    confirmation: "Saved. Your cookie preferences are stored. You can change them anytime from the Cookie preferences link in the footer.",
    cookieListHeading: "What we set",
    notActiveLabel: "Not currently active. Will appear when the SDK ships.",
    columns: {
      category: "Category",
      name: "Cookie name",
      provider: "Provider",
      purpose: "Purpose",
      duration: "Duration",
    },
  },
  ccpa: {
    linkLabel: "Your Privacy Choices",
    title: "Your privacy choices",
    intro: 'California law gives you the right to opt out of the "sale" or "sharing" of your personal information for cross-context behavioural advertising, and to limit the use of sensitive personal information. Octopad does not sell your information for money, but our analytics providers (Mixpanel and PostHog) may receive identifiers that California law treats as "sharing." You can opt out by switching the Analytics category off below, or by setting the Global Privacy Control signal in your browser; Octopad respects GPC automatically.',
  },
} as const;

// octopad.ai cookie list — marketing surface. Today only Strictly Necessary
// cookies fire. Functional and Analytics rows render with the
// notActiveLabel per Alex's "ship as if analytics were live" directive
// (forward-compatible). When the marketing site adds analytics, flip
// notActive to false on the relevant rows.
export const COOKIE_LIST: CookieRow[] = [
  {
    category: "necessary",
    name: "__cf_bm",
    provider: "Cloudflare",
    purpose: "Bot-management challenge token",
    duration: "30 minutes",
  },
  {
    category: "necessary",
    name: "consent_v1",
    provider: "Octopad",
    purpose: "Records the visitor's cookie consent choice",
    duration: "13 months",
  },
  {
    category: "analytics",
    name: "mp_*_mixpanel",
    provider: "Mixpanel",
    purpose: "Event tracking, funnels, retention",
    duration: "12 months",
    notActive: true,
    subprocessorAnchor: "/privacy#subprocessors",
  },
  {
    category: "analytics",
    name: "ph_*, ph_*_window_id",
    provider: "PostHog",
    purpose: "Event tracking, feature flags",
    duration: "12 months",
    notActive: true,
    subprocessorAnchor: "/privacy#subprocessors",
  },
];
