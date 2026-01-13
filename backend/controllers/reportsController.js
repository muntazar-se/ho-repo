import DailySales from '../models/DailySales.js';
import MonthlySummary from '../models/MonthlySummary.js';
import CompanyCash from '../models/CompanyCash.js';
import { startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

// @desc    Get dashboard summary
// @route   GET /api/reports/dashboard
// @access  Private/Manager, Admin
export const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's sales
    const todaySales = await DailySales.findOne({ date: { $gte: today, $lt: tomorrow } });

    // MTD (Month to Date)
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const mtdData = await DailySales.aggregate([
      {
        $match: {
          date: { $gte: monthStart, $lte: monthEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalCashRevenue' },
          totalInvoices: { $sum: '$totalInvoices' },
          totalCosts: { $sum: '$totalDirectCosts' },
          totalExpenses: { $sum: '$totalExpenses' },
        },
      },
    ]);

    // YTD (Year to Date)
    const yearStart = startOfYear(new Date());
    const yearEnd = endOfYear(new Date());

    const ytdData = await DailySales.aggregate([
      {
        $match: {
          date: { $gte: yearStart, $lte: yearEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalCashRevenue' },
          totalInvoices: { $sum: '$totalInvoices' },
          totalCosts: { $sum: '$totalDirectCosts' },
          totalExpenses: { $sum: '$totalExpenses' },
        },
      },
    ]);

    // Get company cash position
    const companyCash = await CompanyCash.findOne();

    // Last 30 days trend
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const last30Days = await DailySales.find({
      date: { $gte: thirtyDaysAgo },
    })
      .select('date totalCashRevenue totalInvoices')
      .sort({ date: 1 });

    res.json({
      today: todaySales
        ? {
            totalRevenue: todaySales.totalCashRevenue,
            totalInvoices: todaySales.totalInvoices,
            totalCosts: todaySales.totalDirectCosts,
            totalExpenses: todaySales.totalExpenses,
          }
        : null,
      mtd: mtdData[0] || {
        totalRevenue: 0,
        totalInvoices: 0,
        totalCosts: 0,
        totalExpenses: 0,
      },
      ytd: ytdData[0] || {
        totalRevenue: 0,
        totalInvoices: 0,
        totalCosts: 0,
        totalExpenses: 0,
      },
      cashPosition: companyCash || {
        totalCompanyCash: 0,
        cashByProduct: {},
      },
      last30Days: last30Days,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get monthly report
// @route   GET /api/reports/monthly/:year/:month
// @access  Private/Manager, Admin
export const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.params;

    const monthlySummary = await MonthlySummary.findOne({
      year: parseInt(year),
      month: parseInt(month),
    });

    if (!monthlySummary) {
      return res.status(404).json({ message: 'Monthly report not found' });
    }

    // Get daily breakdown
    const dailySales = await DailySales.find({
      year: parseInt(year),
      month: parseInt(month),
    })
      .populate('enteredBy', 'username fullName')
      .sort({ date: 1 });

    res.json({
      summary: monthlySummary,
      dailyBreakdown: dailySales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get annual report
// @route   GET /api/reports/annual/:year
// @access  Private/Manager, Admin
export const getAnnualReport = async (req, res) => {
  try {
    const { year } = req.params;

    const monthlySummaries = await MonthlySummary.find({
      year: parseInt(year),
    }).sort({ month: 1 });

    const annualData = await DailySales.aggregate([
      {
        $match: {
          year: parseInt(year),
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalCashRevenue' },
          totalInvoices: { $sum: '$totalInvoices' },
          totalCosts: { $sum: '$totalDirectCosts' },
          totalExpenses: { $sum: '$totalExpenses' },
        },
      },
    ]);

    res.json({
      monthlySummaries,
      annualTotal: annualData[0] || {
        totalRevenue: 0,
        totalInvoices: 0,
        totalCosts: 0,
        totalExpenses: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cash position
// @route   GET /api/reports/cash-position
// @access  Private/Manager, Admin
export const getCashPosition = async (req, res) => {
  try {
    const companyCash = await CompanyCash.findOne();

    if (!companyCash) {
      return res.json({
        cashByProduct: {
          chips: 0,
          flavors: 0,
          pellets: 0,
          thalgy: 0,
        },
        totalCompanyCash: 0,
        overallDebit: 0,
        overallRiskFactor: 0,
        lastUpdated: new Date(),
      });
    }

    res.json(companyCash);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product performance
// @route   GET /api/reports/product-performance
// @access  Private/Manager, Admin
export const getProductPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchQuery = {};
    if (startDate || endDate) {
      matchQuery.date = {};
      if (startDate) matchQuery.date.$gte = new Date(startDate);
      if (endDate) matchQuery.date.$lte = new Date(endDate);
    }

    const productData = await DailySales.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          chips: {
            invoices: { $sum: '$products.chips.invoices' },
            revenue: {
              $sum: {
                $add: ['$products.chips.invoices', '$products.chips.cashRevenue'],
              },
            },
          },
          flavors: {
            invoices: { $sum: '$products.flavors.invoices' },
            revenue: {
              $sum: {
                $add: [
                  '$products.flavors.invoices',
                  '$products.flavors.cashRevenue',
                ],
              },
            },
          },
          pellets: {
            invoices: { $sum: '$products.pellets.invoices' },
            revenue: {
              $sum: {
                $add: ['$products.pellets.invoices', '$products.pellets.cashRevenue'],
              },
            },
          },
          proteinChips: {
            invoices: { $sum: '$products.proteinChips.invoices' },
            revenue: {
              $sum: {
                $add: [
                  '$products.proteinChips.invoices',
                  '$products.proteinChips.cashRevenue',
                ],
              },
            },
          },
          proteinBars: {
            invoices: { $sum: '$products.proteinBars.invoices' },
            revenue: {
              $sum: {
                $add: [
                  '$products.proteinBars.invoices',
                  '$products.proteinBars.cashRevenue',
                ],
              },
            },
          },
        },
      },
    ]);

    res.json(productData[0] || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get risk analysis
// @route   GET /api/reports/risk-analysis
// @access  Private/Manager, Admin
export const getRiskAnalysis = async (req, res) => {
  try {
    const { year, month } = req.query;

    let query = {};
    if (year && month) {
      query.year = parseInt(year);
      query.month = parseInt(month);
    }

    const monthlySummaries = await MonthlySummary.find(query).sort({
      year: -1,
      month: -1,
    });

    res.json(monthlySummaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

