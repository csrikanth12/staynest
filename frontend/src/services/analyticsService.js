import API from './api';

export const getDashboardStats = async () => {
  const response = await API.get('/analytics/dashboard');
  return response.data;
};

export const getRevenueAnalytics = async (timeframe = '30d') => {
  const response = await API.get('/analytics/revenue', { params: { timeframe } });
  return response.data;
};

export const getBookingsAnalytics = async () => {
  const response = await API.get('/analytics/bookings');
  return response.data;
};

export default {
  getDashboardStats,
  getRevenueAnalytics,
  getBookingsAnalytics,
};
