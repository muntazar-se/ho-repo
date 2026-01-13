# 🚀 How to Run the Project

## Prerequisites

- Node.js (v18 or higher) installed
- MongoDB Atlas connection (already configured)
- Terminal/Command Prompt

## Step-by-Step Instructions

### Option 1: Quick Start (Using PowerShell/Command Prompt)

#### Terminal 1 - Backend Server:
```powershell
cd d:\OH_daily_report_sys\backend
$env:MONGODB_URI='mongodb+srv://mfhomnnea_db_user:9YbEo2xUdIIhZZPD@cluster0.lidyutu.mongodb.net/sales_management?retryWrites=true&w=majority'
$env:JWT_SECRET='your_super_secret_jwt_key_here_change_in_production'
$env:JWT_EXPIRE='24h'
$env:NODE_ENV='development'
$env:FRONTEND_URL='http://localhost:5173'
$env:PORT='5001'
npm run dev
```

#### Terminal 2 - Frontend Server:
```powershell
cd d:\OH_daily_report_sys\frontend
$env:VITE_API_URL='http://localhost:5001/api'
npm run dev
```

### Option 2: Using .env Files (Recommended for Development)

#### Backend Setup:
1. Create a `.env` file in the `backend` folder with:
```
PORT=5001
MONGODB_URI=mongodb+srv://mfhomnnea_db_user:9YbEo2xUdIIhZZPD@cluster0.lidyutu.mongodb.net/sales_management?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=24h
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

2. Run backend:
```powershell
cd backend
npm run dev
```

#### Frontend Setup:
1. Create a `.env` file in the `frontend` folder with:
```
VITE_API_URL=http://localhost:5001/api
VITE_APP_NAME=Sales Management System
```

2. Run frontend:
```powershell
cd frontend
npm run dev
```

## 📍 Access Points

- **Frontend Application:** http://localhost:5173
- **Backend API:** http://localhost:5001/api
- **Health Check:** http://localhost:5001/api/health

## 🔑 Login Credentials

After seeding (done once), use these credentials:

### Admin User
- Username: `admin`
- Password: `Admin@123`

### Manager User
- Username: `manager1`
- Password: `Manager@123`

### Data Entry User
- Username: `dataentry1`
- Password: `Data@123`

## 📝 First Time Setup (If Not Done)

### 1. Install Dependencies

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### 2. Seed Database (One Time Only)

```powershell
cd backend
$env:MONGODB_URI='mongodb+srv://mfhomnnea_db_user:9YbEo2xUdIIhZZPD@cluster0.lidyutu.mongodb.net/sales_management?retryWrites=true&w=majority'
$env:JWT_SECRET='your_super_secret_jwt_key_here_change_in_production'
$env:JWT_EXPIRE='24h'
npm run seed
```

## ✅ Verify It's Working

1. Backend should show: `Server running in development mode on port 5001`
2. Frontend should show: `Local: http://localhost:5173/`
3. Open browser to http://localhost:5173
4. You should see the login page

## 🛑 Stopping the Servers

Press `Ctrl + C` in each terminal window to stop the servers.

## ⚠️ Common Issues

### Port Already in Use
If you get "port already in use" error:
```powershell
# Kill process on port 5001 (backend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5001).OwningProcess | Stop-Process -Force

# Kill process on port 5173 (frontend)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process -Force
```

### MongoDB Connection Error
- Make sure your MongoDB Atlas connection string is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Verify network connectivity

### Module Not Found
- Make sure you ran `npm install` in both backend and frontend folders
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## 🎯 Quick Commands Summary

```powershell
# Start Backend
cd backend
npm run dev

# Start Frontend (in new terminal)
cd frontend
npm run dev

# Seed Database (one time)
cd backend
npm run seed
```

