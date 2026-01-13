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

export const PRODUCT_NAMES = {
  chips: 'Chips',
  flavors: 'Flavors',
  pellets: 'Pellets',
  proteinChips: 'Protein Chips',
  proteinBars: 'Protein Bars',
};

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

