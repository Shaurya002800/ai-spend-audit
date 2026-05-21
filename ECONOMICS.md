# ECONOMICS.md

## What a Converted Lead Is Worth to Credex

Credex sells discounted AI credits. A typical deal: a 20-person engineering team currently paying $800/mo retail for Cursor Business buys 12 months of credits at 25% off — saving $200/mo, paying Credex $600/mo for credits worth $800/mo. Credex's gross margin on the discount arbitrage is roughly 10–15% of face value (the spread between their bulk acquisition cost and the discount they offer).

**Estimated deal value per converted customer:**
- Average team: 15 engineers, $500/mo AI spend → $6,000/year retail
- Credex sells at 25% discount → customer pays $4,500/year
- Credex buys credits at ~$3,750/year (estimates based on typical bulk pricing)
- Gross profit per customer: ~$750/year
- With 3-year LTV assumption: **~$2,250 LTV per customer**

Conservative estimate for a "high-savings" lead (the target): **$500–$2,500 LTV**.

---

## CAC at Each GTM Channel

| Channel | Estimated Leads | Converted (5%) | CAC |
|---|---|---|---|
| Hacker News Show HN | 80 audits, 8 emails, 0.4 consultations | 0.4 | ~$0 (time only) |
| X/Twitter cold DMs (20 DMs/week) | 3 clicks, 1 audit, 0.05 consultations | ~0 in week 1 | ~$0 |
| Dev.to blog post | 200 readers, 20 audits, 2 emails, 0.1 consultations | 0.1 | ~$0 |
| Newsletter submission (3 newsletters) | 500 clicks, 50 audits, 10 emails, 0.5 consultations | 0.5 | ~$0 |
| Vendor docs placement (Credex relationship) | 1000 clicks, 100 audits, 20 emails, 1 consultation | 1 | ~$0 direct |

At $0 paid CAC, the question is just whether the conversion funnel works. At 5% audit→consultation conversion and 40% consultation→purchase, each 100 audits generates 2 purchases.

---

## Conversion Rate Math

The funnel:

```
Landing page visitors → audit completed → email captured → consultation booked → credit purchase
     100%                   20–25%            25–30%              3–5%               40%
```

For 1,000 visitors:
- 200–250 audits completed
- 50–75 emails captured
- 6–12 consultations booked
- 2–5 credit purchases

At $750 gross profit/customer: **$1,500–$3,750 gross profit per 1,000 visitors**.

The "high savings" filter (>$500/mo savings) adds a pre-qualification layer. Of 250 audits, roughly 30–40% will show >$500/mo savings (based on the pricing gap between common enterprise plans and optimal plans). That's 75–100 "high savings" audits → 8–12 consultations → 3–5 purchases. Same math, but the consultation→purchase conversion is higher (~60%) because the lead is pre-qualified.

---

## What Would Have to Be True for $1M ARR in 18 Months

$1M ARR / $750 average annual gross profit per customer = **1,333 paying customers**.

At a 40% consultation→purchase rate: need **3,333 consultations booked**.
At a 4% audit→consultation rate: need **83,333 audits completed**.
At a 22% visitor→audit rate: need **379,000 unique visitors** over 18 months (~21,000/month).

Is 21,000 visitors/month achievable in 18 months?

- Month 1–3: HN, Twitter, newsletters → ~2,000/month
- Month 3–6: SEO from blog posts + branded search compound → ~5,000/month
- Month 6–12: Vendor doc placements, referral loop, word-of-mouth → ~10,000/month
- Month 12–18: If Credex invests $5k/month in content + LinkedIn ads → ~20,000+/month

**It's plausible but requires everything to work**: the HN launch succeeds, SEO compounds, Credex leverages its vendor relationships for placement, and the audit→email→consultation funnel maintains conversion.

The biggest risk: the consultation booking rate. Most B2B tools see <2% booking rates from free tools. Getting to 4% requires either a very high-intent user (someone already evaluating Credex) or a strong in-product nudge (the "$500/mo savings" flag is that nudge).

**The $1M ARR scenario is achievable, but only if the consultation CTA is prominent and the sales team follows up within 24 hours.**
