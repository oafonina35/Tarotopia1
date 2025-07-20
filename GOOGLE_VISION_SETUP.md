# Google Vision API Setup Instructions

## Step 1: Enable the Vision API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Navigate to **APIs & Services** > **Library**
4. Search for "Vision AI API" or "Cloud Vision API"
5. Click **ENABLE** for the Vision API

## Step 2: Verify API Key Permissions
Your API key: `AIzaSyCfdz9BsuyL3wLrHagH7BtH-TatgxiCRjY`

1. Go to **APIs & Services** > **Credentials**
2. Find your API key and click the edit icon
3. Under **API restrictions**, make sure "Cloud Vision API" is allowed
4. Save the changes

## Step 3: Test the Setup
Once enabled, the Tarotopia app will automatically use Google Vision for better text recognition.

## Alternative: Free OCR
The app also includes a completely free OCR.space API that works without any setup - this will be used as the primary method while Google Vision serves as backup.

## Current Status
- ✅ Free OCR.space API (primary, unlimited)
- ⚠️ Google Vision API (needs enabling)
- ✅ Color analysis backup
- ✅ Training database