# 🔍 Login Debugging Guide

## ✅ Backend API Status
The backend API is working correctly:
- ✅ Login endpoint responds successfully
- ✅ Returns token and user data
- ✅ Rate limiting fixed (100 req/min)

## 🔍 Frontend Issues to Check

### 1. Check Browser Console (F12)
Look for:
- ❌ CORS errors
- ❌ Network errors
- ❌ 404 Not Found
- ❌ API URL configuration issues
- ❌ JavaScript errors

### 2. Check Network Tab (F12 → Network)
When you click login:
- Look for request to `/api/auth/login`
- Check Status Code (should be 200)
- Check Response body
- Check if request is being made at all

### 3. Check API URL Configuration

The frontend should use: `http://localhost:5001/api`

Check in browser console:
```javascript
console.log(import.meta.env.VITE_API_URL)
```

### 4. Clear Browser Storage
1. Press F12
2. Go to Application tab (or Storage in Firefox)
3. Clear Local Storage
4. Clear Cookies
5. Try login again

### 5. Common Issues

#### Issue: "Network Error" or CORS Error
**Solution:** Make sure backend is running and CORS is configured

#### Issue: "404 Not Found"
**Solution:** Check API URL in frontend .env file:
```
VITE_API_URL=http://localhost:5001/api
```

#### Issue: Login succeeds but doesn't redirect
**Solution:** Check browser console for navigation errors

#### Issue: No error message appears
**Solution:** Check if toast notifications are working (top-right corner)

## 🛠️ Quick Fixes

### 1. Restart Both Servers

**Backend:**
```powershell
cd backend
npm run dev
```

**Frontend:**
```powershell
cd frontend
npm run dev
```

### 2. Hard Refresh Browser
- Press `Ctrl + Shift + R` or `Ctrl + F5`

### 3. Test API Directly
```powershell
$body = '{"username":"admin","password":"Admin@123"}'
Invoke-RestMethod -Uri "http://localhost:5001/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```

### 4. Check if Frontend Can Reach Backend
Open browser console and run:
```javascript
fetch('http://localhost:5001/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

## 📝 What to Share for Debugging

1. **Browser Console Errors** (screenshot or text)
2. **Network Tab** - Screenshot of the login request
3. **What happens** - Does it show an error? Does nothing happen?
4. **Any error messages** shown on screen
