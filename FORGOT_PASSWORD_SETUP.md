# Complete Forgot Password Setup Guide

## 📧 **Step 1: Set Up Gmail App Password** 

### Option A: Quick Test (Console Method)
1. **Restart your backend server** (the logs will show reset links)
2. **Click "Forgot Password"** on login page
3. **Check backend console** - you'll see:
   ```
   =================================
   📧 EMAIL NOT CONFIGURED - SHOWING RESET LINK
   =================================
   👤 Email: your-email@gmail.com
   🔗 Reset Link: http://localhost:3000/#/reset-password?token=abc123...
   =================================
   ```
4. **Copy the reset link** and paste it in your browser

### Option B: Enable Actual Emails
1. **Go to Google Account Security**: https://myaccount.google.com/security
2. **Enable 2-Factor Authentication** (if not already enabled)
3. **Generate App Password**:
   - Go to "App passwords" 
   - Select "Mail" 
   - Enter custom name: "Student Feedback System"
   - Copy the 16-character password (example: `abcd efgh ijkl mnop`)
4. **Update backend/.env file**:
   ```env
   SMTP_USER=praveenece005@gmail.com
   SMTP_PASS=abcd-efgh-ijkl-mnop  # Your actual app password
   ```
5. **Restart backend server**

## 🔄 **Complete Forgot Password Flow**

### Step 1: Request Password Reset
- User clicks "Forgot your password?" on login page
- User enters their registered email address
- System sends email (or shows link in console)
- Success message: "If an account with that email exists, a reset link has been sent."

### Step 2: Email with Reset Button
- Email contains styled reset button
- Button links to: `http://localhost:3000/#/reset-password?token=SECURE_TOKEN`
- Link expires in 1 hour
- Link can only be used once

### Step 3: Reset Password Page
- User clicks link, lands on reset password page
- Page verifies token validity
- Shows form with:
  - New Password field (with eye icon)
  - Confirm Password field (with eye icon)
  - Update Password button

### Step 4: Password Updated in Database
- System validates passwords match
- System validates password is 6+ characters
- Password is hashed and stored in database
- Reset token is marked as used
- Success page shows with "Sign In Now" button

## 🧪 **Testing the Complete Flow**

1. **Create a test user** or use existing account
2. **Go to login page**: http://localhost:3000/#/admin-login
3. **Click "Forgot your password?"**
4. **Enter email** that exists in your system
5. **Check backend console** for reset link (if email not configured)
6. **Copy reset link** and paste in browser
7. **Enter new password** and confirm
8. **Click "Update Password"**
9. **Click "Sign In Now"** and test with new password

## 🔧 **Troubleshooting**

### Issue: "Internal Server Error"
- **Solution**: Check backend console for error details
- **Usually**: Email configuration problem or database connection issue

### Issue: "Invalid or expired reset token"
- **Solution**: Token might have expired (1 hour limit)
- **Fix**: Generate new reset link

### Issue: "User not found" 
- **Solution**: Make sure the email you're using is actually registered in the system
- **Check**: Try logging in with that email first to verify it exists

### Issue: No email received
- **Solution**: Use console method (Option A above) or set up Gmail App Password properly

## 📝 **Current Status**

✅ Backend forgot password API endpoints working
✅ Frontend forgot password form working  
✅ Backend reset password API endpoints working
✅ Frontend reset password form working
✅ Password hashing and database updates working
✅ Token generation and validation working
✅ Email service with fallback to console logs

🔄 **Pending**: Configure actual email delivery (optional - console method works for testing)

## 🎯 **Next Steps**

1. **Test the flow** using console method
2. **Set up Gmail App Password** for actual emails (optional)
3. **Deploy with production email credentials** when ready
