# Octopad Landing Page

Marketing site for [octopad.ai](https://octopad.ai).

## Files

- `index.html` — main landing page
- `privacy.html` — privacy policy (`/privacy`)
- `terms.html` — terms of use (`/terms`)
- `integrations/notion.html` — Notion integration page (`/integrations/notion`)
- `logo.png` — Octopad logo
- `vercel.json` — Vercel deployment configuration

## Deployment

Hosted on **Vercel**. No build step — pure static HTML, configured via `vercel.json`.

`cleanUrls: true` strips `.html` extensions from all routes (e.g. `/privacy` instead of `/privacy.html`).

### First deploy
1. Push this repo to GitHub
2. Import the repo in the [Vercel dashboard](https://vercel.com/new)
3. Vercel auto-detects `vercel.json` — no build settings to configure
4. Vercel provisions a deployment URL and SSL immediately

### Custom domain (octopad.ai)
1. In the Vercel project → **Settings → Domains** → add `octopad.ai`
2. Vercel provides DNS records to add in your registrar/DNS provider
3. SSL is provisioned automatically once DNS propagates

### Subsequent deploys
Push to the `main` branch — Vercel redeploys automatically.

The app itself lives at [octopad.app](https://octopad.app).
