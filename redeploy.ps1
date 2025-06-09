Write-Host "🚀 Redeploying with Database Configuration" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

Write-Host "📝 Step 1: Adding changes to git..." -ForegroundColor Yellow
git add .

Write-Host "📝 Step 2: Committing changes..." -ForegroundColor Yellow
git commit -m "Add database configuration and fix deployment"

Write-Host "📝 Step 3: Pushing to trigger redeploy..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Deployment triggered!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next steps:" -ForegroundColor Cyan
Write-Host "1. Wait 2-3 minutes for deployment to complete"
Write-Host "2. Check Vercel dashboard for deployment status"
Write-Host "3. Test your app: run 'node debug-api-routes.js'"
Write-Host ""
Write-Host "🔗 Your app will be available at:" -ForegroundColor Cyan
Write-Host "https://money-exchange666.vercel.app"
Write-Host ""
Read-Host "Press Enter to continue"
