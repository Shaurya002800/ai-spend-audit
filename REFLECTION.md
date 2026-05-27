# REFLECTION.md

## 1. The hardest bug I hit this week, and how I debugged it

The hardest issue this week was deployment, not the audit logic itself. Locally the app mostly worked, but once I started pushing toward Vercel I kept hitting errors that were annoying because they were half configuration problems and half code structure problems.

The two patterns that caused the most trouble were:
- clients initializing too early
- config that worked locally but was not valid for the deployed setup

I had external clients wired in a way that was fine in development but brittle during deployment. I also ran into environment-variable-related confusion, where I had to separate "what exists in `.env.local`" from "what is actually present in Vercel." To debug that, I stopped guessing and added better logging plus a small diagnostics route. That helped a lot because it turned the problem from "something is broken" into "this exact piece is missing or initializing at the wrong time."

Another issue was outdated framework config. The build was failing because `next.config.ts` still had config that no longer matched the version of Next.js being used. Once I removed the invalid part and simplified the config, the production build became much easier to reason about.

The big lesson for me was that deployment bugs usually feel random until I make them observable. Better logs and smaller assumptions saved more time than trying to outthink the problem.

## 2. A decision I reversed mid-week, and why I reversed it

One thing I changed as I built the app was how much AI should be involved in the output. Early on, it was tempting to let the model do more of the recommendation work because that would have been faster to ship. I reversed that direction pretty quickly once I started thinking about whether someone could actually trust the results.

This app is supposed to talk about wasted spend in exact dollar terms. If the recommendation engine is fuzzy, then the whole product feels weak. So I kept the actual audit deterministic and only used AI for the short summary paragraph at the top.

That ended up being the right call for two reasons:
- the savings math became easier to test
- the output felt more defensible

I also changed my approach to deployment prep. At first I was treating it like something I would handle after the product was "done," but a lot of the real work late in the week was making the app safe to build and run in production. I wish I had taken that seriously a little earlier.

## 3. What I would build in week 2

If I had another week, I would focus less on adding random features and more on making the current loop stronger.

First, I would improve the share experience. A per-audit social preview image would make the shared link much more compelling than a generic preview. Right now the app works, but the share loop is still basic.

Second, I would add some lightweight analytics around what combinations of tools show up most often and what savings patterns are common. That would help both product decisions and GTM messaging.

Third, I would tighten the lead handoff. Right now the app does the core audit and email capture, but I would want a clearer path for high-savings users, especially the ones who are actually good Credex leads.

Fourth, I would make pricing maintenance less manual. The engine is only useful if the pricing assumptions stay fresh, so even a small verification workflow would help.

## 4. How I used AI tools

I used AI tools as helpers, not as the source of truth.

Copilot was useful for speeding up repetitive parts like object shapes, test boilerplate, and small UI patterns. It saved time when I already knew what I wanted and just needed to write it faster.

Claude was more useful for brainstorming and scaffolding. It helped me think through structure, edge cases, and wording, especially when I wanted a second pass on an idea. I still rewrote a lot of what came out of it.

What I did not want AI to own was the pricing logic itself. For a project like this, the exact recommendation rules matter more than sounding smart. I was comfortable using AI to help phrase a summary, but not comfortable asking it to decide the real savings number.

In general, AI was good for momentum. It was not a substitute for checking the actual app behavior, reading the framework errors, or verifying the pricing assumptions.

## 5. Self-rating

| Dimension | Rating | Reason |
|---|---|---|
| Discipline | 7/10 | I kept moving every day and got the project to a shippable state, but I definitely left some cleanup and deployment thinking later than ideal. |
| Code quality | 7/10 | The core audit logic is testable and the app works end to end, but there are still places I would tighten if this were continuing past the assignment. |
| Design sense | 7/10 | The app is clear and usable, and the results flow is stronger than the initial form flow. There is still room to improve polish and consistency. |
| Problem solving | 8/10 | I ran into real deployment issues and worked through them without needing to throw the whole setup away. |
| Entrepreneurial thinking | 7/10 | I think the product angle is reasonable and practical, but the distribution and validation side would need more real-world testing. |
