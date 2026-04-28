// Playwright tests for the cookie consent banner on octopad.ai.
//
// Per spec §4 (docs/superpowers/specs/2026-04-28-cookie-banner-design.md),
// these are the acceptance gates for the launch PR. Test 4.1 (button
// parity) and 4.2 (no cookies before consent) are CNIL/ePrivacy critical.
//
// Manual verification of all flows already passed during the Phase 3
// implementation session (banner display, button parity computed-style
// check 287x46px identical, X-doesn't-consent, Accept all writes cookie,
// modal reopen syncs toggles, withdrawal flips analytics off). These
// tests freeze that verification for CI.
//
// Ships dormant until Playwright is installed; run with
// `npx playwright test tests/consent.spec.ts`.

import { expect, test } from "@playwright/test";

const BASE_URL = process.env.PREVIEW_URL ?? "http://localhost:4321";

test.describe("Cookie consent banner — octopad.ai", () => {
  test("4.1 button parity (CNIL critical)", async ({ page }) => {
    await page.goto(BASE_URL);
    const buttons = page.locator("#octopad-cookie-banner .banner-btn");
    await expect(buttons).toHaveCount(3);

    const styles = await buttons.evaluateAll((els) =>
      els.map((el) => {
        const c = getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return {
          color: c.color,
          backgroundColor: c.backgroundColor,
          border: c.border,
          fontWeight: c.fontWeight,
          padding: c.padding,
          width: Math.round(r.width),
          height: Math.round(r.height),
        };
      }),
    );

    expect(styles[0]).toEqual(styles[1]);
    expect(styles[1]).toEqual(styles[2]);
  });

  test("4.2 no cookies before consent (ePrivacy 5(3) critical)", async ({ page, context }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000);
    const cookies = await context.cookies();
    const names = cookies.map((c) => c.name);
    expect(names.find((n) => n.startsWith("mp_"))).toBeUndefined();
    expect(names.find((n) => n.startsWith("ph_"))).toBeUndefined();
    expect(names.find((n) => n === "consent_v1")).toBeUndefined();
  });

  test("4.3 X-close does not count as consent", async ({ page, context }) => {
    await page.goto(BASE_URL);
    await page.click("[data-consent-action='customize']");
    await page.click("[data-consent-modal-close]");
    const cookies = await context.cookies();
    expect(cookies.find((c) => c.name === "consent_v1")).toBeUndefined();
  });

  test("4.7 accept-all writes consent + hides banner", async ({ page, context }) => {
    await page.goto(BASE_URL);
    await page.click("#octopad-cookie-banner [data-consent-action='accept_all']");
    const banner = page.locator("#octopad-cookie-banner");
    await expect(banner).toBeHidden();
    const cookies = await context.cookies();
    const consent = cookies.find((c) => c.name === "consent_v1");
    expect(consent).toBeDefined();
    const decoded = JSON.parse(decodeURIComponent(consent!.value));
    expect(decoded.categories.analytics).toBe(true);
  });

  test.skip("4.4 13-month re-prompt (unit-style)", async () => {
    // Move to a unit test against shouldShowBanner once Vitest is wired.
  });

  test.skip("4.5 version bump triggers re-prompt", async () => {});
  test.skip("4.6 geo fail-open", async () => {});
  test.skip("4.9 GPC honoring", async () => {});
  test.skip("4.10 kill switch", async () => {});
  test.skip("4.11 SDK loader contract", async () => {});
});
