import mongoose from 'mongoose';

const dailySalesSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: [true, 'Date is required'],
      index: true,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
    },
    enteredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Product Sales Data
    products: {
      chips: {
        invoices: { type: Number, default: 0, min: 0 },
        cashRevenue: { type: Number, default: 0, min: 0 },
        expenses: { type: Number, default: 0, min: 0 },
      },
      flavors: {
        invoices: { type: Number, default: 0, min: 0 },
        cashRevenue: { type: Number, default: 0, min: 0 },
        expenses: { type: Number, default: 0, min: 0 },
      },
      pellets: {
        invoices: { type: Number, default: 0, min: 0 },
        cashRevenue: { type: Number, default: 0, min: 0 },
        expenses: { type: Number, default: 0, min: 0 },
      },
      proteinChips: {
        invoices: { type: Number, default: 0, min: 0 },
        cashRevenue: { type: Number, default: 0, min: 0 },
        expenses: { type: Number, default: 0, min: 0 },
      },
      proteinBars: {
        invoices: { type: Number, default: 0, min: 0 },
        cashRevenue: { type: Number, default: 0, min: 0 },
        expenses: { type: Number, default: 0, min: 0 },
      },
    },
    // Direct Factory Costs
    directCosts: {
      directLabor: { type: Number, default: 0, min: 0 },
      indirectLabor: { type: Number, default: 0, min: 0 },
      heatAndPower: { type: Number, default: 0, min: 0 },
      factoryCommissions: { type: Number, default: 0, min: 0 },
      miscFactoryCosts: { type: Number, default: 0, min: 0 },
      contractLabor: { type: Number, default: 0, min: 0 },
      freight: { type: Number, default: 0, min: 0 },
      rawMaterials: { type: Number, default: 0, min: 0 },
    },
    // Payments Received
    paymentsReceived: {
      chips: { type: Number, default: 0, min: 0 },
      flavors: { type: Number, default: 0, min: 0 },
      pellets: { type: Number, default: 0, min: 0 },
    },
    // Expenses
    expenses: {
      marketing: { type: Number, default: 0, min: 0 },
      vehicles: { type: Number, default: 0, min: 0 },
      advancePurchases: { type: Number, default: 0, min: 0 },
      charitable: { type: Number, default: 0, min: 0 },
      machinesSpares: { type: Number, default: 0, min: 0 },
    },
    // Calculated Fields
    totalInvoices: { type: Number, default: 0 },
    totalCashRevenue: { type: Number, default: 0 },
    totalDirectCosts: { type: Number, default: 0 },
    totalExpenses: { type: Number, default: 0 },
    lastModifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate entries for same date
dailySalesSchema.index({ date: 1 }, { unique: true });

// Pre-save hook to calculate totals
dailySalesSchema.pre('save', function (next) {
  // Calculate total invoices
  this.totalInvoices =
    this.products.chips.invoices +
    this.products.flavors.invoices +
    this.products.pellets.invoices +
    this.products.proteinChips.invoices +
    this.products.proteinBars.invoices;

  // Calculate total cash revenue
  this.totalCashRevenue =
    this.products.chips.cashRevenue +
    this.products.flavors.cashRevenue +
    this.products.pellets.cashRevenue +
    this.products.proteinChips.cashRevenue +
    this.products.proteinBars.cashRevenue;

  // Calculate total direct costs
  this.totalDirectCosts =
    this.directCosts.directLabor +
    this.directCosts.indirectLabor +
    this.directCosts.heatAndPower +
    this.directCosts.factoryCommissions +
    this.directCosts.miscFactoryCosts +
    this.directCosts.contractLabor +
    this.directCosts.freight +
    this.directCosts.rawMaterials;

  // Calculate total expenses
  this.totalExpenses =
    this.products.chips.expenses +
    this.products.flavors.expenses +
    this.products.pellets.expenses +
    this.products.proteinChips.expenses +
    this.products.proteinBars.expenses +
    this.expenses.marketing +
    this.expenses.vehicles +
    this.expenses.advancePurchases +
    this.expenses.charitable +
    this.expenses.machinesSpares;

  // Extract month and year from date if not set
  if (this.date) {
    this.month = this.date.getMonth() + 1;
    this.year = this.date.getFullYear();
  }

  next();
});

const DailySales = mongoose.model('DailySales', dailySalesSchema);

export default DailySales;

