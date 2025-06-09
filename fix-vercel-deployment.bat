@echo off
echo 🚨 Fixing Vercel Deployment Issues
echo ====================================

echo 📝 Current status: API routes returning 404 errors
echo 💡 This means the deployment failed or environment variables are missing

echo.
echo 🔧 Step 1: Cleaning build artifacts...
if exist ".next" rmdir /s /q ".next"
if exist "node_modules" rmdir /s /q "node_modules"

echo ✅ Cleaned .next and node_modules

echo.
echo 📦 Step 2: Reinstalling dependencies...
npm install

if errorlevel 1 (
    echo ❌ npm install failed
    pause
    exit /b 1
)

echo ✅ Dependencies installed

echo.
echo 🔧 Step 3: Generating Prisma client...
npx prisma generate

if errorlevel 1 (
    echo ❌ Prisma generate failed
    pause
    exit /b 1
)

echo ✅ Prisma client generated

echo.
echo 🏗️ Step 4: Building project...
npm run build

if errorlevel 1 (
    echo ❌ Build failed - check the error messages above
    echo 💡 Common issues:
    echo    - Missing environment variables
    echo    - Prisma client import errors
    echo    - TypeScript compilation errors
    pause
    exit /b 1
)

echo ✅ Build successful

echo.
echo 🚀 Next steps:
echo 1. Go to Vercel Dashboard → Project → Settings → Environment Variables
echo 2. Add: DATABASE_URL=your-postgresql-connection-string
echo 3. Redeploy: git add . && git commit -m "Fix deployment" && git push
echo.
echo 📋 Required environment variables:
echo    DATABASE_URL=postgresql://...
echo    NEXTAUTH_SECRET=any-random-string
echo    NEXTAUTH_URL=https://your-app.vercel.app
echo.
echo 🧪 After redeployment, test with: node debug-api-routes.js

pause