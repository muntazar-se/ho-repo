import mongoose from 'mongoose';

const monthlySummarySchema = new mongoose.Schema(
  {
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    // Aggregated Monthly Data
    products: {
      chips: {
        totalInvoices: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
      },
      flavors: {
        totalInvoices: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
      },
      pellets: {
        totalInvoices: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
      },
      proteinChips: {
        totalInvoices: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
      },
      proteinBars: {
        totalInvoices: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
      },
    },
    totalMonthlyRevenue: { type: Number, default: 0 },
    totalMonthlyInvoices: { type: Number, default: 0 },
    totalDirectCosts: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    // Cash Position
    cashByProduct: {
      chips: { type: Number, default: 0 },
      flavors: { type: Number, default: 0 },
      pellets: { type: Number, default: 0 },
    },
    totalCash: { type: Number, default: 0 },
    // Risk Analysis
    projectedVsActual: {
      chips: {
        projected: { type: Number, default: 0 },
        actual: { type: Number, default: 0 },
        variance: { type: Number, default: 0 },
        variancePercent: { type: Number, default: 0 },
      },
      flavors: {
        projected: { type: Number, default: 0 },
        actual: { type: Number, default: 0 },
        variance: { type: Number, default: 0 },
        variancePercent: { type: Number, default: 0 },
      },
      pellets: {
        projected: { type: Number, default: 0 },
        actual: { type: Number, default: 0 },
        variance: { type: Number, default: 0 },
        variancePercent: { type: Number, default: 0 },
      },
      proteinChips: {
        projected: { type: Number, default: 0 },
        actual: { type: Number, default: 0 },
        variance: { type: Number, default: 0 },
        variancePercent: { type: Number, default: 0 },
      },
      proteinBars: {
        projected: { type: Number, default: 0 },
        actual: { type: Number, default: 0 },
        variance: { type: Number, default: 0 },
        variancePercent: { type: Number, default: 0 },
      },
    },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// Compound index to ensure one summary per month/year
monthlySummarySchema.index({ month: 1, year: 1 }, { unique: true });

const MonthlySummary = mongoose.model('MonthlySummary', monthlySummarySchema);

export default MonthlySummary;

