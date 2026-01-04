# CSV Report Combiner - Deployment Script
# This script helps you push to GitHub and provides Vercel deployment instructions

Write-Host "=== CSV Report Combiner Deployment ===" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "Error: Git repository not initialized" -ForegroundColor Red
    exit 1
}

# Get GitHub username
$githubUsername = Read-Host "Enter your GitHub username"
if ([string]::IsNullOrWhiteSpace($githubUsername)) {
    Write-Host "Error: GitHub username is required" -ForegroundColor Red
    exit 1
}

# Repository name
$repoName = "csv-report-combiner"

Write-Host ""
Write-Host "Step 1: Creating GitHub repository..." -ForegroundColor Yellow
Write-Host "Please create a repository on GitHub:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://github.com/new" -ForegroundColor White
Write-Host "  2. Repository name: $repoName" -ForegroundColor White
Write-Host "  3. Don't initialize with README, .gitignore, or license" -ForegroundColor White
Write-Host "  4. Click 'Create repository'" -ForegroundColor White
Write-Host ""
$continue = Read-Host "Have you created the repository? (y/n)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "Please create the repository first, then run this script again." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "Step 2: Adding remote and pushing to GitHub..." -ForegroundColor Yellow

# Check if remote already exists
$remoteExists = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $update = Read-Host "Update it? (y/n)"
    if ($update -eq "y" -or $update -eq "Y") {
        git remote set-url origin "https://github.com/$githubUsername/$repoName.git"
    }
} else {
    git remote add origin "https://github.com/$githubUsername/$repoName.git"
}

# Rename branch to main if needed
$currentBranch = git branch --show-current
if ($currentBranch -ne "main") {
    git branch -M main
}

Write-Host ""
Write-Host "Attempting to push to GitHub..." -ForegroundColor Yellow
Write-Host "Note: You may need to authenticate. Options:" -ForegroundColor Yellow
Write-Host "  - Use GitHub Desktop (easiest)" -ForegroundColor White
Write-Host "  - Use Personal Access Token" -ForegroundColor White
Write-Host "  - Use GitHub CLI: winget install GitHub.cli" -ForegroundColor White
Write-Host ""

git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✓ Successfully pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Step 3: Deploy to Vercel" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://vercel.com" -ForegroundColor White
    Write-Host "  2. Sign in with GitHub" -ForegroundColor White
    Write-Host "  3. Click 'Add New...' → 'Project'" -ForegroundColor White
    Write-Host "  4. Import your '$repoName' repository" -ForegroundColor White
    Write-Host "  5. Vercel will auto-detect Next.js settings" -ForegroundColor White
    Write-Host "  6. Click 'Deploy'" -ForegroundColor White
    Write-Host ""
    Write-Host "Your app will be live in 2-3 minutes!" -ForegroundColor Green
    Write-Host "Repository URL: https://github.com/$githubUsername/$repoName" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Push failed. You may need to authenticate." -ForegroundColor Red
    Write-Host ""
    Write-Host "Option 1: Use GitHub Desktop" -ForegroundColor Yellow
    Write-Host "  1. Download: https://desktop.github.com/" -ForegroundColor White
    Write-Host "  2. File → Add Local Repository → Select this folder" -ForegroundColor White
    Write-Host "  3. Publish repository" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 2: Use Personal Access Token" -ForegroundColor Yellow
    Write-Host "  1. Go to: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host "  2. Generate new token (classic) with 'repo' scope" -ForegroundColor White
    Write-Host "  3. Run: git remote set-url origin https://YOUR_TOKEN@github.com/$githubUsername/$repoName.git" -ForegroundColor White
    Write-Host "  4. Run: git push -u origin main" -ForegroundColor White
    Write-Host ""
    Write-Host "Option 3: Install GitHub CLI" -ForegroundColor Yellow
    Write-Host "  winget install GitHub.cli" -ForegroundColor White
    Write-Host "  gh auth login" -ForegroundColor White
    Write-Host "  gh repo create $repoName --public --source=. --remote=origin --push" -ForegroundColor White
}



