# Simple Vercel Env Setup using vercel CLI

$ErrorActionPreference = "Stop"

Write-Host "Adding DATABASE_URL..."
$env:DATABASE_URL_VALUE = "postgres://2e66e34e6aa11d4d18a30527af9939eab578277277073231ea241d85127547be:sk_O7AQjNRD75X4RJLvqjrVz@db.prisma.io:5432/postgres?sslmode=require"

# Use vercel env add with pipe
$env:DATABASE_URL_VALUE | vercel env add DATABASE_URL production

Write-Host ""
Write-Host "Adding JWT_SECRET..."
$env:JWT_SECRET_VALUE = "adas-wiki-secret-2026-production-key-change-me"

$env:JWT_SECRET_VALUE | vercel env add JWT_SECRET production

Write-Host ""
Write-Host "Done! Environment variables added."
