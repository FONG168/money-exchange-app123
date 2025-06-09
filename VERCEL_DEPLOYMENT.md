# Vercel Deployment Guide

## Step-by-Step Deployment

### 1. Create GitHub Repository
1. Go to [GitHub.com](https://github.com)
2. Click "+" → "New repository"
3. Repository name: `money-exchange-app`
4. Make it public
5. **Don't** initialize with README (you have existing code)
6. Click "Create repository"

### 2. Push Code to GitHub
```bash
git push -u origin main
```

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import `money-exchange-app`
5. Configure environment variables (see below)
6. Deploy!

### 4. Environment Variables
Set these in Vercel Dashboard → Project → Settings → Environment Variables:

```
DATABASE_URL=postgresql://username:password@hostname:port/database?sslmode=require
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-app-name.vercel.app
```

### 5. Database Options

#### Option A: Vercel Postgres (Recommended)
1. In Vercel Dashboard → Storage → Create → Postgres
2. Copy the connection string to `DATABASE_URL`

#### Option B: Neon (Free Tier)
1. Go to [neon.tech](https://neon.tech)
2. Create account and database
3. Copy connection string

#### Option C: Supabase (Free Tier)
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Go to Settings → Database
4. Copy connection string

### 6. After Database Setup
Once you have the database URL:
1. Add it to Vercel environment variables
2. Redeploy the project
3. Vercel will automatically run `prisma generate` and `prisma db push`

### 7. Post-Deployment
- Your app will be available at `https://your-app-name.vercel.app`
- Test all features (authentication, exchange rates, admin panel)
- Monitor logs in Vercel Dashboard if any issues

## Troubleshooting
- If build fails: Check Vercel build logs
- If database issues: Verify connection string format
- If authentication issues: Ensure `NEXTAUTH_URL` matches your domain

## Your App Features
✅ Real-time exchange rate updates
✅ User authentication
✅ Admin panel
✅ Modern UI with animations
✅ Mobile responsive
✅ Database persistence
