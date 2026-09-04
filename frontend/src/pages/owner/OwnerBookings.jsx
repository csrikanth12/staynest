import React, { useState, useEffect } from 'react';
import bookingService from '../../services/bookingService';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import OwnerFilterPanel from '../../components/OwnerFilterPanel';
import {
  CalendarCheck,
  Search,
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Bed,
  Users,
  CreditCard,
  X,
  Phone,
  Mail,
} from 'lucide-react';

const OwnerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Details Modal State
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await bookingService.getOwnerBookings({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchKeyword || undefined,
      });
      if (res.success && res.data) {
        setBookings(res.data);
      }
    } catch (err) {
      console.error('Error fetching owner bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBookings();
  };

  const handleUpdateStatus = async (bookingId, newBookingStatus, newPaymentStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await bookingService.updateBookingStatus(bookingId, {
        bookingStatus: newBookingStatus,
        paymentStatus: newPaymentStatus,
      });
      if (res.success) {
        // Update local state
        setBookings((prev) =>
          prev.map((b) => (b._id === bookingId ? { ...b, ...res.data } : b))
        );
        if (selectedBooking && selectedBooking._id === bookingId) {
          setSelectedBooking((prev) => ({ ...prev, ...res.data }));
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update booking status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dStr) => {
    if (!dStr) return '';
    return new Date(dStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="owner-bookings-page pb-5">
      <BackButton />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Booking Management</h2>
          <p className="text-muted small mb-0">Track, confirm, and update guest reservations across all properties</p>
        </div>
      </div>

      {/* Enhanced Scrollable Filter Panel with Sticky Actions */}
      <OwnerFilterPanel
        title="Filter Bookings"
        subtitle="Filter by reservation status, payment state, and keywords"
        activeCount={(statusFilter !== 'all' ? 1 : 0) + (searchKeyword ? 1 : 0)}
        onClear={() => {
          setStatusFilter('all');
          setSearchKeyword('');
        }}
        onApply={() => fetchBookings()}
      >
        <div className="row g-3">
          {/* Booking Status Options */}
          <div className="col-12 col-md-7">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Booking Status
            </label>
            <div className="owner-filter-pills">
              {['all', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                    statusFilter === status
                      ? 'btn-primary'
                      : 'btn-light border text-secondary'
                  }`}
                >
                  {status === 'all' ? 'All Bookings' : status}
                </button>
              ))}
            </div>
          </div>

          {/* Search Keyword */}
          <div className="col-12 col-md-5">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Search Keywords
            </label>
            <form onSubmit={handleSearchSubmit}>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <Search size={16} />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm bg-light"
                  placeholder="Search customer, hostel, booking ID..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>
      </OwnerFilterPanel>

      {/* Bookings Table */}
      <div className="bg-white rounded-4 border shadow-sm overflow-hidden">
        {loading ? (
          <Loader message="Loading bookings..." />
        ) : bookings.length === 0 ? (
          <div className="p-5 text-center text-muted">
            <CalendarCheck size={48} className="text-muted opacity-40 mb-3" />
            <h5 className="fw-bold text-dark mb-1">No bookings match this filter</h5>
            <p className="small mb-0">Try clearing the status filter or keyword search.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 sg-table">
              <thead>
                <tr>
                  <th>Booking ID</th>
                  <th>Customer</th>
                  <th>Hostel</th>
                  <th>Room</th>
                  <th>Dates</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <span className="fw-bold text-dark small">
                        #{booking._id.toString().substring(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark small">
                        {booking.customer?.name || booking.guestDetails?.name || 'Guest'}
                      </div>
                      <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                        {booking.customer?.email || booking.guestDetails?.email}
                      </div>
                    </td>
                    <td className="small text-dark fw-medium">{booking.hostel?.name}</td>
                    <td className="small text-muted">{booking.room?.roomType}</td>
                    <td className="small text-muted">
                      {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                    </td>
                    <td>
                      <span className="fw-bold text-primary small">
                        ₹{booking.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`sg-badge ${
                          booking.paymentStatus === 'Paid'
                            ? 'sg-badge-success'
                            : booking.paymentStatus === 'Refunded'
                            ? 'sg-badge-info'
                            : booking.paymentStatus === 'Failed'
                            ? 'sg-badge-danger'
                            : 'sg-badge-warning'
                        }`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`sg-badge ${
                          booking.bookingStatus === 'Confirmed'
                            ? 'sg-badge-success'
                            : booking.bookingStatus === 'Completed'
                            ? 'sg-badge-primary'
                            : booking.bookingStatus === 'Cancelled'
                            ? 'sg-badge-danger'
                            : 'sg-badge-warning'
                        }`}
                      >
                        {booking.bookingStatus}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="d-flex align-items-center justify-content-end gap-1.5">
                        <button
                          type="button"
                          className="btn btn-light btn-sm border rounded-pill px-2.5 py-1 text-primary d-flex align-items-center gap-1"
                          onClick={() => setSelectedBooking(booking)}
                          title="View Details"
                        >
                          <Eye size={14} />
                          <span className="d-none d-sm-inline small">View</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detailed Booking Modal */}
      {selectedBooking && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 p-4">
              {/* Header */}
              <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                <div>
                  <h5 className="modal-title fw-bold text-dark mb-0">
                    Booking #{selectedBooking._id.toString().substring(0, 10).toUpperCase()}
                  </h5>
                  <small className="text-muted">
                    Booked on {new Date(selectedBooking.createdAt).toLocaleString('en-IN')}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setSelectedBooking(null)}
                />
              </div>

              {/* Guest & Property Grid */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 className="fw-bold text-dark mb-2">Guest Contact</h6>
                    <div className="fw-bold text-dark">{selectedBooking.guestDetails?.name || selectedBooking.customer?.name}</div>
                    <div className="d-flex align-items-center gap-1.5 text-muted small mt-1">
                      <Mail size={13} className="text-primary" />
                      <span>{selectedBooking.guestDetails?.email || selectedBooking.customer?.email}</span>
                    </div>
                    <div className="d-flex align-items-center gap-1.5 text-muted small mt-1">
                      <Phone size={13} className="text-primary" />
                      <span>{selectedBooking.guestDetails?.phone || selectedBooking.customer?.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="p-3 bg-light rounded-3 h-100">
                    <h6 className="fw-bold text-dark mb-2">Hostel & Room</h6>
                    <div className="fw-bold text-dark">{selectedBooking.hostel?.name}</div>
                    <div className="text-muted small">{selectedBooking.room?.roomType} (Room #{selectedBooking.room?.roomNumber})</div>
                    <div className="text-muted small mt-1">
                      <strong>Guests:</strong> {selectedBooking.guests} | <strong>Nights:</strong> {selectedBooking.nights}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates & Payment */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <span className="text-muted small d-block">Dates:</span>
                  <div className="fw-bold text-dark">
                    {formatDate(selectedBooking.checkIn)} → {formatDate(selectedBooking.checkOut)}
                  </div>
                </div>
                <div className="col-md-6">
                  <span className="text-muted small d-block">Total Settlement Amount:</span>
                  <div className="fs-5 fw-extrabold text-primary">
                    ₹{selectedBooking.totalAmount?.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className="p-3 bg-warning-subtle rounded-3 mb-4 text-warning-emphasis small">
                  <strong>Guest Note:</strong> "{selectedBooking.specialRequests}"
                </div>
              )}

              {/* Status Update Controls */}
              <div className="p-3 border rounded-3 bg-light mb-4">
                <h6 className="fw-bold text-dark mb-2">Update Booking & Payment Status</h6>
                <div className="row g-2 align-items-center">
                  <div className="col-sm-6">
                    <label className="form-label small text-muted mb-1">Reservation Status</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedBooking.bookingStatus}
                      disabled={updatingStatus}
                      onChange={(e) =>
                        handleUpdateStatus(selectedBooking._id, e.target.value, selectedBooking.paymentStatus)
                      }
                    >
                      <option value="Confirmed">Confirmed</option>
                      <option value="Pending">Pending</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className="col-sm-6">
                    <label className="form-label small text-muted mb-1">Payment Status</label>
                    <select
                      className="form-select form-select-sm"
                      value={selectedBooking.paymentStatus}
                      disabled={updatingStatus}
                      onChange={(e) =>
                        handleUpdateStatus(selectedBooking._id, selectedBooking.bookingStatus, e.target.value)
                      }
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Refunded">Refunded</option>
                      <option value="Failed">Failed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary rounded-pill px-4"
                  onClick={() => setSelectedBooking(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerBookings;
