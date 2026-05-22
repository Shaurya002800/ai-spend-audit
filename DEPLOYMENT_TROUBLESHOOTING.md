# Deployment Troubleshooting Guide

## Current Issues

### Issue 1: NEXT_PUBLIC_APP_URL Not Set Correctly
**Problem:** The environment variable `NEXT_PUBLIC_APP_URL` is set to `http://localhost:3000` locally, but needs to be your actual deployed domain on Vercel.

**Solution:** Go to Vercel Dashboard and set:
```
NEXT_PUBLIC_APP_URL=https://ai-powered-learning-universe.vercel.app
```

### Issue 2: Check All Environment Variables
Visit `/api/diagnostics` endpoint to verify all environment variables are set:
```
https://ai-powered-learning-universe.vercel.app/api/diagnostics
```

## Environment Variables Checklist

You must set these in Vercel Project Settings → Environment Variables:

```
ANTHROPIC_API_KEY=sk-ant-api03-... (from console.anthropic.com)
NEXT_PUBLIC_SUPABASE_URL=https://... (from supabase.com project settings)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (from supabase.com project settings)
RESEND_API_KEY=re_... (from resend.com)
NEXT_PUBLIC_APP_URL=https://ai-powered-learning-universe.vercel.app (your domain)
```

## How to Check Logs

1. Go to Vercel Dashboard
2. Select your project: `ai-spend-audit`
3. Click "Deployments" tab
4. Click the latest deployment
5. Click "Runtime Logs" tab to see server errors
6. Check "Build Logs" for build-time errors

## Common Errors & Solutions

### 500 Internal Server Error
- Check `/api/diagnostics` endpoint
- Review Vercel Runtime Logs
- Ensure all environment variables are set

### Missing Environment Variables
- Visit `/api/diagnostics` 
- See which ones are missing (✗)
- Add them to Vercel Project Settings
- Trigger a new deployment

### Supabase Connection Issues
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
- Check that the Supabase project has the `audits` table created

## Quick Deployment Fix

1. **Update NEXT_PUBLIC_APP_URL in Vercel:**
   - Go to Settings → Environment Variables
   - Set `NEXT_PUBLIC_APP_URL=https://ai-powered-learning-universe.vercel.app`

2. **Redeploy:**
   - Click "Deployments" tab
   - Click the three dots menu on latest deployment
   - Select "Redeploy"

3. **Verify:**
   - Visit `/api/diagnostics`
   - All should show ✓ (check marks)
