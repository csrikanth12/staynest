import API from './api';

export const login = async (email, password) => {
  const response = await API.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await API.post('/auth/register', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await API.get('/auth/me');
  return response.data;
};

export const updateProfile = async (profileData) => {
  const response = await API.put('/auth/profile', profileData);
  return response.data;
};

export const getAllCustomers = async () => {
  const response = await API.get('/auth/users');
  return response.data;
};

export default {
  login,
  register,
  getMe,
  updateProfile,
  getAllCustomers,
};
