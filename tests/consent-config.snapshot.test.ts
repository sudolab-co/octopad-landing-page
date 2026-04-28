// Snapshot drift check for COPY constants on octopad.ai.
//
// Asserts the live COPY in src/lib/consent/config.ts deep-equals the
// frozen COPY_SNAPSHOT in src/lib/consent/snapshot.ts. Drift between the
// two repos (octopad.ai and octopad.app) is the failure mode this guards
// against — when v1.X → v1.Y of #Cookie banner copy bumps user-facing
// strings, both repos must update COPY + snapshot in lockstep, otherwise
// banner text drifts between marketing and product.
//
// Compatible with Vitest. Ships dormant until test infra is wired up;
// run with `npx vitest run tests/consent-config.snapshot.test.ts`.

import { describe, expect, it } from "vitest";

import { CONSENT_VERSION, COPY } from "../src/lib/consent/config";
import { COPY_SNAPSHOT, COPY_SNAPSHOT_VERSION } from "../src/lib/consent/snapshot";

describe("consent COPY snapshot (octopad.ai)", () => {
  it("snapshot version matches consent version", () => {
    expect(COPY_SNAPSHOT_VERSION).toBe(`1.${CONSENT_VERSION + 2}`);
    // 1.3 = CONSENT_VERSION 1 + 2 offset (v1.0 was draft, v1.1 first internal)
  });

  it("COPY deep-equals frozen v1.3 snapshot", () => {
    expect(COPY).toEqual(COPY_SNAPSHOT);
  });
});
