# MERN Stack Daily Sales Management System

A complete MERN stack web application for daily sales management with role-based access control. The system tracks daily sales across multiple product lines with automatic calculations for cash flow, monthly reports, and risk analysis.

## Tech Stack

- **Frontend**: React 18+ with React Router v6, Vite
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens) with bcrypt
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **Date Handling**: date-fns

## Features

### User Roles

1. **Admin**
   - Full system access
   - User management (create, update, delete users)
   - View all reports and analytics

2. **Manager**
   - View-only access to all reports
   - Dashboard with key metrics
   - Monthly and annual reports
   - Cash position tracking
   - Product performance analysis
   - Risk factor analysis

3. **Data Entry Employee**
   - Access to daily data entry form only
   - Enter daily sales data
   - View own submitted entries (current day only)

## Installation

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
PORT=5001
MONGODB_URI=mongodb://localhost:27017/sales_management
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=24h
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

4. Seed the database with initial users:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run dev
```

The backend API will be available at `http://localhost:5001`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:5001/api
VITE_APP_NAME=Sales Management System
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Default Users

After running the seed script, you can login with:

**Admin:**
- Username: `admin`
- Password: `Admin@123`

**Manager:**
- Username: `manager1`
- Password: `Manager@123`

**Data Entry:**
- Username: `dataentry1`
- Password: `Data@123`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (admin only)
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/change-password` - Change password

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/toggle-active` - Toggle user active status

### Daily Sales
- `POST /api/daily-sales` - Create daily sales entry
- `GET /api/daily-sales` - Get all daily sales (with filtering)
- `GET /api/daily-sales/:id` - Get specific entry
- `PUT /api/daily-sales/:id` - Update entry
- `DELETE /api/daily-sales/:id` - Delete entry (admin only)
- `GET /api/daily-sales/date/:date` - Get sales for specific date
- `GET /api/daily-sales/month/:year/:month` - Get sales for month

### Reports (Manager, Admin)
- `GET /api/reports/dashboard` - Get dashboard summary
- `GET /api/reports/monthly/:year/:month` - Get monthly report
- `GET /api/reports/annual/:year` - Get annual report
- `GET /api/reports/cash-position` - Get current cash position
- `GET /api/reports/product-performance` - Get product performance
- `GET /api/reports/risk-analysis` - Get risk analysis

## Project Structure

```
project-root/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   ├── utils/
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── README.md
```

## Development

### Running in Development Mode

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

