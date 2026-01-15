import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dailySalesRoutes from './routes/dailySalesRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import companyCashRoutes from './routes/companyCashRoutes.js';
import { mockDailySales, mockTotals } from './temdata.js';

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Request logging
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/daily-sales-history', dailySalesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/company-cash', companyCashRoutes);

// Temporary mock endpoints (for UI testing)
app.get('/api/mock/daily-sales-history', (req, res) => {
  const products = ['chips', 'flavors', 'pellets', 'proteinChips', 'proteinBars'];
  const weights = [0.35, 0.2, 0.18, 0.17, 0.1];

  const itemsWithProducts = (mockDailySales || []).map((row) => {
    const totalSales = Number(row?.totalSales) || 0;
    const totalInvoices = Number(row?.numberOfInvoices) || 0;

    const perProduct = products.reduce((acc, key, idx) => {
      const input = row?.products?.[key];
      const fallbackCashRevenue = Math.round(totalSales * weights[idx] * 100) / 100;
      const fallbackInvoices = Math.round(totalInvoices * weights[idx]);

      // Supported shapes:
      // - row.products[key] = number (interpreted as cashRevenue)
      // - row.products[key] = { cashRevenue, invoices, expenses }
      if (typeof input === 'number') {
        acc[key] = { cashRevenue: input, invoices: fallbackInvoices, expenses: 0 };
        return acc;
      }

      if (input && typeof input === 'object') {
        acc[key] = {
          cashRevenue: Number(input.cashRevenue) || 0,
          invoices: Number(input.invoices) || 0,
          expenses: Number(input.expenses) || 0,
        };
        return acc;
      }

      acc[key] = { cashRevenue: fallbackCashRevenue, invoices: fallbackInvoices, expenses: 0 };
      return acc;
    }, {});

    return {
      ...row,
      products: perProduct,
    };
  });

  res.json({ items: itemsWithProducts, totals: mockTotals });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

