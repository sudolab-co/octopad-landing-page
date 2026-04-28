// Vercel Edge Middleware for octopad.ai (Astro static site).
//
// Uses the Web-standard Request/Response signature, NOT Next.js style.
// This is critical: a Next.js-style middleware will not deploy on a
// non-Next.js Vercel project.
//
// Reads the visitor country from Vercel's x-vercel-ip-country header
// (with cf-ipcountry as a fallback for any future Cloudflare-fronted
// deploy) and rewrites the URL with a __geo search param so the static
// page can read it via Astro.url and emit a <meta name="x-octopad-geo">
// tag in the HTML head. The banner JS reads that meta tag synchronously
// on mount — no cookie race, no flash.
//
// Cache-Control: private, no-store on the rewritten response prevents
// Cloudflare from caching geo-fragmented HTML across visitors.
//
// Pairs with: docs/superpowers/specs/2026-04-28-cookie-banner-design.md (§3.2, §6.1)

// Zero-deps. Uses Vercel's documented x-middleware-rewrite header for
// non-Next.js projects instead of the @vercel/edge package, so we don't
// add a runtime dependency for a 30-line middleware.

export const config = {
  // Match all routes except static assets and API routes. Astro's _astro/
  // bundle directory and standard static-file extensions are excluded so
  // we don't add edge latency to image / font / JS asset requests.
  matcher: ["/((?!_astro|_vercel|favicon|assets|scripts|.*\\.[a-zA-Z0-9]+$).*)"],
};

export default function middleware(request: Request): Response {
  const url = new URL(request.url);
  // Vercel's edge sets x-vercel-ip-country on every request (ISO 3166-1
  // alpha-2). It is missing or empty when geolocation fails, so we use ||
  // not ?? to fall back to "XX" for both cases. cf-ipcountry is kept as a
  // secondary fallback in case the project ever sits behind Cloudflare.
  // "XX" is treated as fail-open EEA in src/lib/consent/index.ts.
  const country =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    "XX";

  // Stamp the country on the rewritten URL. The Astro page reads
  // Astro.url.searchParams.get("__geo") server-side and renders it into a
  // meta tag.
  url.searchParams.set("__geo", country);

  return new Response(null, {
    status: 200,
    headers: {
      "x-middleware-rewrite": url.toString(),
      "x-octopad-geo": country,
      // Geo-fragmented response must not be cached at the CF edge or
      // every visitor would inherit the first one's country.
      "Cache-Control": "private, no-store",
    },
  });
}
