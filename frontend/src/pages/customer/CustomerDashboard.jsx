import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import bookingService from '../../services/bookingService';
import hostelService from '../../services/hostelService';
import BookingCard from '../../components/BookingCard';
import HostelCard from '../../components/HostelCard';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import {
  CalendarCheck,
  CalendarX,
  Heart,
  User,
  Compass,
  Building,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Luggage,
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [savedHostels, setSavedHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, saved, profile

  // Cancellation Modal State
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelMessage, setCancelMessage] = useState('');

  const fetchData = async () => {
    try {
      // 1. Fetch user bookings
      const bookRes = await bookingService.getUserBookings();
      if (bookRes.success && bookRes.data) {
        setBookings(bookRes.data);
      }

      // 2. Fetch wishlist saved hostels
      const wishlistIds = JSON.parse(localStorage.getItem('sg_wishlist') || '[]');
      if (wishlistIds.length > 0) {
        const allHostelsRes = await hostelService.getAllHostels();
        if (allHostelsRes.success && allHostelsRes.data) {
          const matched = allHostelsRes.data.filter((h) => wishlistIds.includes(h._id));
          setSavedHostels(matched);
        }
      } else {
        setSavedHostels([]);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;
    setCancelling(true);
    try {
      const res = await bookingService.cancelBooking(selectedBookingToCancel._id);
      if (res.success) {
        setCancelMessage('Your booking has been cancelled successfully.');
        await fetchData();
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

  const now = new Date();
  const upcomingBookings = bookings.filter(
    (b) => b.bookingStatus === 'Confirmed' && new Date(b.checkOut) >= now
  );
  const pastBookings = bookings.filter(
    (b) => b.bookingStatus === 'Completed' || (b.bookingStatus === 'Confirmed' && new Date(b.checkOut) < now) || b.bookingStatus === 'Cancelled'
  );

  return (
    <div className="customer-dashboard-page bg-light py-5 min-vh-100">
      <div className="container">
        <BackButton fallback="/" />

        {/* Welcome Header */}
        <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm mb-4">
          <div className="row g-3 align-items-center justify-content-between">
            <div className="col-md-7">
              <div className="d-flex align-items-center gap-3">
                <img
                  src={
                    user?.profileImage ||
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
                  }
                  alt={user?.name}
                  className="rounded-circle object-fit-cover shadow-sm border border-2 border-primary"
                  style={{ width: '64px', height: '64px' }}
                />
                <div>
                  <span className="badge bg-primary text-white rounded-pill px-2.5 py-1 small mb-1">
                    Verified Traveler
                  </span>
                  <h2 className="fw-bold text-dark mb-0">Welcome back, {user?.name || 'Traveler'}!</h2>
                  <p className="text-muted small mb-0">{user?.email}</p>
                </div>
              </div>
            </div>

            <div className="col-md-5 d-flex gap-2 justify-content-md-end">
              <Link to="/explore" className="btn btn-stayguard rounded-pill px-4">
                <Compass size={16} />
                <span>Explore Hostels</span>
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="row g-3 mt-3 pt-3 border-top">
            <div className="col-4">
              <div className="p-3 bg-light rounded-3 text-center">
                <span className="fs-4 fw-bold text-primary d-block">{upcomingBookings.length}</span>
                <span className="text-muted small fw-semibold">Upcoming Stays</span>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 bg-light rounded-3 text-center">
                <span className="fs-4 fw-bold text-dark d-block">{bookings.length}</span>
                <span className="text-muted small fw-semibold">Total Trips</span>
              </div>
            </div>
            <div className="col-4">
              <div className="p-3 bg-light rounded-3 text-center">
                <span className="fs-4 fw-bold text-danger d-block">{savedHostels.length}</span>
                <span className="text-muted small fw-semibold">Saved Stays</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="d-flex gap-2 border-bottom pb-2 mb-4 overflow-x-auto">
          {[
            { id: 'upcoming', label: 'Upcoming Bookings', count: upcomingBookings.length, icon: CalendarCheck },
            { id: 'past', label: 'Previous Bookings', count: pastBookings.length, icon: Luggage },
            { id: 'saved', label: 'Saved Hostels (Wishlist)', count: savedHostels.length, icon: Heart },
            { id: 'profile', label: 'Profile Settings', icon: User },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`btn btn-sm rounded-pill px-3.5 py-2 fw-semibold d-flex align-items-center gap-2 text-nowrap ${
                  activeTab === tab.id
                    ? 'btn-primary shadow-sm'
                    : 'btn-white bg-white text-secondary border shadow-none'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="badge bg-light text-dark rounded-pill">{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Tab Content */}
        {loading ? (
          <Loader message="Loading your dashboard..." />
        ) : (
          <>
            {/* 1. Upcoming Bookings */}
            {activeTab === 'upcoming' && (
              <div>
                {upcomingBookings.length === 0 ? (
                  <div className="bg-white rounded-4 border p-5 text-center shadow-sm">
                    <CalendarX size={52} className="text-muted opacity-40 mb-3" />
                    <h4 className="fw-bold text-dark mb-2">No upcoming bookings</h4>
                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '420px' }}>
                      You don't have any upcoming reservations. Discover verified stays in top cities like Hyderabad, Goa, or Bangalore!
                    </p>
                    <Link to="/explore" className="btn btn-stayguard rounded-pill px-4">
                      Book a Stay Now
                    </Link>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {upcomingBookings.map((booking) => (
                      <BookingCard
                        key={booking._id}
                        booking={booking}
                        onCancelBooking={(b) => setSelectedBookingToCancel(b)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Previous Bookings */}
            {activeTab === 'past' && (
              <div>
                {pastBookings.length === 0 ? (
                  <div className="bg-white rounded-4 border p-5 text-center shadow-sm">
                    <Luggage size={52} className="text-muted opacity-40 mb-3" />
                    <h4 className="fw-bold text-dark mb-2">No past booking records</h4>
                    <p className="text-muted mb-0">Your completed and cancelled trip history will appear here.</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    {pastBookings.map((booking) => (
                      <BookingCard
                        key={booking._id}
                        booking={booking}
                        onCancelBooking={(b) => setSelectedBookingToCancel(b)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 3. Saved Hostels (Wishlist) */}
            {activeTab === 'saved' && (
              <div>
                {savedHostels.length === 0 ? (
                  <div className="bg-white rounded-4 border p-5 text-center shadow-sm">
                    <Heart size={52} className="text-muted opacity-40 mb-3" />
                    <h4 className="fw-bold text-dark mb-2">No saved hostels yet</h4>
                    <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '420px' }}>
                      Click the heart icon on any hostel card while exploring to save properties for your upcoming trips.
                    </p>
                    <Link to="/explore" className="btn btn-stayguard rounded-pill px-4">
                      Explore Hostels
                    </Link>
                  </div>
                ) : (
                  <div>
                    {/* Comparison Banner */}
                    <div className="bg-white p-3 rounded-4 border shadow-sm mb-4 d-flex align-items-center justify-content-between">
                      <div>
                        <h5 className="fw-bold text-dark mb-0">Your Wishlist ({savedHostels.length} Stays)</h5>
                        <small className="text-muted">Compare prices and amenities across saved properties</small>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm rounded-pill px-3"
                        onClick={() => {
                          localStorage.removeItem('sg_wishlist');
                          setSavedHostels([]);
                        }}
                      >
                        Clear Wishlist
                      </button>
                    </div>

                    <div className="row g-4 mb-4">
                      {savedHostels.map((hostel) => (
                        <div className="col-12 col-md-6 col-lg-4" key={hostel._id}>
                          <HostelCard hostel={hostel} />
                        </div>
                      ))}
                    </div>

                    {/* Side-by-Side Comparison Table */}
                    {savedHostels.length > 1 && (
                      <div className="bg-white p-4 rounded-4 border shadow-sm">
                        <h5 className="fw-bold text-dark mb-3">Compare Saved Hostels</h5>
                        <div className="table-responsive">
                          <table className="table table-bordered align-middle small mb-0">
                            <thead className="table-light">
                              <tr>
                                <th scope="col">Hostel</th>
                                <th scope="col">City</th>
                                <th scope="col">Rating</th>
                                <th scope="col">Starting Price</th>
                                <th scope="col">Top Amenities</th>
                                <th scope="col">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {savedHostels.map((h) => (
                                <tr key={h._id}>
                                  <td className="fw-bold text-dark">{h.name}</td>
                                  <td>{h.location?.city}</td>
                                  <td>
                                    <span className="badge bg-success text-white">★ {h.rating || 4.7}</span>
                                  </td>
                                  <td className="fw-bold text-primary">₹{(h.startingPrice || 1200).toLocaleString('en-IN')}/nt</td>
                                  <td>{h.amenities?.slice(0, 3).join(' • ')}</td>
                                  <td>
                                    <Link to={`/hostels/${h._id}`} className="btn btn-stayguard btn-sm rounded-pill px-3">
                                      Book
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. Profile Quick View */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-4 border p-4 p-md-5 shadow-sm" style={{ maxWidth: '640px' }}>
                <h4 className="fw-bold text-dark mb-4">Account Information</h4>
                <div className="d-flex flex-column gap-3 mb-4">
                  <div className="p-3 bg-light rounded-3">
                    <small className="text-muted d-block">Full Name</small>
                    <span className="fw-bold text-dark">{user?.name}</span>
                  </div>
                  <div className="p-3 bg-light rounded-3">
                    <small className="text-muted d-block">Email Address</small>
                    <span className="fw-bold text-dark">{user?.email}</span>
                  </div>
                  <div className="p-3 bg-light rounded-3">
                    <small className="text-muted d-block">Phone Number</small>
                    <span className="fw-bold text-dark">{user?.phone || 'Not provided'}</span>
                  </div>
                  <div className="p-3 bg-light rounded-3">
                    <small className="text-muted d-block">Account Role</small>
                    <span className="fw-bold text-primary text-capitalize">{user?.role}</span>
                  </div>
                </div>

                <Link to="/profile" className="btn btn-outline-primary rounded-pill px-4 fw-bold">
                  Edit Full Profile & Password
                </Link>
              </div>
            )}
          </>
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

export default CustomerDashboard;
