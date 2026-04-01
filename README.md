# Octopad Landing Page

Marketing site for [octopad.ai](https://octopad.ai).

## Files

- `index.html` — main landing page
- `privacy.html` — privacy policy (`/privacy`)
- `terms.html` — terms of use (`/terms`)
- `logo.png` — Octopad logo

## Deployment

Hosted on **Cloudflare Pages**. No build step — pure static HTML.

### First deploy
1. Push this repo to GitHub
2. Cloudflare Pages → Create a project → Connect to Git → select this repo
3. Leave all build settings blank (no framework, no build command, output directory `/`)
4. Deploy → go to **Custom domains** → add `octopad.ai` and `www.octopad.ai`
5. DNS is auto-configured since the domain is already on Cloudflare

### Subsequent deploys
Push to the main branch — Cloudflare Pages redeploys automatically.

### URL routing
Cloudflare Pages serves `privacy.html` at `/privacy` and `terms.html` at `/terms` automatically — no config needed.

The app itself lives at [octopad.app](https://octopad.app).
