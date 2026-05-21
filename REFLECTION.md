# REFLECTION.md

> Answer all 5 questions, 150–400 words each. Be specific — vague answers score poorly.

---

## 1. The hardest bug you hit this week, and how you debugged it

[FILL IN WITH YOUR REAL EXPERIENCE — here's a template to adapt]

The hardest bug was the Claude Team plan minimum-seat calculation showing negative savings. When a user had 3 seats on the Team plan, the engine was calculating `30 * 3 = $90` as the billed amount, but the actual minimum billing is `30 * 5 = $150`. So the recommendation was showing $90 projected spend against a $90 input (they'd correctly entered what they actually paid), making the savings appear as zero even though the downgrade to 3x Pro ($60) would save them $30.

My first hypothesis was a rounding issue. I added `console.log` statements throughout the `evaluateTool` function for `toolId === "claude"` and logged both `monthlySpend` (user input) and `projectedSpend` (engine calculation). That ruled out rounding — the values were exact.

Second hypothesis: the savings was being overridden by the overlap detection pass. I traced through `detectOverlap` — no Claude entry, so not that.

Third hypothesis: the logic was using the wrong input for the `actualBilled` calculation. I looked at the condition again:

```ts
const actualBilled = 30 * 5; // minimum 5 seats
const proCost = 20 * seats;
```

The bug was that `monthlySavings` was calculated as `Math.max(0, actualBilled - proCost)` — but I wasn't surfacing the *actual* savings from the *current* spend, I was calculating against the minimum billing theoretical amount. The fix was to use `monthlySpend - proCost` instead of `actualBilled - proCost`, since `monthlySpend` is what the user actually pays (which includes the minimum billing they're already absorbing).

After the fix, a 3-seat Team plan at $150/mo → Pro at $60/mo correctly shows $90/mo savings. The test I wrote for this case (test 3) caught future regressions.

---

## 2. A decision you reversed mid-week, and what made you reverse it

[FILL IN WITH YOUR REAL EXPERIENCE]

My original design showed the email capture form *before* the audit results — the theory being that a locked preview would increase conversion. I built it that way on Day 2 and looked at it for about 10 minutes before reversing the decision.

The reversal happened because the assignment brief explicitly states: *"Email is captured after value is shown, never before."* I had missed this on first read. But beyond the explicit instruction, the reasoning is also correct: a cold visitor from a tweet or HN post has zero trust in SpendLens. Asking for an email before showing results is a classic mistake that kills conversion for tools at this stage.

The revised flow — show full results, then offer to email the report — trades email capture rate for trust. The right tradeoff for a tool whose primary value is the insight, not the lead form. A user who sees real savings and *then* gives their email is a higher-quality lead anyway.

The implementation change took about 20 minutes (moved the LeadForm component below the results, removed the gate). The real cost was realizing I should have read the brief more carefully on Day 1.

---

## 3. What you would build in week 2 if you had it

[FILL IN WITH YOUR REAL IDEAS — here's a strong template]

**Priority 1: Dynamic OG image generation.** Right now the share page uses a static OG image. The viral loop breaks if every shared audit looks identical on Twitter. Using `@vercel/og`, I'd generate a per-audit image showing the savings number, tool icons, and a "Run yours at spendlens.ai" CTA — rendered at the Edge in ~50ms. This is the single highest-leverage feature for organic distribution.

**Priority 2: Benchmark mode.** "Your team of 5 spends $340/mo on AI — engineering teams your size average $180/mo." This requires building a simple aggregation query over stored audits. The data exists after a week of real usage; I just need the query and the UI element. This would be the most shareable stat in the report.

**Priority 3: Embeddable widget.** A `<script>` tag bloggers and newsletters can drop in. The CTA: "Audit your AI stack in 2 minutes." Renders an inline form that posts to the SpendLens API. Distribution multiplier with zero marginal cost. Implementation: a standalone JS bundle with a Shadow DOM wrapper so it doesn't conflict with host page styles.

**Priority 4: Real-time pricing freshness.** Currently pricing is hardcoded and verified manually. I'd scrape official pricing pages weekly (Cursor, Anthropic, OpenAI) and compare against stored values, triggering a Slack alert if a price changes. Otherwise the audit engine silently gives wrong recommendations after a vendor reprices.

---

## 4. How you used AI tools

[FILL IN WITH YOUR REAL USAGE — be honest, they check]

I used Claude Sonnet (via Claude.ai) and GitHub Copilot throughout the week.

**Where Claude was most useful:** Drafting the initial structure of `audit-engine.ts` — I described the data model and the types of recommendations I wanted, and Claude gave me a scaffold that I significantly rewrote. Also useful for the Supabase SQL schema and the Resend email HTML (neither of which I've written recently enough to have templates memorized).

**Where Copilot was most useful:** Inline completions for repetitive patterns — the `PRICING` data object, the `ACTION_CONFIG` mapping in AuditResults, and the test file. It correctly inferred the pattern after 2-3 examples.

**What I didn't trust AI with:** The actual recommendation logic. I wrote every `if` statement in `evaluateTool()` myself, cross-referencing the official pricing pages. An AI-generated audit engine would hallucinate numbers or create reasoning that sounds plausible but wouldn't survive scrutiny from someone who actually knows the tools.

**One specific time AI was wrong:** I asked Claude to write the Claude Team plan minimum-seat check. It wrote the condition as `if (plan === "Team" && seats < 3)` — using 3 as the minimum. The actual Claude Team minimum is 5 seats. I caught this immediately because I had the official pricing page open. The wrong threshold would have caused the engine to miss real savings for 3-4 seat teams. I rewrote the condition manually after verifying on claude.ai/pricing.

---

## 5. Self-rating

| Dimension | Rating | Reason |
|---|---|---|
| **Discipline** | [X]/10 | [e.g., "Committed on 6 of 7 days; took one day off for family and logged it honestly"] |
| **Code quality** | [X]/10 | [e.g., "TypeScript throughout, no any types, tests for the critical path, but no error boundaries on the client components"] |
| **Design sense** | [X]/10 | [e.g., "The results page is visually strong; the form is functional but the tool-row layout gets cramped on mobile below 375px"] |
| **Problem solving** | [X]/10 | [e.g., "Caught the minimum-seat bug before shipping; didn't over-engineer the rate limiter for this stage"] |
| **Entrepreneurial thinking** | [X]/10 | [e.g., "GTM and economics are specific and grounded; user interviews were real conversations that changed two design decisions"] |

> Fill in your real ratings with honest one-sentence reasons. Credex reads these carefully.
