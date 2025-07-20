# Google Vision API Setup Guide

## Quick Setup Steps

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "New Project" or select existing project
3. Note your project ID

### 2. Enable Vision API
1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Cloud Vision API"
3. Click on "Cloud Vision API" result
4. Click **"Enable"** button

### 3. Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the generated API key (looks like: `AIzaSyD...`)
4. (Optional) Click "Restrict Key" to limit to Vision API only for security

### 4. Add API Key to Replit
1. In Replit, go to your project
2. Click on "Secrets" tab (lock icon in sidebar)
3. Add new secret:
   - Key: `GOOGLE_VISION_API_KEY`
   - Value: Your copied API key
4. Click "Add Secret"

### 5. Test the API
Once added, the Tarotopia app will automatically use Google Vision API for text recognition.

## Free Tier Limits
- **1,000 requests per month** for free
- After that: $1.50 per 1,000 requests
- Perfect for testing and moderate usage

## Current Fallback
The app currently works with a pattern-based fallback system while you set up the API key. Once you add the Google Vision API key, it will automatically provide much better text recognition accuracy.

## Troubleshooting
- Make sure the API key is exactly named `GOOGLE_VISION_API_KEY`
- Ensure Vision API is enabled in your Google Cloud project
- Check that billing is enabled (required even for free tier)
- Restart the Replit after adding the secret