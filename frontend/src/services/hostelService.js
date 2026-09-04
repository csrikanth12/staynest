import API from './api';

export const getAllHostels = async (params = {}) => {
  const response = await API.get('/hostels', { params });
  return response.data;
};

export const getHostelById = async (id) => {
  const response = await API.get(`/hostels/${id}`);
  return response.data;
};

export const getOwnerHostels = async () => {
  const response = await API.get('/hostels/owner/my-hostels');
  return response.data;
};

export const createHostel = async (hostelData) => {
  const response = await API.post('/hostels', hostelData);
  return response.data;
};

export const updateHostel = async (id, hostelData) => {
  const response = await API.put(`/hostels/${id}`, hostelData);
  return response.data;
};

export const deleteHostel = async (id) => {
  const response = await API.delete(`/hostels/${id}`);
  return response.data;
};

export const getRooms = async (params = {}) => {
  const response = await API.get('/rooms', { params });
  return response.data;
};

export const createRoom = async (roomData) => {
  const response = await API.post('/rooms', roomData);
  return response.data;
};

export const updateRoom = async (id, roomData) => {
  const response = await API.put(`/rooms/${id}`, roomData);
  return response.data;
};

export const deleteRoom = async (id) => {
  const response = await API.delete(`/rooms/${id}`);
  return response.data;
};

export default {
  getAllHostels,
  getHostelById,
  getOwnerHostels,
  createHostel,
  updateHostel,
  deleteHostel,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
};
