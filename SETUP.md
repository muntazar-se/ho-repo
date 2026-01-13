# Setup Instructions

## Git Repository Setup

To connect this project to the GitHub repository, run the following commands:

```bash
# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/muntazar-se/ho-repo.git

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: MERN Stack Daily Sales Management System"

# Push to repository
git push -u origin main
```

If the repository already has content, you may need to pull first:

```bash
git pull origin main --allow-unrelated-histories
```

Then push:

```bash
git push -u origin main
```

## Installation Steps

### 1. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file with:

```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/sales_management
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=24h
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Seed the database:

```bash
npm run seed
```

Start the server:

```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file with:

```
VITE_API_URL=http://localhost:5001/api
VITE_APP_NAME=Sales Management System
```

Start the development server:

```bash
npm run dev
```

## Default Login Credentials

After seeding:

- **Admin**: admin / Admin@123
- **Manager**: manager1 / Manager@123
- **Data Entry**: dataentry1 / Data@123

## Notes

- Make sure MongoDB is running before starting the backend
- The backend runs on port 5001
- The frontend runs on port 5173
- All passwords should be changed in production

