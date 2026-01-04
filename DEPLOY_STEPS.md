# Quick Deployment Steps

## Prerequisites
- GitHub account
- Vercel account (can sign up with GitHub)

## Step 1: Initialize Git Repository (if not already done)

```powershell
# Make sure you're in the project directory
cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Reporting-Bot"

# Initialize git repository (only if not already initialized here)
git init

# Make sure git user is configured (already done based on your config)
git config user.name "Daniel Raphael"
git config user.email "danielraphaelh@gmail.com"
```

## Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `csv-report-combiner` (or your preferred name)
3. Description: "CSV Report Combiner - Next.js 14 application"
4. **Don't** initialize with README, .gitignore, or license
5. Click "Create repository"

## Step 3: Add Files and Commit

```powershell
# Add only the Next.js project files
git add .gitignore
git add package.json
git add package-lock.json
git add tsconfig.json
git add next.config.js
git add tailwind.config.ts
git add postcss.config.js
git add README.md
git add DEPLOYMENT.md
git add app/
git add components/
git add lib/

# Commit the files
git commit -m "Initial commit: CSV Report Combiner - Next.js 14 app"
```

## Step 4: Connect to GitHub and Push

```powershell
# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/csv-report-combiner.git

# Or if you want to use SSH (if you have SSH keys set up):
# git remote add origin git@github.com:YOUR_USERNAME/csv-report-combiner.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note**: You may need to authenticate with GitHub. You can:
- Use GitHub Desktop (easier GUI option)
- Use GitHub CLI: `gh auth login`
- Use a Personal Access Token in the URL

## Step 5: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)

1. Go to https://vercel.com
2. Sign in with your GitHub account
3. Click "Add New..." → "Project"
4. Import your `csv-report-combiner` repository
5. Vercel will auto-detect Next.js settings:
   - Framework Preset: Next.js ✓
   - Root Directory: `./` ✓
   - Build Command: `npm run build` ✓
   - Output Directory: `.next` ✓
6. Click "Deploy"
7. Wait 2-3 minutes for deployment
8. Your app will be live at `https://csv-report-combiner.vercel.app` (or custom URL)

### Option B: Via Vercel CLI

```powershell
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project directory)
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No (first time)
# - What's your project's name? csv-report-combiner
# - In which directory is your code located? ./
# - Override settings? No

# For production deployment:
vercel --prod
```

## That's It! 🎉

Your application will be:
- Live at your Vercel URL
- Automatically redeploy on every push to `main` branch
- Accessible worldwide

## Troubleshooting

**If git push fails:**
- Make sure you're authenticated: Use GitHub Desktop or GitHub CLI
- Check if repository exists on GitHub
- Verify remote URL: `git remote -v`

**If Vercel build fails:**
- Check build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`
- Test build locally: `npm run build`

**Need help?**
- Check Vercel logs in the dashboard
- GitHub Actions (if enabled) will show build status
- Review the README.md for more details

