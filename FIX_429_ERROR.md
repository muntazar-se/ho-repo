# 🔧 Fix for 429 Error (Too Many Requests)

## Problem
You're getting a 429 error because the rate limiter was set to only 5 login attempts per minute.

## Solution Applied
I've increased the rate limit from **5 requests/minute** to **100 requests/minute** for development.

## What Changed
- **Before:** 5 login attempts per minute
- **After:** 100 login attempts per minute

## Next Steps

### 1. Restart Backend Server
The changes need the backend to be restarted:

**Stop the current backend** (Ctrl+C in the terminal where it's running), then:

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

### 2. Wait 1 Minute
If you just hit the rate limit, wait 1 minute for it to reset, or restart the backend (which clears the rate limit).

### 3. Try Login Again
- Username: `admin`
- Password: `Admin@123`

## Alternative: Disable Rate Limiting in Development

If you still have issues, you can completely disable rate limiting in development by setting:

```javascript
// In backend/routes/authRoutes.js, change authLimiter to:
const authLimiter = process.env.NODE_ENV === 'production' 
  ? rateLimit({...}) 
  : (req, res, next) => next(); // Skip rate limiting in dev
```

But the current fix (100 requests/min) should be enough!

