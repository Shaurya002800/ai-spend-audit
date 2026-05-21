# PROMPTS.md

## AI Usage in SpendLens

SpendLens uses AI in exactly one place: generating the personalized 100-word summary paragraph shown at the top of audit results. The audit math itself — per-tool recommendations, savings calculations, redundancy detection — is deterministic hardcoded logic. Knowing when *not* to use AI is part of the design.

---

## The Summary Prompt

```
You are a blunt, finance-literate AI spend advisor writing a 100-word personalized audit summary for a startup.

Context:
- Team size: {teamSize} people
- Primary use case: {useCase}
- Current monthly AI spend: ${totalCurrentSpend}
- Potential monthly savings: ${totalMonthlySavings}
- Top waste: {topWaste}
- Key recommendation: {topSwitch}
- Number of tools audited: {toolCount}

Write a 100-word personalized audit summary. Be specific about their situation. Mention the dollar amount. Don't be generic. Don't use bullet points. Write like a trusted CFO advisor, not a sales pitch. If savings are minimal, be honest about it — "you're spending well" is a valid conclusion. End with one concrete next step.
```

### Why this prompt structure

**"Blunt, finance-literate"** — The default LLM tendency is to soften criticism and hedge. "Finance-literate" anchors the model to a persona that speaks in dollars and doesn't manufacture fake enthusiasm.

**Structured context block** — Providing specific numbers prevents the model from hallucinating details. Every variable in the context block is populated from the deterministic audit result, so the summary can't contradict the math.

**"Don't be generic"** — Without this, the model defaults to phrases like "many companies overspend on AI tools." With it, the output specifically references their situation.

**"Be honest if savings are minimal"** — Critical for trust. A tool that tells everyone they're overspending 40% gets ignored. One that occasionally says "you're spending well" is credible.

**"End with one concrete next step"** — Prevents the model from ending with a vague call to action. Forces specificity.

---

## What I tried that didn't work

**Attempt 1: No persona framing.** Just asked for a "summary of this audit." Output was bland and generic — mentioned dollar amounts but used phrases like "significant opportunity" and "potential for optimization" with no specificity. Added the CFO advisor persona framing.

**Attempt 2: Including all recommendations in the prompt.** Passed the full `recommendations` array as JSON. The model tried to address every recommendation in 100 words, producing a fragmented list in paragraph form. Switched to passing only `topWaste` and `topSwitch` — the two most actionable insights.

**Attempt 3: "Write like a tweet."** Too casual for the audience. Engineering managers and founders reading an audit report expect a professional tone. Reverted to CFO advisor framing.

**Attempt 4: Asking for 200 words.** Output was padded and repetitive. The constraint of 100 words forces the model to prioritize the most important insight. `max_tokens: 200` enforces this.

---

## Fallback Template

If the Anthropic API fails (rate limit, network error, etc.), the engine returns a template:

**For high-savings audits:**
> "Your team of {N} is spending ${X}/mo on AI tools but could be spending ${Y}/mo — a saving of ${Z}/mo (${annual}/year). The biggest opportunity is {topWaste}. Start there: it's the highest-impact change with lowest switching cost."

**For already-optimal audits:**
> "Your team of {N} is spending ${X}/mo on AI tools — and doing it efficiently. We found less than $100/mo in potential savings, which means your stack is reasonably well-optimized for {useCase} workflows. Keep monitoring as your team scales; the economics change when you cross 10+ seats on enterprise plans."

The fallback is honest and specific enough to be useful, even without the AI-generated summary.
