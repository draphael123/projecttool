# Push to GitHub - Quick Commands

## Your repository is ready! Now push to GitHub:

### Step 1: Create Repository on GitHub
1. Go to: https://github.com/new
2. Repository name: `csv-report-combiner`
3. Description: "CSV Report Combiner - Next.js 14 application"
4. **Don't** check "Initialize with README"
5. Click "Create repository"

### Step 2: Push Your Code

Copy and run these commands in PowerShell (replace YOUR_USERNAME with your GitHub username):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/csv-report-combiner.git
git branch -M main
git push -u origin main
```

**If you get authentication errors:**

**Option A: Use GitHub Desktop**
1. Download GitHub Desktop: https://desktop.github.com/
2. File → Add Local Repository → Select this folder
3. Publish repository → Choose name → Click "Publish Repository"

**Option B: Use GitHub CLI**
```powershell
# Install GitHub CLI (if not installed)
winget install GitHub.cli

# Login
gh auth login

# Create repo and push
gh repo create csv-report-combiner --public --source=. --remote=origin --push
```

**Option C: Use Personal Access Token**
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo` (all)
4. Copy the token
5. Use it in the push command:
```powershell
git remote add origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/csv-report-combiner.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. Go to: https://vercel.com
2. Click "Sign Up" (or "Log In") → Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import your `csv-report-combiner` repository
5. Vercel will auto-detect:
   - Framework: Next.js ✓
   - Root Directory: `./` ✓
   - Build Command: `npm run build` ✓
6. Click "Deploy"
7. Wait 2-3 minutes
8. Your app is live! 🎉

### Your App Will Be Available At:
`https://csv-report-combiner.vercel.app` (or a custom URL)



