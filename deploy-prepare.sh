#!/bin/bash

# Deployment preparation script for Currency Exchange Platform

echo "🚀 Preparing for deployment..."
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or later is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version check passed: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run build test
echo "🏗️  Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Your project is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Set up your environment variables on your deployment platform"
    echo "2. Set up a PostgreSQL database"
    echo "3. Run migrations: npx prisma migrate deploy"
    echo "4. Deploy using your chosen platform"
    echo ""
    echo "See DEPLOYMENT.md for detailed instructions."
else
    echo "❌ Build failed. Please fix the errors before deploying."
    exit 1
fi
