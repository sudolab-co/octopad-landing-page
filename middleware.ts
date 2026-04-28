// Vercel Edge Middleware for octopad.ai (Astro static site).
//
// Uses the Web-standard Request/Response signature, NOT Next.js style.
// This is critical: a Next.js-style middleware will not deploy on a
// non-Next.js Vercel project.
//
// Serves a single JSON endpoint at /api/geo that returns the visitor
// country derived from Vercel's edge headers. The consent module fetches
// this on load to decide whether to show the banner.
//
// Why not stamp the country into the static HTML via x-middleware-rewrite?
// Astro is configured with output: 'static', so every page is pre-rendered
// at build time. Astro.url.searchParams.get('__geo') resolves at build —
// not at request — and bakes 'XX' into the HTML for every visitor. The
// rewrite chain looks plausible but is silently a no-op in production.
//
// Pairs with: docs/superpowers/specs/2026-04-28-cookie-banner-design.md (§3.2, §6.1)

// Zero-deps. Uses Vercel's documented edge middleware signature without
// the @vercel/edge package.

export const config = {
  // Only intercept /api/geo. Everything else flows through to Vercel's
  // static asset handler with normal CDN caching.
  matcher: ["/api/geo"],
};

export default function middleware(request: Request): Response {
  // Vercel's edge sets x-vercel-ip-country on every request (ISO 3166-1
  // alpha-2). It is missing or empty when geolocation fails, so we use ||
  // not ?? to fall back to "XX" for both cases. cf-ipcountry is kept as a
  // secondary fallback in case the project ever sits behind Cloudflare.
  // "XX" is treated as fail-open EEA in src/lib/consent/index.ts.
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    "XX";

  return new Response(JSON.stringify({ country }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      // Geo-fragmented response must not be cached at the edge or every
      // visitor would inherit the first one's country.
      "Cache-Control": "private, no-store",
    },
  });
}
