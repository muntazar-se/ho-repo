import DailySales from '../models/DailySales.js';
import MonthlySummary from '../models/MonthlySummary.js';
import CompanyCash from '../models/CompanyCash.js';
import { USER_ROLES } from '../config/constants.js';

// Helper function to update monthly summary
const updateMonthlySummary = async (dailySales) => {
  const { month, year } = dailySales;

  // Aggregate all daily sales for this month
  const monthlyData = await DailySales.aggregate([
    {
      $match: {
        month: month,
        year: year,
      },
    },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: '$totalInvoices' },
        totalCashRevenue: { $sum: '$totalCashRevenue' },
        totalDirectCosts: { $sum: '$totalDirectCosts' },
        totalExpenses: { $sum: '$totalExpenses' },
        chipsInvoices: { $sum: '$products.chips.invoices' },
        chipsRevenue: {
          $sum: { $add: ['$products.chips.invoices', '$products.chips.cashRevenue'] },
        },
        flavorsInvoices: { $sum: '$products.flavors.invoices' },
        flavorsRevenue: {
          $sum: {
            $add: ['$products.flavors.invoices', '$products.flavors.cashRevenue'],
          },
        },
        pelletsInvoices: { $sum: '$products.pellets.invoices' },
        pelletsRevenue: {
          $sum: { $add: ['$products.pellets.invoices', '$products.pellets.cashRevenue'] },
        },
        proteinChipsInvoices: { $sum: '$products.proteinChips.invoices' },
        proteinChipsRevenue: {
          $sum: {
            $add: ['$products.proteinChips.invoices', '$products.proteinChips.cashRevenue'],
          },
        },
        proteinBarsInvoices: { $sum: '$products.proteinBars.invoices' },
        proteinBarsRevenue: {
          $sum: {
            $add: ['$products.proteinBars.invoices', '$products.proteinBars.cashRevenue'],
          },
        },
        chipsPayments: { $sum: '$paymentsReceived.chips' },
        flavorsPayments: { $sum: '$paymentsReceived.flavors' },
        pelletsPayments: { $sum: '$paymentsReceived.pellets' },
      },
    },
  ]);

  if (monthlyData.length === 0) {
    // No data for this month yet
    return;
  }

  const data = monthlyData[0];

  // Calculate cash by product (simplified - in production, track daily)
  let companyCash = await CompanyCash.findOne();
  if (!companyCash) {
    companyCash = await CompanyCash.create({});
  }

  // Update monthly summary
  await MonthlySummary.findOneAndUpdate(
    { month, year },
    {
      month,
      year,
      products: {
        chips: {
          totalInvoices: data.chipsInvoices || 0,
          totalRevenue: data.chipsRevenue || 0,
        },
        flavors: {
          totalInvoices: data.flavorsInvoices || 0,
          totalRevenue: data.flavorsRevenue || 0,
        },
        pellets: {
          totalInvoices: data.pelletsInvoices || 0,
          totalRevenue: data.pelletsRevenue || 0,
        },
        proteinChips: {
          totalInvoices: data.proteinChipsInvoices || 0,
          totalRevenue: data.proteinChipsRevenue || 0,
        },
        proteinBars: {
          totalInvoices: data.proteinBarsInvoices || 0,
          totalRevenue: data.proteinBarsRevenue || 0,
        },
      },
      totalMonthlyRevenue: data.totalCashRevenue || 0,
      totalMonthlyInvoices: data.totalInvoices || 0,
      totalDirectCosts: data.totalDirectCosts || 0,
      totalExpenses: data.totalExpenses || 0,
      cashByProduct: companyCash.cashByProduct,
      totalCash: companyCash.totalCompanyCash,
      updatedAt: new Date(),
    },
    { upsert: true, new: true }
  );
};

// Helper function to update company cash
const updateCompanyCash = async (dailySales) => {
  let companyCash = await CompanyCash.findOne();

  if (!companyCash) {
    companyCash = await CompanyCash.create({});
  }

  // Calculate revenue for products with payments
  const chipsRevenue =
    dailySales.products.chips.invoices + dailySales.products.chips.cashRevenue;
  const flavorsRevenue =
    dailySales.products.flavors.invoices + dailySales.products.flavors.cashRevenue;
  const pelletsRevenue =
    dailySales.products.pellets.invoices + dailySales.products.pellets.cashRevenue;

  // Update cash by product
  companyCash.cashByProduct.chips +=
    chipsRevenue - dailySales.totalDirectCosts / 3 + dailySales.paymentsReceived.chips;
  companyCash.cashByProduct.flavors +=
    flavorsRevenue - dailySales.totalDirectCosts / 3 + dailySales.paymentsReceived.flavors;
  companyCash.cashByProduct.pellets +=
    pelletsRevenue - dailySales.totalDirectCosts / 3 + dailySales.paymentsReceived.pellets;

  // Calculate overall debit
  const overallDebit =
    dailySales.totalCashRevenue - dailySales.totalDirectCosts - dailySales.totalExpenses;

  companyCash.overallDebit += overallDebit;

  await companyCash.save();
};

