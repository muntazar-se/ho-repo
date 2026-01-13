import api from './api.js';

export const reportsService = {
  getDashboard: async () => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  getMonthlyReport: async (year, month) => {
    const response = await api.get(`/reports/monthly/${year}/${month}`);
    return response.data;
  },

  getAnnualReport: async (year) => {
    const response = await api.get(`/reports/annual/${year}`);
    return response.data;
  },

  getCashPosition: async () => {
    const response = await api.get('/reports/cash-position');
    return response.data;
  },

  getProductPerformance: async (params = {}) => {
    const response = await api.get('/reports/product-performance', { params });
    return response.data;
  },

  getRiskAnalysis: async (params = {}) => {
    const response = await api.get('/reports/risk-analysis', { params });
    return response.data;
  },
};

