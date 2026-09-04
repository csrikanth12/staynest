import API from './api';

const notificationService = {
  // Get all user notifications
  getNotifications: async () => {
    const response = await API.get('/notifications');
    return response.data;
  },

  // Mark single notification as read
  markAsRead: async (id) => {
    const response = await API.put(`/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await API.put('/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id) => {
    const response = await API.delete(`/notifications/${id}`);
    return response.data;
  },
};

export default notificationService;