// @desc    Create daily sales entry
// @route   POST /api/daily-sales-history
// @access  Private/DataEntry, Admin
export const createDailySales = async (req, res) => {
  try {
    const date = new Date(req.body.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Extract year and month from the date
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // getMonth() is 0-indexed

    // Check if user is dataEntry - can only enter for today
    if (req.user.role === USER_ROLES.DATA_ENTRY) {
      const entryDate = new Date(date);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() !== today.getTime()) {
        return res.status(403).json({
          message: 'Data entry employees can only enter data for the current day',
        });
      }
    }

    // Check if entry already exists for this date
    const existingEntry = await DailySales.findOne({ date });

    if (existingEntry) {
      return res.status(400).json({
        message: 'Daily sales entry already exists for this date',
      });
    }

    // Check if date is in future
    if (date > new Date()) {
      return res.status(400).json({ message: 'Cannot enter data for future dates' });
    }

    const dailySales = await DailySales.create({
      ...req.body,
      date,
      year,
      month,
      enteredBy: req.user._id,
      lastModifiedBy: req.user._id,
    });

    // Update monthly summary and company cash
    await updateMonthlySummary(dailySales);
    await updateCompanyCash(dailySales);

    res.status(201).json(dailySales);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: 'Daily sales entry already exists for this date',
      });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all daily sales
// @route   GET /api/daily-sales-history
// @access  Private
export const getDailySales = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = {};

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // If dataEntry, only show today's entries
    if (req.user.role === USER_ROLES.DATA_ENTRY) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.date = { $gte: today, $lt: tomorrow };
    }

    const dailySales = await DailySales.find(query)
      .populate('enteredBy', 'username fullName')
      .populate('lastModifiedBy', 'username fullName')
      .sort({ date: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await DailySales.countDocuments(query);

    res.json({
      dailySales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily sales by ID
// @route   GET /api/daily-sales-history/:id
// @access  Private
export const getDailySalesById = async (req, res) => {
  try {
    const dailySales = await DailySales.findById(req.params.id)
      .populate('enteredBy', 'username fullName')
      .populate('lastModifiedBy', 'username fullName');

    if (!dailySales) {
      return res.status(404).json({ message: 'Daily sales entry not found' });
    }

    res.json(dailySales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update daily sales
// @route   PUT /api/daily-sales-history/:id
// @access  Private/DataEntry, Admin
export const updateDailySales = async (req, res) => {
  try {
    const dailySales = await DailySales.findById(req.params.id);

    if (!dailySales) {
      return res.status(404).json({ message: 'Daily sales entry not found' });
    }

    // Check permissions - dataEntry can only edit today's entries
    if (req.user.role === USER_ROLES.DATA_ENTRY) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const entryDate = new Date(dailySales.date);
      entryDate.setHours(0, 0, 0, 0);

      if (entryDate.getTime() !== today.getTime()) {
        return res.status(403).json({
          message: 'Data entry employees can only edit today\'s entries',
        });
      }

      // Check if user created this entry
      if (dailySales.enteredBy.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          message: 'You can only edit your own entries',
        });
      }
    }

    // Update fields
    Object.keys(req.body).forEach((key) => {
      if (key !== 'date' && key !== '_id' && key !== 'enteredBy') {
        dailySales[key] = req.body[key];
      }
    });

    dailySales.lastModifiedBy = req.user._id;

    const updatedDailySales = await dailySales.save();

    // Update monthly summary and company cash
    await updateMonthlySummary(updatedDailySales);
    await updateCompanyCash(updatedDailySales);

    res.json(updatedDailySales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete daily sales
// @route   DELETE /api/daily-sales-history/:id
// @access  Private/Admin
export const deleteDailySales = async (req, res) => {
  try {
    const dailySales = await DailySales.findById(req.params.id);

    if (!dailySales) {
      return res.status(404).json({ message: 'Daily sales entry not found' });
    }

    await dailySales.deleteOne();

    // Recalculate monthly summary
    await updateMonthlySummary(dailySales);

    res.json({ message: 'Daily sales entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily sales by date
// @route   GET /api/daily-sales-history/date/:date
// @access  Private
export const getDailySalesByDate = async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);

    const dailySales = await DailySales.findOne({ date }).populate(
      'enteredBy',
      'username fullName'
    );

    if (!dailySales) {
      return res.status(404).json({ message: 'No entry found for this date' });
    }

    res.json(dailySales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get daily sales by month
// @route   GET /api/daily-sales-history/month/:year/:month
// @access  Private
export const getDailySalesByMonth = async (req, res) => {
  try {
    const { year, month } = req.params;

    const dailySales = await DailySales.find({
      year: parseInt(year),
      month: parseInt(month),
    })
      .populate('enteredBy', 'username fullName')
      .sort({ date: 1 });

    res.json(dailySales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

