// Utility functions for calculations

export const calculateCashPosition = (previousCash, todayRevenue, todayDirectCosts, todayExpenses, paymentsReceived) => {
  return previousCash + todayRevenue - todayDirectCosts - todayExpenses + paymentsReceived;
};

export const calculateRiskFactor = (actual, projected) => {
  if (!projected || projected === 0) return 0;
  const variancePercent = ((actual - projected) / projected) * 100;
  return Math.abs(variancePercent);
};

export const calculateVariance = (actual, projected) => {
  return actual - projected;
};

export const calculateVariancePercent = (actual, projected) => {
  if (!projected || projected === 0) return 0;
  return ((actual - projected) / projected) * 100;
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

