# Gain Strength Therapy — website

Marketing site for [Gain Strength Therapy](https://www.gainstrengththerapy.com), a private strength studio in Eastbourne. Replaces the original Wix site with a modern, conversion-focused build.

## Stack

- **Next.js 16** (App Router, TypeScript, Turbopack)
- **Tailwind CSS v4** with a custom brand palette (bone / ink / rust / forest)
- **Fraunces** (display serif) + **Inter** (body) via `next/font`
- **Cal.com** embed for live consultation booking
- **Lucide** icons
- Route handler at `/api/lead` ready to forward to any webhook (n8n, Make, Zapier, HubSpot, Supabase, Resend, etc.)

## Local development

```bash
npm install
cp .env.local.example .env.local  # then fill in values
npm run dev
```

Visit <http://localhost:3000>.

## Environment variables

See `.env.local.example`. Only two are used today:

| Var | Where | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_CALCOM_LINK` | client | Cal.com link for the inline booking embed (e.g. `gainstrengththerapy/free-consultation`). When empty, the `/book` page shows a graceful fallback. |
| `LEAD_WEBHOOK_URL` | server | Where `POST /api/lead` forwards submissions. When empty in dev, leads are appended to `.data/leads.jsonl` so you can inspect them locally. |

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

## Lead capture → automated workflows

`POST /api/lead` validates a payload like:

```json
{
  "firstName": "Jane",
  "email": "jane@example.com",
  "phone": "07xxx",
  "newsletter": true,
  "source": "programme-hero"
}
```

When `LEAD_WEBHOOK_URL` is set, it forwards the enriched lead (with `id`, `createdAt`, `userAgent`, `referer`) to that URL. Typical destinations:

- **n8n / Make / Zapier** — route to CRM, email tool, WhatsApp, etc.
- **Notion database** — via their REST API
- **Resend / Postmark** — instant owner notification email
- **Supabase / Postgres** — if you want to own the data end-to-end

In development, leads also append to `.data/leads.jsonl` for easy inspection.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import to [Vercel](https://vercel.com/new) — framework is auto-detected.
3. Set `NEXT_PUBLIC_CALCOM_LINK` and `LEAD_WEBHOOK_URL` in Project Settings → Environment Variables.
4. Point `www.gainstrengththerapy.com` at Vercel (follow the DNS instructions in the Domains tab).

## Before launch checklist

- [ ] Replace placeholder phone (`01323 000 000`) and email (`hello@gainstrengththerapy.com`) in `src/lib/utils.ts` and all components
- [ ] Fill in real team bios on `/about`
- [ ] Replace SVG placeholders with real photography
- [ ] Add real favicon + OG image (`/public/og.jpg`)
- [ ] Set up Cal.com account + consultation event type; paste the link into `NEXT_PUBLIC_CALCOM_LINK`
- [ ] Write proper `/privacy` and `/terms` content
- [ ] Wire `LEAD_WEBHOOK_URL` to your workflow destination
- [ ] Run Lighthouse / a11y sweep in production mode
