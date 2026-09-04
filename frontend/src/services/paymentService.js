import API from './api';

export const createRazorpayOrder = async (bookingId) => {
  const response = await API.post('/payments/create-order', { bookingId });
  return response.data;
};

export const verifyRazorpayPayment = async (paymentData) => {
  const response = await API.post('/payments/verify', paymentData);
  return response.data;
};

export const getOwnerPayments = async () => {
  const response = await API.get('/payments/owner/all');
  return response.data;
};

export default {
  createRazorpayOrder,
  verifyRazorpayPayment,
  getOwnerPayments,
};
