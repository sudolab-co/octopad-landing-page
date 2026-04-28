// Frozen snapshot of the COPY constant.
//
// The snapshot test in tests/consent-config.snapshot.test.ts asserts that
// COPY in config.ts deep-equals SNAPSHOT here. This file is updated in
// lockstep with octopad/frontend/src/lib/consent/snapshot.ts when v1.X →
// v1.Y of #Cookie banner copy changes user-facing strings.
//
// Procedure to bump:
//   1. Edit COPY in config.ts.
//   2. Run snapshot test, observe diff, copy new value here.
//   3. Mirror the same edits to octopad/frontend/src/lib/consent/.
//   4. Update Octopad page #Cookie banner copy v1.X → v1.Y.

export const COPY_SNAPSHOT_VERSION = "1.3";

export const COPY_SNAPSHOT = {
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
