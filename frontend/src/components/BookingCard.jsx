import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Bed, Users, CreditCard, AlertCircle, ArrowRight } from 'lucide-react';

const BookingCard = ({ booking, onCancelBooking, onViewDetails }) => {
  if (!booking) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="sg-badge sg-badge-success">Confirmed</span>;
      case 'Pending':
        return <span className="sg-badge sg-badge-warning">Pending</span>;
      case 'Cancelled':
        return <span className="sg-badge sg-badge-danger">Cancelled</span>;
      case 'Completed':
        return <span className="sg-badge sg-badge-primary">Completed</span>;
      default:
        return <span className="sg-badge bg-secondary text-white">{status}</span>;
    }
  };

  const getPaymentBadge = (status) => {
    switch (status) {
      case 'Paid':
        return <span className="sg-badge sg-badge-success">Paid</span>;
      case 'Pending':
        return <span className="sg-badge sg-badge-warning">Unpaid</span>;
      case 'Refunded':
        return <span className="sg-badge sg-badge-info">Refunded</span>;
      case 'Failed':
        return <span className="sg-badge sg-badge-danger">Failed</span>;
      default:
        return <span className="sg-badge bg-light text-dark">{status}</span>;
    }
  };

  const canCancel =
    booking.bookingStatus === 'Confirmed' || booking.bookingStatus === 'Pending';

  const defaultImg = '/images/hostels/hostel-1/building.jpg';
  const coverImg =
    booking.hostel?.images && booking.hostel.images.length > 0
      ? booking.hostel.images[0]
      : defaultImg;

  return (
    <div className="card sg-card border-0 overflow-hidden mb-3">
      <div className="row g-0">
        {/* Hostel Thumbnail */}
        <div className="col-md-3 position-relative">
          <img
            src={coverImg}
            alt={booking.hostel?.name || 'Hostel'}
            className="w-100 h-100 object-fit-cover"
            style={{ minHeight: '160px' }}
          />
          <div className="position-absolute top-0 start-0 m-2">
            {getStatusBadge(booking.bookingStatus)}
          </div>
        </div>

        {/* Booking Details */}
        <div className="col-md-9 p-3 p-md-4 d-flex flex-column justify-content-between">
          <div>
            {/* Top row: Reference ID & Payment badge */}
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-2">
              <span className="text-muted small fw-medium">
                Ref #{booking._id.toString().substring(0, 10).toUpperCase()}
              </span>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small">Payment:</span>
                {getPaymentBadge(booking.paymentStatus)}
              </div>
            </div>

            {/* Hostel Title & City */}
            <h5 className="fw-bold text-dark mb-1">
              <Link to={`/hostels/${booking.hostel?._id}`} className="text-dark hover-text-primary text-decoration-none">
                {booking.hostel?.name || 'Hostel Booking'}
              </Link>
            </h5>
            <div className="d-flex align-items-center gap-1 text-muted small mb-3">
              <MapPin size={14} className="text-primary" />
              <span>{booking.hostel?.location?.city || 'India'}</span>
            </div>

            {/* Stay info Grid */}
            <div className="row g-2 p-2.5 rounded-3 bg-light text-secondary mb-3 small">
              <div className="col-sm-4 col-6">
                <div className="d-flex align-items-center gap-1 text-muted">
                  <Calendar size={14} />
                  <span>Check-In:</span>
                </div>
                <div className="fw-bold text-dark">{formatDate(booking.checkIn)}</div>
              </div>
              <div className="col-sm-4 col-6">
                <div className="d-flex align-items-center gap-1 text-muted">
                  <Calendar size={14} />
                  <span>Check-Out:</span>
                </div>
                <div className="fw-bold text-dark">{formatDate(booking.checkOut)}</div>
              </div>
              <div className="col-sm-4 col-12">
                <div className="d-flex align-items-center gap-1 text-muted">
                  <Bed size={14} />
                  <span>Room:</span>
                </div>
                <div className="fw-bold text-dark text-truncate">
                  {booking.room?.roomType || 'Dorm Bed'} ({booking.guests} {booking.guests > 1 ? 'Guests' : 'Guest'})
                </div>
              </div>
            </div>
          </div>

          {/* Bottom row: Total Amount and Actions */}
          <div className="d-flex flex-wrap align-items-center justify-content-between pt-2 border-top gap-2">
            <div>
              <span className="text-muted small d-block">Total Paid / Due</span>
              <span className="fs-5 fw-bold text-primary">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
            </div>

            <div className="d-flex align-items-center gap-2">
              <Link
                to={`/booking-confirmation/${booking._id}`}
                className="btn btn-outline-primary btn-sm rounded-pill px-3 fw-semibold"
              >
                Receipt
              </Link>

              {canCancel && onCancelBooking && (
                <button
                  type="button"
                  onClick={() => onCancelBooking(booking)}
                  className="btn btn-outline-danger btn-sm rounded-pill px-3 fw-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCard;
