# Quick Deploy Guide

## Option 1: Use the Script (Easiest)

Run this in PowerShell:
```powershell
.\deploy.ps1
```

The script will guide you through the process.

## Option 2: Manual Steps

### 1. Create GitHub Repository
- Go to: https://github.com/new
- Name: `csv-report-combiner`
- **Don't** initialize with README
- Click "Create repository"

### 2. Push to GitHub

**If you have GitHub Desktop:**
1. Open GitHub Desktop
2. File → Add Local Repository
3. Select this folder: `C:\Users\danie\OneDrive\Desktop\Cursor Projects\Fountain-Reporting-Bot`
4. Click "Publish repository"
5. Name it `csv-report-combiner`
6. Click "Publish Repository"

**If using command line:**
```powershell
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/csv-report-combiner.git
git branch -M main
git push -u origin main
```

**If you get authentication errors:**
- Use GitHub Desktop (easiest)
- Or create a Personal Access Token: https://github.com/settings/tokens
- Or install GitHub CLI: `winget install GitHub.cli` then `gh auth login`

### 3. Deploy to Vercel

1. Go to: https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import `csv-report-combiner`
5. Click "Deploy"
6. Wait 2-3 minutes
7. Done! 🎉

Your app will be live at: `https://csv-report-combiner.vercel.app`



