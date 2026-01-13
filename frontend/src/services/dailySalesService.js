import api from './api.js';

export const dailySalesService = {
  create: async (data) => {
    const response = await api.post('/daily-sales', data);
    return response.data;
  },

  getMock: async () => {
    const response = await api.get('/mock/daily-sales');
    return response.data;
  },

  getAll: async (params = {}) => {
    const response = await api.get('/daily-sales', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/daily-sales/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/daily-sales/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/daily-sales/${id}`);
    return response.data;
  },

  getByDate: async (date) => {
    const response = await api.get(`/daily-sales/date/${date}`);
    return response.data;
  },

  getByMonth: async (year, month) => {
    const response = await api.get(`/daily-sales/month/${year}/${month}`);
    return response.data;
  },
};

