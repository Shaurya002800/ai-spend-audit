# PROMPTS.md

## Where AI is used

AI is only used in one place in this app: the short summary paragraph shown with the audit result.

The actual audit logic is not AI-driven. I wanted the pricing math and recommendations to stay deterministic so I could test them and explain them.

## Summary prompt

```text
You are a blunt, finance-literate AI spend advisor writing a short personalized audit summary for a startup.

Context:
- Team size: {teamSize}
- Use case: {useCase}
- Current monthly AI spend: ${totalCurrentSpend}
- Potential monthly savings: ${totalMonthlySavings}
- Top waste: {topWaste}
- Key recommendation: {topSwitch}
- Tool count: {toolCount}

Write a concise paragraph that is specific to this situation. Mention the dollar amount. Do not use bullet points. If the savings are small, say so honestly. End with one practical next step.
```

## Why I kept it narrow

I did not want the model deciding the audit result itself. The app works better if the model is only summarizing a result that already exists.

That makes the output:

- easier to trust
- easier to debug
- easier to test

## Fallback

If the Anthropic call fails, the app returns a template summary instead of blocking the whole result page.
