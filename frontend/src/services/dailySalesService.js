import api from './api.js';

export const dailySalesService = {
  create: async (data) => {
    const response = await api.post('/daily-sales-history', data);
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/daily-sales-history', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/daily-sales-history/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/daily-sales-history/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/daily-sales-history/${id}`);
    return response.data;
  },

  getByDate: async (date) => {
    const response = await api.get(`/daily-sales-history/date/${date}`);
    return response.data;
  },

  getByMonth: async (year, month) => {
    const response = await api.get(`/daily-sales-history/month/${year}/${month}`);
    return response.data;
  },
};

