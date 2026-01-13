# Login Credentials

After running the seed script (`npm run seed` in the backend directory), the following users will be created:

## Admin User
- **Username:** `admin`
- **Email:** `admin@company.com`
- **Password:** `Admin@123`
- **Role:** Admin
- **Access:** Full system access, user management, all reports

## Manager User
- **Username:** `manager1`
- **Email:** `manager@company.com`
- **Password:** `Manager@123`
- **Role:** Manager
- **Access:** View-only access to all reports, dashboards, and analytics

## Data Entry User
- **Username:** `dataentry1`
- **Email:** `dataentry@company.com`
- **Password:** `Data@123`
- **Role:** Data Entry
- **Access:** Daily data entry form only, view own entries for today

---

**⚠️ Important:** Make sure MongoDB is running before seeding the database!

**To start MongoDB:**
- Windows: Usually runs as a service or use `mongod` command
- Or use MongoDB Atlas (cloud) and update the MONGODB_URI in the .env file

