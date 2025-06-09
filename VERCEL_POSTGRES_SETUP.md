# 🗄️ Vercel Postgres Setup Guide

## Step 1: Create Vercel Postgres Database

1. **Go to Vercel Dashboard:**
   - Open https://vercel.com/dashboard
   - Sign in to your account

2. **Navigate to your project:**
   - Find and click on `money-exchange-app123-9`

3. **Create Database:**
   - Click on the **Storage** tab (or **Settings** → **Storage**)
   - Click **Create Database**
   - Select **Postgres**
   - Database name: `money-exchange-db` (or any name you prefer)
   - Region: Choose closest to your users
   - Plan: Select **Hobby (Free)**
   - Click **Create**

4. **Get Connection Details:**
   - After creation, click on your new database
   - Go to **Settings** or **Connection Details**
   - You'll see connection information like:
     ```
     DATABASE_URL: postgresql://username:password@hostname:port/database
     ```
   - **Copy this entire DATABASE_URL** - you'll need it in the next step

## Step 2: Set Environment Variables

1. **In your Vercel project dashboard:**
   - Go to **Settings** → **Environment Variables**

2. **Add Variable 1:**
   - Name: `DATABASE_URL`
   - Value: (paste the connection string you copied from Step 1)
   - Environment: Check all boxes (Production, Preview, Development)
   - Click **Save**

3. **Add Variable 2:**
   - Name: `NEXTAUTH_SECRET`
   - Value: `money-exchange-secret-key-12345`
   - Environment: Check all boxes
   - Click **Save**

4. **Add Variable 3:**
   - Name: `NEXTAUTH_URL`
   - Value: `https://money-exchange-app123-9.vercel.app`
   - Environment: Check all boxes
   - Click **Save**

## Step 3: Trigger Redeploy

After adding the environment variables, you need to redeploy:

```bash
# Run this to trigger a new deployment
.\redeploy.bat
```

Or manually:
```bash
git add .
git commit -m "Add Vercel Postgres configuration"
git push origin main
```

## Step 4: Wait and Test

1. **Wait 2-3 minutes** for deployment to complete
2. **Check deployment status** in Vercel dashboard
3. **Test your APIs:**
   ```bash
   node debug-api-routes.js
   ```

## Step 5: Initialize Database

Once APIs are working, initialize the database:
```bash
node init-production-db.js
```

## Expected Results

After completing these steps:
- ✅ All API routes should return 200 status
- ✅ Login should work without "internal server error"
- ✅ Database tables will be created automatically

## If Something Goes Wrong

1. **Check Vercel build logs** for errors
2. **Verify all 3 environment variables** are set correctly
3. **Make sure DATABASE_URL format** is: `postgresql://...`
4. **Try redeploying** if build succeeded but APIs still fail

Let me know when you've completed Step 1 and 2, and I'll help with the rest!
