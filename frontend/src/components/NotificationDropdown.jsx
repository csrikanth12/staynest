import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import {
  Bell,
  CheckCheck,
  CalendarCheck,
  CreditCard,
  Star,
  Info,
  Trash2,
  ExternalLink,
} from 'lucide-react';

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'booking':
      return <CalendarCheck size={16} className="text-primary" />;
    case 'payment':
      return <CreditCard size={16} className="text-success" />;
    case 'review':
      return <Star size={16} className="text-warning" />;
    default:
      return <Info size={16} className="text-secondary" />;
  }
};

const NotificationDropdown = ({ isOwnerView = false }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail if not authenticated
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) => (n._id === notification._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark as read:', err);
      }
    }

    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      const target = notifications.find((n) => n._id === id);
      if (target && !target.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  return (
    <div className="position-relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        className={`btn btn-light position-relative p-2 rounded-circle border shadow-sm d-flex align-items-center justify-content-center ${
          isOpen ? 'bg-primary-subtle text-primary border-primary' : 'text-secondary'
        }`}
        style={{ width: '40px', height: '40px' }}
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        aria-label="View notifications"
      >
        <Bell size={19} />
        {unreadCount > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger text-white border border-white"
            style={{ fontSize: '0.65rem', padding: '0.25em 0.5em' }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="position-absolute end-0 mt-2 bg-white rounded-4 border shadow-lg overflow-hidden z-3"
          style={{
            width: '360px',
            maxWidth: '90vw',
            maxHeight: '480px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Header */}
          <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-light">
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold text-dark fs-6 mb-0">Notifications</span>
              {unreadCount > 0 && (
                <span className="badge bg-primary-subtle text-primary rounded-pill small">
                  {unreadCount} unread
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="btn btn-sm btn-link text-primary text-decoration-none p-0 d-flex align-items-center gap-1"
                style={{ fontSize: '0.78rem' }}
              >
                <CheckCheck size={14} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="overflow-y-auto flex-grow-1" style={{ maxHeight: '380px' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-5 px-3">
                <div
                  className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center p-3 text-muted mb-2"
                >
                  <Bell size={24} />
                </div>
                <p className="fw-semibold text-dark mb-1 small">No notifications yet</p>
                <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>
                  We'll notify you about bookings, payments, and updates here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 border-bottom cursor-pointer transition-all d-flex gap-3 align-items-start position-relative ${
                    !notif.isRead ? 'bg-primary-subtle bg-opacity-25' : 'bg-white hover-bg-light'
                  }`}
                  style={{
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Type Icon Badge */}
                  <div
                    className="rounded-3 p-2 d-flex align-items-center justify-content-center flex-shrink-0 shadow-sm"
                    style={{
                      backgroundColor: !notif.isRead ? '#ffffff' : '#f8fafc',
                      border: '1px solid rgba(0,0,0,0.06)',
                    }}
                  >
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-grow-1 overflow-hidden">
                    <div className="d-flex align-items-center justify-content-between gap-1 mb-0.5">
                      <span className={`small text-truncate ${!notif.isRead ? 'fw-bold text-dark' : 'fw-semibold text-secondary'}`}>
                        {notif.title}
                      </span>
                      <span className="text-muted flex-shrink-0" style={{ fontSize: '0.7rem' }}>
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p
                      className="text-muted mb-1 small text-break"
                      style={{ fontSize: '0.78rem', lineHeight: '1.35' }}
                    >
                      {notif.message}
                    </p>
                    {notif.link && (
                      <span
                        className="text-primary fw-semibold d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.72rem' }}
                      >
                        <span>View details</span>
                        <ExternalLink size={10} />
                      </span>
                    )}
                  </div>

                  {/* Actions / Delete */}
                  <div className="d-flex flex-column align-items-center gap-1">
                    {!notif.isRead && (
                      <span
                        className="rounded-circle bg-primary"
                        style={{ width: '8px', height: '8px' }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, notif._id)}
                      className="btn btn-link text-muted hover-text-danger p-0 border-0 shadow-none"
                      style={{ opacity: 0.6, fontSize: '0.7rem' }}
                      title="Delete notification"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
