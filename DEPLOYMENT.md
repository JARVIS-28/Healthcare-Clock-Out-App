# Deployment Guide - GitHub & Vercel

## 📁 Environment Files Structure

### `.env` (Safe for GitHub)
- Contains example/template values
- Safe to commit to GitHub
- Used as reference for required variables

### `.env.local` (Keep Secret)
- Contains your actual secrets and passwords
- **NEVER commit to GitHub** (already in .gitignore)
- Used for local development

## 🚀 Step-by-Step Deployment

### 1. Prepare for GitHub

```bash
# Add all files to git
git add .

# Commit your changes
git commit -m "Healthcare Clock App - Ready for deployment"

# Push to GitHub
git push origin main
```

**✅ Safe to commit**: 
- `.env` (contains only templates)
- All application code
- Configuration files

**❌ Never commit**:
- `.env.local` (contains real secrets)

### 2. Deploy to Vercel

#### Option A: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow prompts to connect GitHub repo
```

#### Option B: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Connect your GitHub account
3. Import your healthcare clock app repository
4. Configure environment variables (see below)

### 3. Configure Vercel Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables, add:

```bash
# Database
DATABASE_URL=postgresql://postgres.pdttorgvykpyeaytszxm:YOUR_ACTUAL_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.pdttorgvykpyeaytszxm:YOUR_ACTUAL_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# Auth0
AUTH0_SECRET=your-actual-32-character-secret
AUTH0_BASE_URL=https://your-app.vercel.app
AUTH0_ISSUER_BASE_URL=https://dev-zdhknxi00po7vryi.us.auth0.com
AUTH0_CLIENT_ID=g89SPTPrIPJ8PJhxMZrLcq4cxKY9VOGV
AUTH0_CLIENT_SECRET=your-actual-auth0-client-secret

# App Settings
NEXT_PUBLIC_APP_NAME=Healthcare Clock App
NEXT_PUBLIC_DEFAULT_RADIUS_KM=2
GRAPHQL_ENDPOINT=https://your-app.vercel.app/api/graphql
```

### 4. Post-Deployment Setup

After successful deployment:

1. **Update Auth0 Settings**:
   - Add your Vercel URL to Auth0 allowed callbacks
   - Update AUTH0_BASE_URL in Vercel env vars

2. **Initialize Database**:
   ```bash
   # Run this once after deployment
   npx prisma db push
   ```

3. **Test the Application**:
   - Visit your Vercel URL
   - Test manager and care worker login flows
   - Verify database connectivity

## 🔒 Security Best Practices

### Local Development
- Keep `.env.local` with real values
- Never share or commit `.env.local`
- Use `.env` for documentation/examples

### Production
- All secrets stored in Vercel environment variables
- Enable branch protection on GitHub
- Use environment-specific URLs

## 📋 Pre-Deployment Checklist

- [ ] `.env` contains only example values
- [ ] `.env.local` is in `.gitignore`
- [ ] All real secrets removed from code
- [ ] Supabase password replaced in production env vars
- [ ] Auth0 URLs updated for production domain
- [ ] Database schema pushed to Supabase
- [ ] Application builds successfully

## 🛠 Useful Commands

```bash
# Local development
npm run dev

# Test build locally
npm run build

# Database commands
npm run db:push    # Push schema to database
npm run db:studio  # View database

# Vercel commands
vercel            # Deploy
vercel --prod     # Deploy to production
vercel env pull   # Download env vars from Vercel
```

## 🌐 Production URLs

After deployment, your app will be available at:
- **Production**: `https://your-app.vercel.app`
- **Preview**: `https://your-app-git-branch.vercel.app` (for feature branches)

Your healthcare clock app is now ready for production use! 🎉
