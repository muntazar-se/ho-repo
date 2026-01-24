import mongoose from 'mongoose';

const ALLOWED_EXPENSE_FIELDS = [
  'direct_factory_costs',
  'direct_labour_cost',
  'indirect_labour_cost',
  'contract_labour',
  'heat_and_power',
  'commissions_factory',
  'misc_factory_costs',
  'freight',
  'freight_costs',
  'raw_materials_purchased',
  'product_cost',
  'marketing_expense',
  'vehicle_expenses',
  'travel_exp',
  'travel_transportation_exp',
  'transportion',
  'gas_oil',
  'gifts_expenses',
  'maintenance_expense',
  'office_supplies_expenses',
  'communication_expenses',
  'rent_or_lease_expense',
  'office_expenses',
  'utilities',
  'internet',
  'stationery',
  'salaries',
  'wages',
  'daily_allowance',
  'incentive',
  'rewarding',
  'machines_spares',
  'machines_puffs',
  'machines_pellets',
  'machines',
  'spares',
  'other_machines_equipment',
  'furniture',
  'automatic_swing_door',
  'legal_fee',
  'consulting',
  'other_service',
  'soft_wear',
  'bank_fee',
  'tax_paid',
  'exchange_gain_loss',
  'loan_benefits',
  'dividends',
  'advance_purchases_clearance',
  'charitable_contributions',
  'hospitality',
  'public_relations',
  'other_assets',
  'orgflavors_to_ho',
  'pellets_to_ho',
  'to_flavors',
  'to_sanitizers',
  'flavors',
];

const sumExpenseObject = (expenses) => {
  if (!expenses) return 0;
  if (typeof expenses === 'number') return Number(expenses) || 0;

  const values = expenses instanceof Map ? Array.from(expenses.values()) : Object.values(expenses);
  return values.reduce((sum, v) => sum + (Number(v) || 0), 0);
};

const normalizeExpenseObject = (expenses) => {
  if (!expenses || typeof expenses === 'number') return {};
  const obj = expenses instanceof Map ? Object.fromEntries(expenses.entries()) : expenses;

  return Object.fromEntries(
    Object.entries(obj)
      .filter(([k]) => ALLOWED_EXPENSE_FIELDS.includes(k))
      .map(([k, v]) => [k, Number(v) || 0])
      .filter(([, v]) => v > 0)
  );
};

const productSchema = new mongoose.Schema(
  {
    invoices: { type: Number, default: 0, min: 0 },
    cashRevenue: { type: Number, default: 0, min: 0 },
    sales: { type: Number, default: 0, min: 0 },
    expenses: { type: Map, of: Number, default: {} },
    expensesTotal: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

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
      chips: { type: productSchema, default: () => ({}) },
      flavors: { type: productSchema, default: () => ({}) },
      pellets: { type: productSchema, default: () => ({}) },
      proteinChips: { type: productSchema, default: () => ({}) },
      proteinBars: { type: productSchema, default: () => ({}) },
      thalgy: { type: productSchema, default: () => ({}) },
      macaroni: { type: productSchema, default: () => ({}) },
      drinks: { type: productSchema, default: () => ({}) },
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
    miscIncome: { type: Number, default: 0 },
    miscIncomeNote: { type: String, default: '' },
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
  const productEntries = this.products ? Object.values(this.products) : [];

  // Normalize and compute per-product totals
  productEntries.forEach((p) => {
    const legacyNumericExpenses = typeof p?.expenses === 'number' ? Number(p.expenses) || 0 : 0;
    const normalizedExpenses = normalizeExpenseObject(p?.expenses);
    p.expenses = normalizedExpenses;
    p.expensesTotal = sumExpenseObject(normalizedExpenses) + legacyNumericExpenses;
  });

  // Calculate total invoices
  this.totalInvoices = productEntries.reduce((sum, p) => sum + (Number(p?.invoices) || 0), 0);

  // Calculate total cash revenue (cash sales)
  this.totalCashRevenue = productEntries.reduce((sum, p) => {
    const sales = Number(p?.sales) || 0;
    const cashRevenue = Number(p?.cashRevenue) || 0;
    return sum + (sales > 0 ? sales : cashRevenue);
  }, 0);

  // Calculate total direct costs
  const directCosts = this.directCosts || {};
  this.totalDirectCosts =
    (Number(directCosts.directLabor) || 0) +
    (Number(directCosts.indirectLabor) || 0) +
    (Number(directCosts.heatAndPower) || 0) +
    (Number(directCosts.factoryCommissions) || 0) +
    (Number(directCosts.miscFactoryCosts) || 0) +
    (Number(directCosts.contractLabor) || 0) +
    (Number(directCosts.freight) || 0) +
    (Number(directCosts.rawMaterials) || 0);

  // Calculate total expenses
  const legacyGlobalExpenses = this.expenses
    ? Object.values(this.expenses).reduce((sum, v) => sum + (Number(v) || 0), 0)
    : 0;

  this.totalExpenses =
    productEntries.reduce((sum, p) => sum + (Number(p?.expensesTotal) || 0), 0) + legacyGlobalExpenses;

  // Extract month and year from date if not set
  if (this.date) {
    this.month = this.date.getMonth() + 1;
    this.year = this.date.getFullYear();
  }

  next();
});

const DailySales = mongoose.model('DailySales', dailySalesSchema);

export default DailySales;

