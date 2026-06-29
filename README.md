# Gain Strength Therapy — website

Marketing site for [Gain Strength Therapy](https://www.gainstrengththerapy.com), a private strength studio in Eastbourne. Replaces the original Wix site with a modern, conversion-focused build.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** with a custom brand palette (bone / ink / rust / forest)
- **Fraunces** (display serif) + **Inter** (body) via `next/font`
- **Cal.com** embed for live consultation booking
- **Lucide** icons
- **Resend** for transactional email (published templates), **Notion** as the leads/members store, and Vercel cron jobs for the onboarding drip, consultation reminders and back-office syncs

## Local development

```bash
npm install
cp .env.local.example .env.local  # then fill in values
npm run dev
```

Visit <http://localhost:3000>.

## Environment variables

`.env.local.example` is the source of truth and lists every variable. The site now runs a small ops backend, so there are more than the original two. The ones that matter for the public site and lead capture:

| Var | Where | Purpose |
| --- | --- | --- |
| `RESEND_API_KEY` | server | Sends the lead confirmation, onboarding and consultation-reminder emails via published Resend templates. |
| `LEAD_FROM_EMAIL` | server | From address for those emails (a verified `gainstrengththerapy.com` sender). |
| `LEAD_NOTIFY_EMAIL` | server | Recipient of the internal "new enquiry" alert. |
| `NOTION_TOKEN` + `NOTION_LEADS_DB_ID` | server | Writes each lead into the Notion leads database. |
| `CRON_SECRET` | server | Authenticates Vercel cron requests (`?key=` or Bearer). |
| `ANTHROPIC_API_KEY` | server | Optional: personalised email opener when a lead leaves a message (Claude Haiku). |

In development, when Notion is not configured, leads are appended to `.data/leads.jsonl` so you can inspect them locally. The Cal.com booking link is not an env var; it lives in `SITE.bookingUrl` (`src/lib/utils.ts`). The remaining vars in `.env.local.example` power the scheduled crons (TeamUp sync, finances, retention digest, Google reviews, Meta ad spend). Web analytics is Vercel Web Analytics + Speed Insights, enabled in the Vercel project with no env vars.

## Project layout

```
src/
├── app/
│   ├── layout.tsx          # root shell, fonts, nav, footer, JSON-LD
│   ├── page.tsx            # home
│   ├── about/              # about page
│   ├── facility/           # facility page
│   ├── programme/          # January landing page (primary conversion target)
│   ├── book/               # Cal.com embed + lead form fallback
│   ├── contact/            # contact details + form
│   ├── faqs/, privacy/, terms/
│   ├── api/lead/route.ts   # lead capture + webhook forwarding
│   ├── sitemap.ts, robots.ts
│   └── globals.css         # brand tokens (Tailwind v4 @theme)
├── components/
│   ├── site-nav.tsx, site-footer.tsx
│   ├── ui.tsx              # shared primitives (Section, H2, CTAButton, etc.)
│   ├── lead-form.tsx       # reusable capture form
│   ├── cal-embed.tsx       # Cal.com embed wrapper
│   ├── placeholder-image.tsx # SVG placeholders (swap for real photos)
│   └── structured-data.tsx # LocalBusiness JSON-LD
└── lib/utils.ts            # cn() + SITE config (address, hours, links)
```

## Copy & content

Copy for the January programme page is taken from `GAIN Strength Therapy – HQ/03 - Sales & Marketing/Landing Page Copy – January Foundations – GAIN.docx`. Team bios on `/about` and a handful of pricing/contact fields (phone number, email address) are **placeholders**. Search the codebase for `Placeholder` and for `01323 000 000` / `hello@gainstrengththerapy.com` to confirm before launch.

Imagery is currently SVG placeholders in `components/placeholder-image.tsx`. Replace with real photography by dropping files into `public/` and swapping the `<PlaceholderImage />` components for `<Image />` from `next/image`.

## Lead capture

`POST /api/lead` validates a submission like:

```json
{
  "firstName": "Jane",
  "email": "jane@example.com",
  "phone": "07xxx",
  "newsletter": true,
  "source": "programme-hero"
}
```

On a valid submission it, in parallel:

- **writes the lead to Notion** (`NOTION_LEADS_DB_ID`), with newsletter-consent metadata when opted in;
- **sends the lead a confirmation email** via the published Resend template `gain-lead-confirmation-enquiry-form`;
- **alerts Hallum** with an internal "new enquiry" notification (`LEAD_NOTIFY_EMAIL`), reply-to set to the lead so he can respond directly;
- **upserts the lead as a Resend marketing contact** for the newsletter audience.

The request succeeds as long as at least one of these lands. In development, when Notion is not configured, leads are appended to `.data/leads.jsonl` for easy inspection.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import to [Vercel](https://vercel.com/new) — framework is auto-detected.
3. Set the variables from `.env.local.example` in Project Settings → Environment Variables (at minimum the Resend, Notion and `CRON_SECRET` values).
4. Point `www.gainstrengththerapy.com` at Vercel (follow the DNS instructions in the Domains tab).

## Before launch checklist

- [x] Replace placeholder phone (`01323 000 000`) and email (`hello@gainstrengththerapy.com`) in `src/lib/utils.ts` and all components
- [x] Fill in real team bios on `/about`
- [x] Replace SVG placeholders with real photography
- [x] Add real favicon + OG image (`/public/og.jpg`)
- [x] Set up Cal.com account + consultation event type; paste the link into `NEXT_PUBLIC_CALCOM_LINK`
- [x] Write proper `/privacy` and `/terms` content
- [x] Wire lead capture to its destination — `POST /api/lead` writes to the Notion leads DB and sends the Resend confirmation + owner notification (the `LEAD_WEBHOOK_URL` forwarder is no longer used)
- [x] Run Lighthouse / a11y sweep in production mode — 2026-06-29 (mobile, home): accessibility 100, best practices 100, SEO 92, performance 69. Remaining: descriptive link text on the "LEARN MORE" link, and homepage performance (5.3 MB hero video, ~80 KB unused JS)
