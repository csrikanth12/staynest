import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import bookingService from '../../services/bookingService';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import {
  CheckCircle,
  Calendar,
  MapPin,
  Bed,
  Users,
  CreditCard,
  Download,
  ArrowRight,
  ShieldCheck,
  Phone,
  Mail,
  Printer,
} from 'lucide-react';

const BookingConfirmation = () => {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fire confetti celebration on page load
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#10B981', '#F59E0B', '#6366F1'],
      });
    } catch (e) {
      console.warn('Confetti effect ignored:', e);
    }

    const fetchBooking = async () => {
      try {
        const res = await bookingService.getBookingById(id);
        if (res.success && res.data) {
          setBooking(res.data);
        }
      } catch (err) {
        console.error('Error fetching confirmed booking:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <Loader fullScreen message="Loading confirmation receipt..." />;
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold text-dark">Booking details unavailable</h4>
        <Link to="/my-bookings" className="btn btn-stayguard rounded-pill px-4 mt-3">
          Go to My Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="confirmation-page bg-light py-5 min-vh-100">
      <div className="container" style={{ maxWidth: '800px' }}>
        <BackButton fallback="/my-bookings" />

        {/* Success Banner Card */}
        <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle shadow-md mb-3"
            style={{ width: '70px', height: '70px' }}
          >
            <CheckCircle size={38} strokeWidth={2.5} />
          </div>

          <h2 className="fw-extrabold text-dark mb-1">Booking Confirmed!</h2>
          <p className="text-muted lead fs-6 mb-4">
            Your stay is successfully booked. A confirmation email and SMS pass have been dispatched.
          </p>

          <div className="d-inline-flex align-items-center gap-2 px-3.5 py-2 bg-light rounded-pill border mb-2">
            <span className="text-muted small fw-bold">BOOKING ID:</span>
            <span className="fw-extrabold text-primary letter-spacing-1">
              #{booking._id.toString().substring(0, 10).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Printable Pass / Receipt Card */}
        <div id="booking-receipt" className="bg-white rounded-4 border shadow-sm overflow-hidden mb-4">
          <div
            className="p-4 text-white d-flex align-items-center justify-content-between"
            style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 100%)' }}
          >
            <div>
              <div className="d-flex align-items-center gap-2">
                <ShieldCheck size={22} className="text-warning" />
                <span className="fw-bold fs-5 tracking-tight">STAYGUARD PASS</span>
              </div>
              <small className="text-light text-opacity-80">Official Guest Reservation Voucher</small>
            </div>
            <div className="text-end">
              <span className="badge bg-success px-3 py-1.5 rounded-pill text-white fw-bold">
                PAID & CONFIRMED
              </span>
            </div>
          </div>

          <div className="p-4 p-md-5">
            {/* Hostel Info */}
            <div className="d-flex flex-column flex-sm-row gap-3 mb-4 pb-4 border-bottom">
              <img
                src={
                  booking.hostel?.images?.[0] ||
                  '/images/hostels/hostel-1/building.jpg'
                }
                alt={booking.hostel?.name}
                className="rounded-3 object-fit-cover"
                style={{ width: '100px', height: '100px' }}
              />
              <div>
                <h4 className="fw-bold text-dark mb-1">{booking.hostel?.name}</h4>
                <div className="d-flex align-items-center gap-1 text-muted small mb-2">
                  <MapPin size={15} className="text-primary flex-shrink-0" />
                  <span>
                    {booking.hostel?.location?.address}, {booking.hostel?.location?.city}, {booking.hostel?.location?.state}
                  </span>
                </div>
                <div className="d-flex flex-wrap gap-3 text-secondary small">
                  <div className="d-flex align-items-center gap-1">
                    <Phone size={13} className="text-primary" />
                    <span>{booking.hostel?.contactInfo?.phone || '+91 98450 12345'}</span>
                  </div>
                  <div className="d-flex align-items-center gap-1">
                    <Mail size={13} className="text-primary" />
                    <span>{booking.hostel?.contactInfo?.email || 'help@stayguard.com'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stay Details Grid */}
            <div className="row g-3 mb-4 pb-4 border-bottom">
              <div className="col-sm-6 col-md-3">
                <span className="text-muted small d-block mb-1">Check-in Date</span>
                <div className="fw-bold text-dark">{formatDate(booking.checkIn)}</div>
                <small className="text-muted">From 1:00 PM</small>
              </div>

              <div className="col-sm-6 col-md-3">
                <span className="text-muted small d-block mb-1">Check-out Date</span>
                <div className="fw-bold text-dark">{formatDate(booking.checkOut)}</div>
                <small className="text-muted">Until 11:00 AM</small>
              </div>

              <div className="col-sm-6 col-md-3">
                <span className="text-muted small d-block mb-1">Room & Bed</span>
                <div className="fw-bold text-dark">{booking.room?.roomType}</div>
                <small className="text-muted">Room #{booking.room?.roomNumber || '101'}</small>
              </div>

              <div className="col-sm-6 col-md-3">
                <span className="text-muted small d-block mb-1">Guests & Stay</span>
                <div className="fw-bold text-dark">
                  {booking.guests} {booking.guests > 1 ? 'Guests' : 'Guest'}
                </div>
                <small className="text-muted">{booking.nights} Nights Stay</small>
              </div>
            </div>

            {/* Guest & Payment Summary Grid */}
            <div className="row g-4 mb-4">
              <div className="col-md-6">
                <h6 className="fw-bold text-dark mb-2">Guest Information</h6>
                <div className="p-3 bg-light rounded-3 text-secondary small">
                  <div className="fw-bold text-dark">{booking.guestDetails?.name || booking.customer?.name}</div>
                  <div>{booking.guestDetails?.email || booking.customer?.email}</div>
                  <div>{booking.guestDetails?.phone || booking.customer?.phone}</div>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="fw-bold text-dark mb-2">Payment Details</h6>
                <div className="p-3 bg-light rounded-3 text-secondary small">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Payment Mode:</span>
                    <span className="fw-bold text-dark">{booking.payment?.method || 'UPI / Razorpay Test'}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>Payment ID:</span>
                    <span className="fw-bold text-dark">{booking.payment?.paymentId || 'PAY_RZP_TEST'}</span>
                  </div>
                  <div className="d-flex justify-content-between pt-1 border-top mt-1">
                    <span className="fw-bold text-dark">Total Amount Paid:</span>
                    <span className="fw-bold text-primary fs-6">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="p-3 rounded-3 bg-light text-muted small">
              <strong>Check-in Reminder:</strong> Please present a valid Government ID card (Aadhaar / Driving License / Passport) at the reception desk during arrival.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="btn btn-outline-secondary rounded-pill px-4 fw-semibold d-flex align-items-center gap-2 w-100 w-sm-auto justify-content-center"
          >
            <Printer size={16} />
            <span>Download / Print Receipt</span>
          </button>

          <div className="d-flex gap-2 w-100 w-sm-auto flex-wrap justify-content-end">
            <Link
              to="/customer/dashboard"
              className="btn btn-outline-primary rounded-pill px-4 fw-semibold"
            >
              Go to Dashboard
            </Link>
            <Link
              to="/my-bookings"
              className="btn btn-stayguard rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
            >
              <span>View Booking</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
