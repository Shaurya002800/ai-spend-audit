# SpendLens

SpendLens is a small web app I built to audit a startup's AI tool spend and point out obvious waste. The core idea is simple: teams adopt tools like Cursor, Copilot, Claude, ChatGPT, and Gemini pretty quickly, but almost nobody goes back and checks whether the current mix still makes sense.

The app asks for the team's tools, plan choices, and monthly spend, then returns:
- per-tool recommendations
- overlap detection across similar tools
- estimated monthly and annual savings
- a short AI-written summary on top of the deterministic audit result

This project is mainly meant to be a lead-gen asset for Credex, but I built it to still be useful even if someone never becomes a lead.

## Live URL
[https://ai-spend-audit-blush.vercel.app](https://ai-spend-audit-blush.vercel.app)

## Quick Start

```bash
git clone https://github.com/Shaurya002800/ai-spend-audit
cd ai-spend-audit
npm install
cp .env.example .env.local
npm run dev
```

Run tests:

```bash
npm test
```

## Environment Variables

These are the variables the app expects:

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Used for the summary paragraph |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `RESEND_API_KEY` | Used for email send after lead capture |
| `NEXT_PUBLIC_APP_URL` | Public app URL for share links and metadata |

## Main Build Decisions

### 1. Deterministic audit logic first
I kept the pricing math and recommendation rules deterministic. AI is only used for the short summary paragraph. I did not want the actual savings numbers to depend on a model being in a good mood.

### 2. Next.js App Router
I used Next.js because I wanted the API routes, server-rendered share pages, and deployment path in one place. The `/r/[shareId]` route also benefits from server-side metadata.

### 3. Supabase for storage
This app only needs a practical hosted database for saving audits and linking them to emails later. Supabase was the fastest way to get there without overcomplicating it.

### 4. Resend for email
The email step is lightweight in this app, so Resend felt like the simplest option.

## Project Structure

- `app/` - homepage, share page, and API routes
- `components/` - form and results UI
- `lib/` - audit engine, helpers, and client setup
- `__tests__/` - audit engine tests

## Notes

- The audit engine is rule-based and intentionally conservative.
- The app stores audit data in Supabase, but public share pages strip identifying details.
- A failed Anthropic call falls back to a template summary so the user still gets a useful result.
