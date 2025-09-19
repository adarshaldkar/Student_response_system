# Google OAuth Setup Guide

## 🚀 Quick Setup Steps

### 1. Create Google Cloud Project
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name your project (e.g., "Student Feedback System")
4. Click "Create"

### 2. Enable Required APIs
1. Go to "APIs & Services" → "Library"
2. Search for "Google Identity" or "Google+ API"
3. Click on it and press "Enable"

### 3. Create OAuth 2.0 Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. If prompted, configure OAuth consent screen first:
   - Choose "External" user type
   - Fill in app name, user support email, developer email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if needed
4. For OAuth Client ID:
   - Application type: "Web application"
   - Name: "Student Feedback System"
   
### 4. Configure Authorized Origins and Redirect URIs
**Authorized JavaScript origins:**
```
http://localhost:3000
http://localhost:5173
http://localhost:8080
```

**Authorized redirect URIs:**
```
http://localhost:3000
http://localhost:5173
```

### 5. Copy Client ID
1. After creating, you'll see your Client ID
2. Copy the Client ID (format: `123456789-abc...xyz.apps.googleusercontent.com`)

### 6. Update Environment Variables
Replace `YOUR_ACTUAL_GOOGLE_CLIENT_ID_HERE` in both files:

**Frontend (.env):**
```env
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

**Backend (.env):**
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

### 7. Restart Applications
```bash
# Restart frontend
cd frontend
npm run dev

# Restart backend
cd backend
npm run dev
```

## 🔍 Troubleshooting

**400 Error:** Google Client ID not configured or incorrect
**401 Error:** Origin not authorized in Google Cloud Console
**403 Error:** API not enabled or quota exceeded

## 📝 Important Notes

- Client ID must be the same in both frontend and backend
- Make sure to add all localhost ports you're using
- For production, add your actual domain to authorized origins
- Keep your Client Secret secure (not needed for this setup)

## ✅ Testing

After setup, the "Continue with Google" button should:
1. Open Google login popup
2. Allow account selection
3. Redirect back to your app
4. Create/login user automatically
