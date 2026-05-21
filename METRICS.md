# METRICS.md

## North Star Metric

**Consultations booked per week** — the number of users who complete an audit showing >$500/mo savings AND click "Book a Credex consultation."

Why this and not "audits completed" or "emails captured": SpendLens exists to drive qualified leads to Credex. An audit that doesn't convert to a consultation is information, not business value. This metric sits at the exact intersection of user value (real savings surfaced) and business value (qualified lead generated). It can't be gamed by making the form easier to complete; it requires genuinely showing high savings.

Target for week 1: 5 consultations booked.
Target for month 3: 20/week.
Pivot trigger: If consultations/week is <2 after 3 weeks of consistent traffic, something is broken in either the savings calculations (not surfacing >$500 cases) or the CTA (users aren't clicking through).

---

## 3 Input Metrics That Drive the North Star

**1. Audit completion rate** (visitors who start the form → submit it)
- Target: 20–25%
- Why it matters: A low completion rate means the form is too long, confusing, or asking for data users don't have. If this drops below 15%, the form needs to be simplified.
- How to measure: Track `audit_submitted` event vs. `page_view` on homepage.

**2. High-savings rate** (audits completed → showing >$500/mo savings)
- Target: 30–40%
- Why it matters: Directly controls how many consultation CTAs are shown. If this is too low, the audit engine may be too conservative or users are inputting low-spend stacks. If too high, the engine may be over-aggressive.
- How to measure: Count `audit_result.isHighSavings === true` / total audits in Supabase.

**3. Consultation CTA click-through rate** (high-savings users who click the Credex CTA)
- Target: 10–15%
- Why it matters: Even with perfect upstream metrics, a buried or unconvincing CTA kills conversion. This measures the effectiveness of the Credex presentation specifically.
- How to measure: Track `credex_cta_clicked` event on the results page.

---

## What to Instrument First

In priority order:
1. `audit_submitted` — time, IP (hashed), tool count, total spend entered
2. `audit_result_viewed` — share_id, monthly savings, isHighSavings
3. `email_captured` — share_id (links to audit), timestamp
4. `credex_cta_clicked` — share_id, source (results page vs share page)
5. `share_link_copied` — viral loop tracking
6. `share_page_viewed` — inbound referral source (utm_source if present)

All events go to a `events` table in Supabase. Simple, queryable, no third-party analytics dependency.

---

## Pivot Trigger Number

If, after 200 audits completed, the high-savings rate is below 15% AND average monthly savings shown is below $80, the audit engine is either too conservative or the user base is already well-optimized (unlikely for a broad audience).

Action: review the 200 audit inputs, find the most common tool combinations, and check whether the engine is correctly applying overlap detection and plan-mismatch logic. The engine may need recalibration or the form may need to guide users toward entering more expensive tools first.
