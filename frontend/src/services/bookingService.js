import API from './api';

export const createBooking = async (bookingData) => {
  const response = await API.post('/bookings', bookingData);
  return response.data;
};

export const getUserBookings = async () => {
  const response = await API.get('/bookings');
  return response.data;
};

export const getBookingById = async (id) => {
  const response = await API.get(`/bookings/${id}`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await API.put(`/bookings/${id}/cancel`);
  return response.data;
};

export const getOwnerBookings = async (params = {}) => {
  const response = await API.get('/bookings/owner/all', { params });
  return response.data;
};

export const updateBookingStatus = async (id, statusData) => {
  const response = await API.put(`/bookings/${id}/status`, statusData);
  return response.data;
};

export default {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getOwnerBookings,
  updateBookingStatus,
};
