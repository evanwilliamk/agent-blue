#!/bin/bash

echo "========================================"
echo "Blue Line Assistant - Deployment Setup"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "README.md" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Step 1: GitHub repository
echo "📦 Step 1: Push to GitHub"
echo ""
echo "Have you created a GitHub repository yet? (y/n)"
read -r created_repo

if [ "$created_repo" != "y" ]; then
    echo ""
    echo "Please create a GitHub repository first:"
    echo "1. Go to: https://github.com/new"
    echo "2. Repository name: blue-line-assistant"
    echo "3. Don't initialize with README"
    echo "4. Click 'Create repository'"
    echo ""
    echo "Come back and run this script again when done!"
    exit 0
fi

echo ""
echo "What's your GitHub username?"
read -r github_username

echo ""
echo "Pushing to GitHub..."
git remote remove origin 2>/dev/null
git remote add origin "https://github.com/$github_username/blue-line-assistant.git"
git push -u origin main

if [ $? -ne 0 ]; then
    echo "❌ Push failed. You may need to authenticate."
    echo "Run: gh auth login"
    echo "Then run this script again."
    exit 1
fi

echo "✅ Code pushed to GitHub!"
echo ""

# Step 2: Vercel deployment
echo "========================================"
echo "📦 Step 2: Deploy to Vercel"
echo "========================================"
echo ""
echo "Now let's deploy to Vercel:"
echo ""
echo "1. Go to: https://vercel.com"
echo "2. Click 'Sign in with GitHub'"
echo "3. Click 'New Project'"
echo "4. Find and import 'blue-line-assistant'"
echo "5. ⚠️ IMPORTANT: Click 'Edit' next to 'Root Directory'"
echo "6. Select: 'a11y-dashboard'"
echo "7. Click 'Deploy'"
echo "8. Wait for deployment to complete (~2 minutes)"
echo ""
echo "When deployment is done, you'll get a URL like:"
echo "https://blue-line-assistant-xxx.vercel.app"
echo ""
echo "Have you deployed to Vercel? (y/n)"
read -r deployed

if [ "$deployed" != "y" ]; then
    echo ""
    echo "Come back and run this script again after deploying!"
    exit 0
fi

# Step 3: Update plugin
echo ""
echo "What's your Vercel URL? (paste the full URL)"
echo "Example: https://blue-line-assistant-xxx.vercel.app"
read -r vercel_url

# Remove trailing slash if present
vercel_url="${vercel_url%/}"

echo ""
echo "Updating plugin files with: $vercel_url/api"
echo ""

# Update code.ts
sed -i.bak "s|const API_BASE_URL = '.*'|const API_BASE_URL = '$vercel_url/api'|" figma-plugin/src/code.ts
echo "✅ Updated figma-plugin/src/code.ts"

# Update ui.html
sed -i.bak "s|value=\"http[s]*://[^\"]*\"|value=\"$vercel_url/api\"|" figma-plugin/src/ui.html
echo "✅ Updated figma-plugin/src/ui.html"

# Remove backup files
rm -f figma-plugin/src/code.ts.bak figma-plugin/src/ui.html.bak

# Rebuild plugin
echo ""
echo "Rebuilding plugin..."
cd figma-plugin
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

cd ..
echo "✅ Plugin rebuilt!"

echo ""
echo "========================================"
echo "✨ Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. In Figma: Plugins → Development → Hot reload current plugin"
echo "   (Or unload and reload from manifest: figma-plugin/manifest.json)"
echo "2. Test the plugin by scanning a page"
echo "3. Check your dashboard at: $vercel_url"
echo ""
echo "🎉 Your plugin is ready to distribute!"
echo ""
