@echo off
echo 🚀 Fixing Vercel Deployment Issues...

echo.
echo 📋 Step 1: Checking current deployment status
vercel ls

echo.
echo 📋 Step 2: Setting up environment variables
echo You need to set these environment variables in Vercel Dashboard:
echo - DATABASE_URL (your PostgreSQL connection string)
echo - NEXTAUTH_SECRET (a random secret key)
echo - NEXTAUTH_URL (your deployed app URL)

echo.
echo 📋 Step 3: Redeploying with proper configuration
git add .
git commit -m "Fix: Update Vercel deployment configuration for API routes"
git push origin main

echo.
echo 📋 Step 4: Trigger Vercel redeploy
vercel --prod

echo.
echo ✅ Deployment fix complete!
echo.
echo 🔗 Next steps:
echo 1. Go to Vercel Dashboard
echo 2. Set environment variables
echo 3. Redeploy from dashboard
echo 4. Test API routes

pause