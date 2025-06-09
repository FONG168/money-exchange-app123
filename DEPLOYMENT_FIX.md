# 🚨 URGENT: Fix Deployment Issues

## Problem Identified
Your API routes are returning 404 errors because they're not being deployed properly to Vercel. This causes "internal server error" when trying to login.

## Step-by-Step Solution

### Step 1: Check Environment Variables
Go to your Vercel dashboard → Project → Settings → Environment Variables

**Required Variables:**
```
DATABASE_URL=your-postgresql-connection-string
NEXTAUTH_SECRET=any-random-secret-string
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### Step 2: Fix Build Issues
The main issue is likely in the build process. Run these commands:

```bash
# Clean everything
npm run build

# If that fails, clean node_modules
rm -rf node_modules
rm -rf .next
npm install
npm run build
```

### Step 3: Redeploy to Vercel
```bash
# If you have Vercel CLI
vercel --prod

# Or push to GitHub and let Vercel auto-deploy
git add .
git commit -m "Fix deployment issues"
git push origin main
```

### Step 4: Database Setup
1. **Option A (Recommended): Use Vercel Postgres**
   - Go to Vercel Dashboard → Storage → Create Database → Postgres
   - Copy the connection string to `DATABASE_URL` environment variable

2. **Option B: Use Neon (Free)**
   - Go to https://neon.tech
   - Create account and database
   - Copy connection string

### Step 5: Initialize Database
After deployment with proper DATABASE_URL:
1. Visit: `https://your-app.vercel.app/api/init-db` (POST request)
2. Or run: `node init-production-db.js`

## Common Issues and Fixes

### Issue: "Module not found" errors
**Fix:** Make sure all imports use correct paths:
```typescript
import { PrismaClient } from '@/app/generated/prisma';
```

### Issue: Prisma client errors
**Fix:** Add to `vercel.json`:
```json
{
  "buildCommand": "prisma generate && next build",
  "installCommand": "npm install && npx prisma generate"
}
```

### Issue: Database connection fails
**Fix:** Ensure DATABASE_URL format:
```
postgresql://username:password@hostname:port/database?sslmode=require
```

## Immediate Action Required

1. ✅ **Check Vercel build logs** - Look for any red errors
2. ✅ **Verify environment variables** - DATABASE_URL must be set
3. ✅ **Redeploy after fixing** - Push changes or use Vercel CLI
4. ✅ **Test API endpoints** - Run `node debug-api-routes.js`

## How to Check If Fixed
1. Run: `node debug-api-routes.js`
2. All APIs should return 200 status (not 404)
3. Login should work without "internal server error"