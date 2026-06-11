# ADAS Wiki Vercel Deployment Guide
# This script guides you through manual deployment

Write-Host '=== ADAS Wiki Vercel Deploy Guide ===' -ForegroundColor Cyan
Write-Host ''

Write-Host 'Vercel CLI installation failed. Please deploy manually:' -ForegroundColor Yellow
Write-Host ''
Write-Host 'STEP 1: Create Vercel Postgres Database' -ForegroundColor Cyan
Write-Host '  1. Open https://vercel.com/dashboard' -ForegroundColor White
Write-Host '  2. Click Storage -> Create Database -> Postgres' -ForegroundColor White
Write-Host '  3. Name: adas-wiki-db, Region: iad1' -ForegroundColor White
Write-Host '  4. Copy the POSTGRES_PRISMA_URL value' -ForegroundColor White
Write-Host ''
Write-Host 'STEP 2: Deploy on Vercel' -ForegroundColor Cyan
Write-Host '  1. Open https://vercel.com/new' -ForegroundColor White
Write-Host '  2. Import Git Repository -> Estate77/adas-wiki' -ForegroundColor White
Write-Host '  3. Configure:' -ForegroundColor White
Write-Host '     - Build Command: npm install && cd frontend && npm install && npm run build' -ForegroundColor White
Write-Host '     - Output Directory: frontend/dist' -ForegroundColor White
Write-Host '     - Install Command: npm install && cd api && npm install' -ForegroundColor White
Write-Host '  4. Add Environment Variables:' -ForegroundColor White
Write-Host '     - DATABASE_URL: (paste your POSTGRES_PRISMA_URL)' -ForegroundColor White
Write-Host '     - JWT_SECRET: adas-wiki-secret-2026-production-key-change-me' -ForegroundColor White
Write-Host '  5. Click Deploy' -ForegroundColor White
Write-Host ''
Write-Host 'STEP 3: Run Database Migration' -ForegroundColor Cyan
Write-Host '  After deploy succeeds, in Vercel dashboard:' -ForegroundColor White
Write-Host '  1. Go to your project -> Settings -> General' -ForegroundColor White
Write-Host '  2. Or use Vercel CLI locally (if installed):' -ForegroundColor White
Write-Host '     vercel env pull .env.production' -ForegroundColor White
Write-Host '     cd backend && npx prisma migrate deploy && npx prisma db seed' -ForegroundColor White
Write-Host ''
Write-Host 'DONE: You will get a https://xxx.vercel.app URL to share!' -ForegroundColor Green
