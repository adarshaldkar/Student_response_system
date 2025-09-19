# Complete Google OAuth Setup (Local + Production)

## 🎯 Google Cloud Console Configuration

### 1. Authorized JavaScript Origins
Add **ALL** of these URLs to support both local development and production:

```
http://localhost:3000
http://localhost:5173
http://localhost:8080
https://your-vercel-frontend.vercel.app
```

### 2. Authorized Redirect URIs
Add **ALL** of these URLs:

```
http://localhost:3000
http://localhost:3000/admin-login
http://localhost:3000/register
http://localhost:5173
http://localhost:5173/admin-login
http://localhost:5173/register
https://your-vercel-frontend.vercel.app
https://your-vercel-frontend.vercel.app/admin-login
https://your-vercel-frontend.vercel.app/register
```

## 🔧 Environment Variables Setup

### Frontend .env (Local Development)
```env
# Local Development
REACT_APP_BACKEND_URL=http://localhost:8001
REACT_APP_API_URL=http://localhost:8001/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### Frontend .env.production (Production Build)
```env
# Production
REACT_APP_BACKEND_URL=https://student-response-system.onrender.com
REACT_APP_API_URL=https://student-response-system.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id-here
GENERATE_SOURCEMAP=false
```

### Backend .env (Works for Both)
```env
# Google OAuth (Same Client ID for both environments)
GOOGLE_CLIENT_ID=your-google-client-id-here

# Other backend config...
MONGO_URL=your-mongodb-url
JWT_SECRET=your-jwt-secret
```

## 🚀 How It Works

### For Local Development:
1. Start backend: `npm run dev` (port 8001)
2. Start frontend: `npm start` (port 3000)
3. Google OAuth works on `localhost:3000`

### For Production:
1. Frontend deployed on Vercel
2. Backend deployed on Render
3. Google OAuth works on your Vercel URL

## ✅ Benefits

- ✅ Same Google Client ID for both environments
- ✅ No need to change OAuth config when switching
- ✅ Team can develop locally without issues  
- ✅ Production deployment works seamlessly
- ✅ Can test production build locally

## 🔄 Switching Between Environments

### For Local Development:
Use `.env` file with localhost URLs

### For Production Deployment:
Vercel/Netlify will use `.env.production` automatically

### For Testing Production Build Locally:
```bash
npm run build
npm run preview
```

## 📝 Important Notes

1. **Same Client ID**: Use the same Google Client ID in all environments
2. **Multiple URLs**: Google allows multiple authorized URLs in one OAuth app
3. **No Conflicts**: Having both local and production URLs won't cause conflicts
4. **Security**: Still secure - Google validates the actual origin of each request
