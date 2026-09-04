import API from './api';

export const getHostelReviews = async (hostelId) => {
  const response = await API.get(`/reviews/hostel/${hostelId}`);
  return response.data;
};

export const addReview = async (reviewData) => {
  const response = await API.post('/reviews', reviewData);
  return response.data;
};

export const getOwnerReviews = async () => {
  const response = await API.get('/reviews/owner/all');
  return response.data;
};

export const replyToReview = async (reviewId, reply) => {
  const response = await API.put(`/reviews/${reviewId}/reply`, { reply });
  return response.data;
};

export default {
  getHostelReviews,
  addReview,
  getOwnerReviews,
  replyToReview,
};
