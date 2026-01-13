# 🔧 Troubleshooting Guide

## ✅ Current Status

Both servers are running:
- ✅ **Backend:** Running on port 5001 (Health check: OK)
- ✅ **Frontend:** Running on port 5173 (Status: 200)

## 🔍 What to Check

### 1. Open Browser Console
- Press `F12` or `Ctrl+Shift+I`
- Check the **Console** tab for any errors
- Check the **Network** tab for failed requests

### 2. Access the Application
- Go to: **http://localhost:5173**
- You should see the login page

### 3. Common Issues & Solutions

#### Issue: Blank Page / White Screen
**Solution:**
- Clear browser cache: `Ctrl+Shift+Delete`
- Hard refresh: `Ctrl+F5`
- Check browser console for errors

#### Issue: "Cannot connect to API" Error
**Solution:**
- Verify backend is running: http://localhost:5001/api/health
- Check CORS settings
- Verify environment variables

#### Issue: Login Not Working
**Solution:**
- Verify MongoDB connection is active
- Check if users are seeded in database
- Check backend console for errors

#### Issue: Module/Import Errors
**Solution:**
```powershell
cd frontend
rm -r node_modules
npm install
```

#### Issue: Port Already in Use
**Solution:**
```powershell
# Kill process on port 5001
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process -Force

# Kill process on port 5173
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

## 🚀 Restart Everything

### Stop All Servers:
```powershell
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```

### Start Backend:
```powershell
cd backend
$env:MONGODB_URI='mongodb+srv://mfhomnnea_db_user:9YbEo2xUdIIhZZPD@cluster0.lidyutu.mongodb.net/sales_management?retryWrites=true&w=majority'
$env:JWT_SECRET='your_super_secret_jwt_key_here_change_in_production'
$env:JWT_EXPIRE='24h'
$env:NODE_ENV='development'
$env:FRONTEND_URL='http://localhost:5173'
$env:PORT='5001'
npm run dev
```

### Start Frontend (New Terminal):
```powershell
cd frontend
$env:VITE_API_URL='http://localhost:5001/api'
npm run dev
```

## 📋 Verify Everything Works

1. ✅ Backend health: http://localhost:5001/api/health
2. ✅ Frontend page: http://localhost:5173
3. ✅ Login page appears
4. ✅ Can login with credentials
5. ✅ Dashboard loads after login

## 📝 What Error Are You Seeing?

Please check:
- Browser console (F12 → Console tab)
- Terminal output (any red error messages)
- Network tab (any failed API calls)

Share the specific error message and I can help fix it!

