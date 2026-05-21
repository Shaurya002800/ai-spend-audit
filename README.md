# SpendLens — Free AI Spend Audit for Startups

SpendLens audits your team's AI tool subscriptions (Cursor, Claude, ChatGPT, Copilot, Gemini, and more) and surfaces exactly where you're overpaying — with defensible, finance-literate reasoning and dollar-specific recommendations. It's a lead-generation asset for [Credex](https://credex.rocks), which sources discounted AI infrastructure credits for startups.

## Live URL
https://spendlens.vercel.app *(replace after deploy)*

## Screenshots / Demo
> Add 3+ screenshots or a Loom link here before submission.

## Quick Start

```bash
git clone https://github.com/YOUR_USERNAME/ai-spend-audit && cd ai-spend-audit
npm install
cp .env.example .env.local   # fill in your keys
npm run dev                  # http://localhost:3000
npm test                     # run 10 audit engine tests
vercel deploy                # deploy
```

## Environment Variables
| Variable | Source |
|---|---|
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com project settings |
| `RESEND_API_KEY` | resend.com |
| `NEXT_PUBLIC_APP_URL` | your deployed URL |

## Decisions

1. **Next.js App Router** — Server components on `/r/[shareId]` generate per-audit OG metadata without JS. Critical for the Twitter sharing loop. Tradeoff: more complex than a pure SPA.

2. **Deterministic audit engine, no AI for math** — All per-tool recommendations use hardcoded rules with cited pricing data. LLMs hallucinate numbers; a finance person should be able to read the reasoning and agree. AI is used exactly once: the 100-word personalized summary paragraph, with graceful fallback.

3. **Supabase over Firebase** — Standard SQL beats NoSQL for this shape of data. Querying audits by share_id, joining on email, running conversion analytics — all trivial in Postgres. Would require compound indexes and document restructuring in Firestore.

4. **Resend over SendGrid** — Typed SDK, React Email compatible, generous free tier, better deliverability for new domains. SendGrid's free tier requires IP warm-up; not worth it at this volume.

5. **localStorage form persistence** — Users who refresh mid-form lose nothing. The tradeoff is a slightly heavier client and JSON parse error handling. URL state was too large; server sessions overkill for anonymous audits.
