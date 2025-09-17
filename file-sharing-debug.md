# File Sharing Download Issue - Troubleshooting Guide

## Issue Summary
The file download functionality is failing with 404 errors and "Failed to fetch sent files" errors.

## Root Causes Identified

### 1. Authentication Token Issues
- The browser console shows "Failed to fetch sent files" - AxiosError
- This typically indicates the JWT token has expired or is invalid
- All file sharing endpoints require valid authentication

### 2. Database Connection Issues
- File records may not be properly stored in MongoDB
- File paths might be incorrect in the database

## Quick Fixes

### Fix 1: Refresh Authentication
1. **Logout and login again** in the browser
2. This will generate a fresh JWT token
3. Try downloading files after re-authentication

### Fix 2: Clear Browser Cache
1. Open browser Developer Tools (F12)
2. Right-click refresh button → "Empty Cache and Hard Reload"
3. Or clear localStorage: `localStorage.clear()` in console

### Fix 3: Check Token in Browser
1. Open browser Developer Tools (F12)
2. Go to Application/Storage → Local Storage
3. Check if 'token' exists and is not expired
4. Token should be a long JWT string

## Backend Verification

### Check if backend is running properly:
```bash
# Test health endpoint
curl http://localhost:8001/health

# Test API base
curl http://localhost:8001/api/
```

### Check file storage:
The uploaded files should be in:
`backend/uploads/shared-files/`

## Frontend Debug Steps

### Add console logging to handleDownload:
```javascript
const handleDownload = async (fileId, fileName) => {
  console.log('Downloading file:', { fileId, fileName });
  console.log('API URL:', `${API}/fileshare/download/${fileId}`);
  
  try {
    const token = localStorage.getItem('token');
    console.log('Token exists:', !!token);
    
    const response = await axios.get(`${API}/fileshare/download/${fileId}`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    // ... rest of the code
  } catch (error) {
    console.error('Download error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
  }
};
```

## Most Likely Solution

Based on the error patterns, the most common cause is **expired authentication**. 

**Try this first:**
1. **Logout** from the admin panel
2. **Login again** 
3. Navigate to File Share tab
4. Try downloading a file

This should resolve the 404 and authentication errors.

## If Problem Persists

1. Check backend server logs for detailed error messages
2. Verify MongoDB connection is working
3. Check file permissions on upload directory
4. Ensure file records exist in database with correct file paths
