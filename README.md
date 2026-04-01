# Octopad Landing Page

Marketing site for [octopad.ai](https://octopad.ai).

## Files

- `index.html` — main landing page
- `privacy.html` — privacy policy (`/privacy.html`)
- `terms.html` — terms of use (`/terms.html`)
- `logo.png` — Octopad logo

## Deployment

Hosted on **GitHub Pages**. No build step — pure static HTML.

### First deploy
1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Source: **Deploy from a branch** → branch `main`, folder `/` → Save
4. GitHub provides a `username.github.io/repo` URL within seconds

### Custom domain (octopad.ai)
1. In GitHub Pages settings → **Custom domain** → enter `octopad.ai` → Save
2. In Cloudflare DNS, add these records — **DNS only (grey cloud), not proxied**:
   - `CNAME` · `@` → `your-username.github.io`
   - `CNAME` · `www` → `your-username.github.io`
3. GitHub verifies the domain and provisions SSL automatically (a few minutes)

> **Important:** the Cloudflare proxy (orange cloud) must be OFF. GitHub Pages handles SSL directly via Let's Encrypt and requires unproxied DNS to verify the domain.

### Subsequent deploys
Push to the main branch — GitHub Pages redeploys automatically.

The app itself lives at [octopad.app](https://octopad.app).
