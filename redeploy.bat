@echo off
echo 🚀 Redeploying with Database Configuration
echo ==========================================

echo 📝 Step 1: Adding changes to git...
git add .

echo 📝 Step 2: Committing changes...
git commit -m "Add database configuration and fix deployment"

echo 📝 Step 3: Pushing to trigger redeploy...
git push origin main

echo ✅ Deployment triggered!
echo.
echo 📱 Next steps:
echo 1. Wait 2-3 minutes for deployment to complete
echo 2. Check Vercel dashboard for deployment status
echo 3. Test your app: run "node debug-api-routes.js"
echo.
echo 🔗 Your app will be available at:
echo https://money-exchange666.vercel.app
echo.
pause
