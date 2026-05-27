# METRICS.md

## North star

If this were a real launch, the metric I would care about most is:

**number of high-intent leads created from completed audits**

Not just traffic, and not just completed forms. The product exists to turn useful audit results into a meaningful next step.

## Supporting metrics

The three supporting numbers I would watch first are:

### 1. Audit completion rate
How many people start the process and actually finish it.

This tells me whether the form is too long, too confusing, or asking for information people do not want to gather.

### 2. High-savings result rate
How often the engine finds a meaningful savings opportunity.

If this number is too low, either the engine is too conservative or the app is attracting the wrong users. If it is too high, I should probably double-check that the logic is not overclaiming.

### 3. Lead conversion after results
How many users give an email or take the Credex-related next step after seeing the result.

This is where the actual business usefulness starts to show up.

## Events I would instrument first

- audit started
- audit submitted
- result viewed
- share link copied
- email submitted
- high-savings CTA clicked

For this project, simple event logging in Supabase would be enough.

## What would worry me

The biggest warning sign would be a lot of people starting the form but very few finishing, or lots of completed audits with almost no follow-through after results. That would mean either the product is not trusted enough or the result is not strong enough to matter.
