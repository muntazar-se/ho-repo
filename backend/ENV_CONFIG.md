# Backend Environment Configuration

Create a `.env` file in the `backend` directory with the following content:

```
PORT=5001
MONGODB_URI=mongodb+srv://mfhomnnea_db_user:9YbEo2xUdIIhZZPD@cluster0.lidyutu.mongodb.net/sales_management?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=24h
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

This file has been created automatically when running the project. If you need to recreate it manually, copy the content above.

