# Students Feedback System - Deployment Guide

## 🚀 Live Deployment

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on Render  
- **Database**: MongoDB Atlas

## 📋 Deployment Steps

### Backend Deployment (Render)

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `cd backend && npm install && npm run build`
4. Set start command: `cd backend && npm start`
5. Add environment variables:
   - `MONGO_URL`: Your MongoDB Atlas connection string
   - `DB_NAME`: Your database name
   - `JWT_SECRET`: Your JWT secret key
   - `FRONTEND_URL`: Your Vercel frontend URL
   - `NODE_ENV`: production

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set build command: `cd frontend && yarn build`
3. Set output directory: `frontend/build`
4. Add environment variable:
   - `REACT_APP_BACKEND_URL`: Your Render backend URL

## 🔧 Environment Variables

### Backend (.env)
```
MONGO_URL="mongodb+srv://username:password@cluster.mongodb.net/"
DB_NAME="students_feedback"
JWT_SECRET="your-secret-key"
FRONTEND_URL="https://your-vercel-app.vercel.app"
NODE_ENV="production"
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL="https://your-render-app.onrender.com"
```

## 🔒 Security Notes

- Never commit actual .env files
- Use environment variables in deployment platforms
- Keep MongoDB credentials secure
- Use strong JWT secrets

## 📱 Features

- Admin registration and login
- Student feedback collection
- Form management
- Data analytics
- Export functionality