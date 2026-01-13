import CompanyCash from '../models/CompanyCash.js';

// @desc    Get current company cash position
// @route   GET /api/company-cash
// @access  Private/Manager, Admin
export const getCompanyCash = async (req, res) => {
  try {
    let companyCash = await CompanyCash.findOne();

    if (!companyCash) {
      // Initialize if doesn't exist
      companyCash = await CompanyCash.create({
        cashByProduct: {
          chips: 0,
          flavors: 0,
          pellets: 0,
          thalgy: 0,
        },
        totalCompanyCash: 0,
        overallDebit: 0,
        overallRiskFactor: 0,
      });
    }

    res.json(companyCash);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get cash position history
// @route   GET /api/company-cash/history
// @access  Private/Manager, Admin
export const getCashHistory = async (req, res) => {
  try {
    // In a production system, you'd maintain a history collection
    // For now, we'll return current state with last updated
    const companyCash = await CompanyCash.findOne();

    if (!companyCash) {
      return res.json([]);
    }

    res.json([
      {
        ...companyCash.toObject(),
        timestamp: companyCash.lastUpdated,
      },
    ]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

