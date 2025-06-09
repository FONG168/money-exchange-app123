# 🚀 Deployment Guide for Currency Exchange Platform

## Overview
Your Next.js currency exchange platform can be deployed using several methods. Here's a step-by-step guide for each option.

---

## 🔧 Prerequisites

1. **Get an Exchange Rate API Key**:
   - Visit [ExchangeRate-API](https://www.exchangerate-api.com/)
   - Sign up for a free account
   - Get your API key

2. **Prepare Environment Variables**:
   You'll need these environment variables for production:
   ```
   EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
   DATABASE_URL=your-production-database-url
   JWT_SECRET=your-super-secret-jwt-key
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   NEXT_PUBLIC_BASE_URL=https://your-domain.com
   ```

---

## 🌐 Option 1: Deploy to Vercel (Recommended)

Vercel is the easiest option for Next.js applications.

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Login to Vercel
```bash
vercel login
```

### Step 3: Deploy from your project directory
```bash
vercel
```

### Step 4: Set up Database
1. Go to [Vercel Storage](https://vercel.com/storage)
2. Create a new PostgreSQL database (Vercel Postgres)
3. Copy the database URL from the dashboard

### Step 5: Configure Environment Variables
In your Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add these variables:
   - `EXCHANGE_RATE_API_KEY`: Your API key
   - `DATABASE_URL`: Your PostgreSQL database URL
   - `JWT_SECRET`: A secure random string
   - `NEXT_PUBLIC_APP_URL`: Your Vercel domain
   - `NEXT_PUBLIC_BASE_URL`: Your Vercel domain

### Step 6: Deploy
```bash
vercel --prod
```

---

## 🔗 Option 2: Deploy to Netlify

### Step 1: Prepare for Netlify
1. Push your code to GitHub/GitLab
2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

### Step 2: Configure Build Settings
Create `netlify.toml` in your root directory:
```toml
[build]
  publish = ".next"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 3: Set up Database
Use a cloud PostgreSQL service like:
- [Supabase](https://supabase.com/) (recommended - has free tier)
- [PlanetScale](https://planetscale.com/)
- [Railway](https://railway.app/)

### Step 4: Deploy
```bash
netlify deploy
netlify deploy --prod
```

---

## ☁️ Option 3: Deploy to Railway

Railway offers excellent database and hosting services.

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login and Initialize
```bash
railway login
railway init
```

### Step 3: Add Database
```bash
railway add postgresql
```

### Step 4: Set Environment Variables
```bash
railway variables set EXCHANGE_RATE_API_KEY=your-key
railway variables set JWT_SECRET=your-secret
railway variables set NEXT_PUBLIC_APP_URL=https://your-app.railway.app
railway variables set NEXT_PUBLIC_BASE_URL=https://your-app.railway.app
```

### Step 5: Deploy
```bash
railway up
```

---

## 🐳 Option 4: Deploy with Docker

### Step 1: Create Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 2: Create docker-compose.yml
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/mydb
      - EXCHANGE_RATE_API_KEY=your-key
      - JWT_SECRET=your-secret
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Step 3: Deploy
```bash
docker-compose up -d
```

---

## 🔧 Pre-Deployment Checklist

### 1. Test Your Build Locally
```bash
npm run build
npm start
```

### 2. Run Database Migrations
```bash
npx prisma migrate deploy
```

### 3. Test All Features
- User registration/login
- Currency conversion
- Dashboard functionality
- API endpoints

### 4. Update Environment Variables
Make sure all production URLs are correct in your environment variables.

### 5. Set Up Monitoring (Optional)
Consider adding error tracking with:
- [Sentry](https://sentry.io/)
- [LogRocket](https://logrocket.com/)

---

## 🚨 Important Security Notes

1. **Never commit `.env.local` to version control**
2. **Use strong, unique JWT secrets in production**
3. **Enable HTTPS for your production domain**
4. **Regularly update dependencies**
5. **Set up proper CORS policies**

---

## 📝 Post-Deployment Steps

1. **Test your live application thoroughly**
2. **Set up domain (if using custom domain)**
3. **Configure SSL certificates**
4. **Set up monitoring and error tracking**
5. **Create backups for your database**

---

## 🆘 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are installed
   - Check for TypeScript errors

2. **Database Connection Issues**:
   - Verify DATABASE_URL format
   - Check database permissions
   - Ensure database is accessible from your deployment platform

3. **API Key Issues**:
   - Verify your Exchange Rate API key is valid
   - Check API usage limits
   - Ensure environment variables are set correctly

4. **Authentication Issues**:
   - Verify JWT_SECRET is set
   - Check if sessions are persisting correctly

---

## 📧 Support

If you encounter issues:
1. Check the deployment platform's documentation
2. Review build logs for specific error messages
3. Test locally with production environment variables
4. Check database connectivity and migrations

Happy deploying! 🎉
