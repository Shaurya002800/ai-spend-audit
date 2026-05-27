# DEVLOG.md


## Day 1 — 2026-05-21

**Hours worked:** 6

**What I did:**
Set up the Next.js 15 project with TypeScript and Tailwind. Built the core audit engine (`lib/audit-engine.ts`) — all 8 tool evaluations, cross-tool overlap detection, and the AuditResult type. Wrote the first 5 tests and confirmed they pass. Made the decision to keep the audit math deterministic (no AI) after thinking through how Credex reviewers would evaluate the reasoning — a finance person needs to read the output and agree with it, which requires reproducibility.

**What I learned:**
The Claude Team plan has a 5-seat minimum that most people don't know about — a common source of hidden waste. Also learned that Cursor + GitHub Copilot overlap is the most common redundancy pattern for small dev teams.

**Blockers / what I'm stuck on:**
Deciding between Supabase and PlanetScale for the database. Going with Supabase for the SQL + RLS combo and the faster setup.

**Plan for tomorrow:**
Build the SpendForm component, AuditResults display, and the /api/audit route. Get end-to-end working locally with a mocked Anthropic response first, then plug in real API.

---

## Day 2 — 2026-05-22

**Hours worked:** 5.5

**What I did:**
Built SpendForm component with team size input, use case selector, and dynamic tool entries. Implemented tool adding/removing UI. Connected form to `/api/audit` endpoint. Created AuditResults display component with recommendation cards. Got basic end-to-end flow working locally but hit React 19 + lucide-react version conflict during local testing.

**What I learned:**
React 19 has fewer UI component libraries with full support yet. lucide-react@0.383.0 doesn't support it. Had to upgrade to 0.453.0.

**Blockers / what I'm stuck on:**
Tailwind styling wasn't applying to components until I created `tailwind.config.ts` with proper content paths. Spent 30 mins debugging that.

**Plan for tomorrow:**
Finish the audit engine recommendations logic, test with real Anthropic API for summaries, then work on Supabase integration for storing results.

---

## Day 3 — 2026-05-23

**Hours worked:** [fill in]

**What I did:**
[fill in]

**What I learned:**
[fill in]

**Blockers / what I'm stuck on:**
[fill in]

**Plan for tomorrow:**
[fill in]

---

## Day 4 — 2026-05-24

**Hours worked:** [fill in]

**What I did:**
[fill in]

**What I learned:**
[fill in]

**Blockers / what I'm stuck on:**
[fill in]

**Plan for tomorrow:**
[fill in]

---

## Day 5 — 2026-05-25

**Hours worked:** [fill in]

**What I did:**
[fill in]

**What I learned:**
[fill in]

**Blockers / what I'm stuck on:**
[fill in]

**Plan for tomorrow:**
[fill in]

---

## Day 6 — 2026-05-26

**Hours worked:** [fill in]

**What I did:**
[fill in]

**What I learned:**
[fill in]

**Blockers / what I'm stuck on:**
[fill in]

**Plan for tomorrow:**
[fill in]

---

## Day 7 — 2026-05-27

**Hours worked:** [fill in]

**What I did:**
Final polish, Lighthouse audit, deployed to Vercel, checked CI green. Filled in REFLECTION.md and USER_INTERVIEWS.md. Ran final test suite (10 tests, all passing). Submitted.

**What I learned:**
[fill in]

**Blockers / what I'm stuck on:**
None — deadline day.

**Plan for tomorrow:**
Wait for Round 2 results.
