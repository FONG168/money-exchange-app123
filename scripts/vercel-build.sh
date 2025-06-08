#!/bin/bash
# Vercel deployment script for database setup

echo "🔧 Setting up database for production..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema (creates tables if they don't exist)
echo "🗄️ Setting up database schema..."
npx prisma db push --accept-data-loss

# Build the application
echo "🏗️ Building Next.js application..."
npm run build

echo "✅ Deployment setup complete!"
