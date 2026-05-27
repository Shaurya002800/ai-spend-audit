# DEPLOYMENT_TROUBLESHOOTING.md

This is the short version of the deployment issues I ran into and how I checked them.

## 1. Environment variables

The first thing to verify on Vercel is that the expected environment variables are actually set there, not just locally.

Required:

```bash
ANTHROPIC_API_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
```

## 2. App URL

`NEXT_PUBLIC_APP_URL` needs to match the deployed domain, otherwise share links and metadata can point to the wrong place.

## 3. Diagnostics route

I added `/api/diagnostics` to make it easier to confirm whether the environment setup is correct in production.

## 4. What I would check if the deploy breaks

1. Build logs in Vercel
2. Runtime logs in Vercel
3. `/api/diagnostics`
4. Supabase credentials
5. Whether any external client is initializing too early

## 5. Common failure pattern

The most annoying class of bug here was "works locally, fails in deploy." In this project, that usually came down to one of these:

- wrong environment configuration
- code that assumed env vars existed too early
- framework config drifting out of date

That is why I ended up preferring lazy client initialization and simpler config.
