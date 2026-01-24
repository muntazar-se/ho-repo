import mongoose from 'mongoose';

const companyCashSchema = new mongoose.Schema(
  {
    cashByProduct: {
      chips: { type: Number, default: 0 },
      flavors: { type: Number, default: 0 },
      pellets: { type: Number, default: 0 },
      thalgy: { type: Number, default: 0 },
    },
    otherIncome: { type: Number, default: 0 },
    totalCompanyCash: { type: Number, default: 0 },
    overallDebit: { type: Number, default: 0 },
    overallRiskFactor: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

// Pre-save hook to calculate total company cash
companyCashSchema.pre('save', function (next) {
  this.totalCompanyCash =
    this.cashByProduct.chips +
    this.cashByProduct.flavors +
    this.cashByProduct.pellets +
    this.cashByProduct.thalgy +
    (Number(this.otherIncome) || 0);
  this.lastUpdated = new Date();
  next();
});

const CompanyCash = mongoose.model('CompanyCash', companyCashSchema);

export default CompanyCash;

