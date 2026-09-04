import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import BookingCard from '../../components/BookingCard';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import {
  CalendarCheck,
  CalendarX,
  Building,
  Compass,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, upcoming, completed, cancelled

  // Cancellation Modal State
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getUserBookings();
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Error fetching user bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    setCancelling(true);
    try {
      const res = await bookingService.cancelBooking(selectedBookingToCancel._id);
      if (res.success) {
        setCancelMessage('Your booking has been cancelled successfully.');
        // Refresh bookings
        await fetchBookings();
        setTimeout(() => {
          setSelectedBookingToCancel(null);
          setCancelMessage('');
        }, 1500);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  // Filter bookings based on activeTab
  const filteredBookings = bookings.filter((b) => {
    const now = new Date();
    const checkOut = new Date(b.checkOut);

    if (activeTab === 'upcoming') {
      return b.bookingStatus === 'Confirmed' && checkOut >= now;
    }
    if (activeTab === 'completed') {
      return b.bookingStatus === 'Completed' || (b.bookingStatus === 'Confirmed' && checkOut < now);
    }
    if (activeTab === 'cancelled') {
      return b.bookingStatus === 'Cancelled';
    }
    return true;
  });

  return (
    <div className="my-bookings-page bg-light py-5 min-vh-100">
      <div className="container">
        <BackButton fallback="/" />

        {/* Page Header */}
        <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-4 gap-3">
          <div>
            <span className="text-primary fw-bold small text-uppercase tracking-wider">Account</span>
            <h2 className="fw-bold text-dark mb-1">My Hostel Bookings</h2>
            <p className="text-muted small mb-0">View all your reservations, vouchers, and stay history</p>
          </div>

          <Link to="/explore" className="btn btn-stayguard rounded-pill px-4">
            <Compass size={16} />
            <span>Explore Hostels</span>
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="d-flex gap-2 border-bottom pb-2 mb-4 overflow-x-auto">
          {[
            { id: 'all', label: 'All Bookings', count: bookings.length },
            {
              id: 'upcoming',
              label: 'Upcoming Stays',
              count: bookings.filter((b) => b.bookingStatus === 'Confirmed').length,
            },
            {
              id: 'completed',
              label: 'Past Stays',
              count: bookings.filter((b) => b.bookingStatus === 'Completed').length,
            },
            {
              id: 'cancelled',
              label: 'Cancelled',
              count: bookings.filter((b) => b.bookingStatus === 'Cancelled').length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold d-flex align-items-center gap-1.5 text-nowrap ${
                activeTab === tab.id
                  ? 'btn-primary'
                  : 'btn-white bg-white text-secondary border'
              }`}
            >
              <span>{tab.label}</span>
              <span className="badge bg-light text-dark rounded-pill">{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content View */}
        {loading ? (
          <Loader message="Loading your bookings..." />
        ) : filteredBookings.length === 0 ? (
          <div className="bg-white rounded-4 border p-5 text-center shadow-sm">
            <CalendarX size={52} className="text-muted opacity-40 mb-3" />
            <h4 className="fw-bold text-dark mb-2">No bookings found</h4>
            <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '400px' }}>
              You don't have any bookings matching this category. Start planning your next trip today!
            </p>
            <Link to="/explore" className="btn btn-stayguard rounded-pill px-4">
              Search & Book a Hostel
            </Link>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancelBooking={(b) => setSelectedBookingToCancel(b)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {selectedBookingToCancel && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 p-4">
              <div className="text-center mb-3">
                <div className="d-inline-flex p-3 rounded-circle bg-danger bg-opacity-10 text-danger mb-2">
                  <AlertTriangle size={32} />
                </div>
                <h5 className="modal-title fw-bold text-dark">Cancel Reservation?</h5>
                <p className="text-muted small">
                  Are you sure you want to cancel your stay at{' '}
                  <strong>{selectedBookingToCancel.hostel?.name}</strong>?
                </p>
              </div>

              {cancelMessage && (
                <div className="alert alert-success py-2 small text-center">{cancelMessage}</div>
              )}

              <div className="p-3 bg-light rounded-3 mb-4 small text-secondary">
                <div>
                  <strong>Amount:</strong> ₹{selectedBookingToCancel.totalAmount?.toLocaleString('en-IN')}
                </div>
                <div>
                  <strong>Policy:</strong> Full refund processed automatically to original payment method.
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-light rounded-pill px-3"
                  onClick={() => setSelectedBookingToCancel(null)}
                  disabled={cancelling}
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="btn btn-danger rounded-pill px-4 fw-bold"
                  disabled={cancelling}
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
