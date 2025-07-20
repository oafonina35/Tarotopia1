# Connect Replit to GitHub

## If you already created a GitHub repository:

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/yourusername/tarotopia.git

# Push your code to GitHub
git add .
git commit -m "Initial Tarotopia iOS app commit"
git push -u origin main
```

## If you need to create a GitHub repository:

1. Go to https://github.com
2. Click "New repository"
3. Name it "tarotopia-ios"
4. Make it public or private
5. Don't initialize with README (since you already have code)
6. Copy the repository URL
7. Run the commands above with your actual URL

## Then in Replit:
- The Git icon should appear in the sidebar
- You'll see your GitHub repository connected
- You can push/pull changes directly from Replit

## Alternative: Let Replit create the GitHub repo
1. Click the Git tab in Replit sidebar
2. Look for "Export to GitHub" button
3. Replit will create the repository for you automatically
4. This is usually the easiest method