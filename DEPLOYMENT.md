# Deployment Guide

## Step 1: Deploy to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it `csv-report-combiner` (or your preferred name)
   - Don't initialize with README, .gitignore, or license (we already have these)
   - Click "Create repository"

2. **Push your code to GitHub:**

```bash
# Make sure you're in the project directory
cd "C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Reporting-Bot"

# Commit your changes (if not already committed)
git add .
git commit -m "Initial commit: CSV Report Combiner application"

# Add GitHub remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/csv-report-combiner.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**If you need to set your git user first:**
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel Dashboard (Recommended)

1. **Sign in to Vercel:**
   - Go to https://vercel.com
   - Sign in with your GitHub account

2. **Import your repository:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository (`csv-report-combiner`)
   - Vercel will automatically detect it's a Next.js project

3. **Configure project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://csv-report-combiner.vercel.app` (or your custom domain)

### Option B: Using Vercel CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
# From your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account/team)
# - Link to existing project? No (first time)
# - What's your project's name? csv-report-combiner
# - In which directory is your code located? ./
# - Override settings? No
```

4. **For production deployment:**
```bash
vercel --prod
```

## Post-Deployment

1. **Your app is now live!** You can access it at the URL provided by Vercel

2. **Automatic deployments:** Every push to the `main` branch will automatically trigger a new deployment

3. **Environment Variables:** If you need to add any later, go to:
   - Vercel Dashboard → Your Project → Settings → Environment Variables

4. **Custom Domain (Optional):**
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Add your custom domain

## Troubleshooting

**Build fails:**
- Check the build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Make sure TypeScript compiles without errors: `npm run build`

**App not working:**
- Check the deployment logs
- Verify the build completed successfully
- Check browser console for errors

**Git push fails:**
- Make sure you're authenticated with GitHub
- Use SSH keys or GitHub CLI for authentication if needed
- Or use GitHub Desktop for a GUI approach

