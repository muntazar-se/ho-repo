export const USER_ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  DATA_ENTRY: 'dataEntry',
};

export const PRODUCTS = {
  CHIPS: 'chips',
  ORG_FLAVORS: 'flavors',
  PELLETS: 'pellets',
  PROTEIN_CHIPS: 'proteinChips',
  PROTEIN_BARS: 'proteinBars',
};

export const PRODUCTS_WITH_PAYMENTS = ['chips', 'flavors', 'pellets'];

export const RATE_LIMITS = {
  AUTH: {
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute (increased for development)
  },
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
  },
};

