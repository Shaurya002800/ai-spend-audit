# ARCHITECTURE.md

## System Diagram

```mermaid
graph TD
    A[User: lands on spendlens.ai] --> B[SpendForm Component]
    B -->|form state persisted| LS[localStorage]
    B -->|submit| C[POST /api/audit]
    C --> D[runAudit — deterministic engine]
    D --> E[per-tool recommendations]
    E --> F[POST Anthropic API — summary]
    F -->|success| G[AI summary paragraph]
    F -->|failure| H[fallback template summary]
    G --> I[INSERT audits table — Supabase]
    H --> I
    I --> J[return result + shareId to client]
    J --> K[AuditResults component rendered]
    K -->|user enters email| L[POST /api/lead]
    L --> M[UPDATE audits.email — Supabase]
    L --> N[Resend transactional email]
    K -->|share button| O[/r/:shareId]
    O --> P[GET /api/share/:shareId]
    P --> Q[strip PII — return public audit]
    Q --> R[SharedAuditClient — OG tags set server-side]
```

## Data Flow: Input → Audit Result

1. **User fills form** — tool selections, plan, seats, monthly spend stored in React state + localStorage.
2. **POST /api/audit** — request body includes `AuditInput`: array of tool entries, team size, use case. Honeypot field checked. IP rate-limited (10 requests/hour/IP, in-memory; swap for Upstash Redis in production).
3. **runAudit()** — pure TypeScript function, no I/O. Evaluates each tool against pricing rules, checks for cross-tool redundancy, returns `AuditResult` with per-tool recommendations + aggregate savings.
4. **Anthropic claude-sonnet-4** — receives structured context (team size, use case, savings, top recommendations) and returns a 100-word personalized summary. `max_tokens: 200`. Falls back to template if API errors.
5. **Supabase INSERT** — full `audit_input` and `audit_result` stored as JSONB. `share_id` is an 8-char alphanumeric slug. Email fields null until lead capture.
6. **Client renders** — `AuditResult` and `aiSummary` rendered immediately. Share URL available instantly.
7. **Lead capture** — email collected after value shown (never before). POST /api/lead updates the existing audit row with PII fields and fires a Resend transactional email.
8. **Share page** — `/r/[shareId]` is a Next.js server component. Fetches audit from Supabase, strips PII (email, company, role), returns public view. OG meta tags are server-generated, enabling clean Twitter/Slack previews.

## Stack Choice

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 App Router | SSR for OG tags, API routes, TypeScript, Vercel deploy |
| Language | TypeScript | Required by assignment; catches pricing arithmetic bugs at compile time |
| Styling | Tailwind CSS | Utility-first, fast iteration, responsive by default |
| Database | Supabase (Postgres) | SQL, real-time, generous free tier, built-in auth if needed later |
| Email | Resend | Typed SDK, reliable deliverability for new domains |
| AI | Anthropic claude-sonnet-4 | Assignment preference; Sonnet is fast enough for 100-word summaries |
| Testing | Jest + ts-jest | Fast, native TypeScript, no setup overhead |
| Deployment | Vercel | Zero-config Next.js, automatic preview deployments |

## Scaling to 10,000 Audits/Day

At 10k audits/day (~7 req/min average, 50 req/min peak):

1. **Rate limiting** — replace in-memory Map with Upstash Redis (atomic, distributed, survives restarts). Vercel Edge Functions for rate limit middleware.
2. **Anthropic API** — at $0.003/1k tokens and ~300 tokens/summary, cost is ~$9/day. Add a Redis cache keyed on `hash(tools + teamSize + useCase)` — similar configurations get the same summary. Cache TTL: 24h.
3. **Supabase** — 10k rows/day is trivial for Postgres. Add an index on `created_at` for analytics queries. Consider partitioning by month at 1M+ rows.
4. **Vercel functions** — already serverless; scales automatically. No changes needed.
5. **Resend** — 10k emails/day requires a paid plan ($20/mo). Use batch send API for bulk confirmation emails.
6. **OG images** — at scale, generate dynamic `og:image` per audit using `@vercel/og` (Edge Runtime, ~50ms) showing savings number. Currently using a static default image.
