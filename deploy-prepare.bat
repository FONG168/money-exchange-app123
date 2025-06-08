@echo off
REM Deployment preparation script for Currency Exchange Platform (Windows)

echo 🚀 Preparing for deployment...
echo ================================

REM Check if Node.js is installed
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or later.
    pause
    exit /b 1
)

echo ✅ Node.js version check passed:
node -v

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npx prisma generate

REM Run build test
echo 🏗️  Testing build...
npm run build

if errorlevel 1 (
    echo ❌ Build failed. Please fix the errors before deploying.
    pause
    exit /b 1
)

echo ✅ Build successful!
echo.
echo 🎉 Your project is ready for deployment!
echo.
echo Next steps:
echo 1. Set up your environment variables on your deployment platform
echo 2. Set up a PostgreSQL database
echo 3. Run migrations: npx prisma migrate deploy
echo 4. Deploy using your chosen platform
echo.
echo See DEPLOYMENT.md for detailed instructions.
pause
