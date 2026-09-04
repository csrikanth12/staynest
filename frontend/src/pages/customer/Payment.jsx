import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import bookingService from '../../services/bookingService';
import paymentService from '../../services/paymentService';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import { useAuth } from '../../context/AuthContext';
import {
  CreditCard,
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Calendar,
  Bed,
  ArrowRight,
  Smartphone,
} from 'lucide-react';

const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('upi');

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await bookingService.getBookingById(bookingId);
        if (res.success && res.data) {
          setBooking(res.data);
          if (res.data.paymentStatus === 'Paid') {
            navigate(`/booking-confirmation/${bookingId}`);
          }
        }
      } catch (err) {
        console.error('Error fetching booking for payment:', err);
        setError('Could not retrieve booking details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId, navigate]);

  const handleRazorpayCheckout = async () => {
    setProcessing(true);
    setError('');

    try {
      // 1. Create order on backend
      const orderRes = await paymentService.createRazorpayOrder(bookingId);

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Could not initiate payment order');
      }

      const { orderId, amount, currency, keyId } = orderRes.data;

      // 2. Check if Razorpay script is loaded in window
      if (window.Razorpay && !orderId.startsWith('order_test_')) {
        const options = {
          key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_stayguard12345',
          amount: amount * 100,
          currency: currency || 'INR',
          name: 'STAYGUARD Hostels',
          description: `Booking #${booking._id.toString().substring(0, 8)} - ${booking.hostel.name}`,
          image: '/images/hostels/hostel-1/building.jpg',
          order_id: orderId,
          handler: async function (response) {
            try {
              // Verify on backend
              const verifyRes = await paymentService.verifyRazorpayPayment({
                bookingId: booking._id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                paymentMethod: 'Razorpay UPI / Card',
              });

              if (verifyRes.success) {
                navigate(`/booking-confirmation/${booking._id}`);
              }
            } catch (vErr) {
              setError('Payment verification failed on server.');
              setProcessing(false);
            }
          },
          prefill: {
            name: booking.guestDetails?.name || user?.name || '',
            email: booking.guestDetails?.email || user?.email || '',
            contact: booking.guestDetails?.phone || user?.phone || '',
          },
          theme: {
            color: '#4F46E5',
          },
          modal: {
            ondismiss: function () {
              setProcessing(false);
            },
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (resp) {
          setError(`Payment Failed: ${resp.error.description}`);
          setProcessing(false);
        });
        rzp.open();
      } else {
        // Direct seamless Test Mode simulation (handles local dev & mock keys flawlessly)
        const mockPaymentId = `pay_test_${Date.now()}`;
        const verifyRes = await paymentService.verifyRazorpayPayment({
          bookingId: booking._id,
          razorpay_order_id: orderId,
          razorpay_payment_id: mockPaymentId,
          razorpay_signature: 'test_signature_mock',
          paymentMethod: selectedMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' : selectedMethod === 'card' ? 'Credit/Debit Card (Test)' : 'Net Banking (Test)',
        });

        if (verifyRes.success) {
          navigate(`/booking-confirmation/${booking._id}`);
        }
      }
    } catch (err) {
      console.error('Payment execution error:', err);
      setError(err.message || 'Payment processing error');
      setProcessing(false);
    }
  };

  if (loading) {
    return <Loader fullScreen message="Loading secure payment gateway..." />;
  }

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold text-dark">Invalid Booking Reference</h4>
        <Link to="/explore" className="btn btn-stayguard rounded-pill px-4 mt-3">
          Explore Hostels
        </Link>
      </div>
    );
  }

  return (
    <div className="payment-page bg-light py-5 min-vh-100">
      <div className="container">
        <BackButton fallback="/my-bookings" />

        {/* Step Indicator */}
        <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-2 fw-semibold text-success">
            <span className="badge bg-success text-white rounded-circle p-2" style={{ width: '28px', height: '28px' }}>
              ✓
            </span>
            <span>Guest Info</span>
          </div>
          <div style={{ width: '40px', height: '2px', backgroundColor: 'var(--primary)' }} />
          <div className="d-flex align-items-center gap-2 text-primary fw-bold">
            <span className="badge bg-primary text-white rounded-circle p-2" style={{ width: '28px', height: '28px' }}>
              2
            </span>
            <span>Payment</span>
          </div>
          <div style={{ width: '40px', height: '2px', backgroundColor: '#cbd5e1' }} />
          <div className="d-flex align-items-center gap-2 text-muted fw-semibold">
            <span className="badge bg-secondary bg-opacity-25 text-secondary rounded-circle p-2" style={{ width: '28px', height: '28px' }}>
              3
            </span>
            <span>Confirmation</span>
          </div>
        </div>

        <div className="row g-4">
          {/* Left Column: Payment Methods & Action */}
          <div className="col-lg-7">
            <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm">
              <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                <div>
                  <h3 className="fw-bold text-dark mb-1">Select Payment Method</h3>
                  <p className="text-muted small mb-0">Razorpay Test Gateway (100% Encrypted & Safe)</p>
                </div>
                <div className="d-flex align-items-center gap-1.5 text-success small fw-semibold bg-success-subtle px-3 py-1.5 rounded-pill">
                  <Lock size={14} />
                  <span>256-Bit SSL</span>
                </div>
              </div>

              {error && <div className="alert alert-danger py-2.5 small mb-4">{error}</div>}

              {/* Payment Methods Choice */}
              <div className="d-flex flex-column gap-3 mb-4">
                {/* Method 1: UPI */}
                <label
                  className={`p-3 rounded-4 border cursor-pointer d-flex align-items-center justify-content-between ${
                    selectedMethod === 'upi' ? 'border-primary bg-primary-subtle bg-opacity-25' : 'bg-light'
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedMethod('upi')}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 bg-white p-2 border shadow-sm text-primary">
                      <Smartphone size={22} />
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">UPI (Google Pay, PhonePe, Paytm, BHIM)</h6>
                      <small className="text-muted">Instant zero-fee payment via any UPI App</small>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedMethod === 'upi'}
                    onChange={() => {}}
                    className="form-check-input"
                  />
                </label>

                {/* Method 2: Cards */}
                <label
                  className={`p-3 rounded-4 border cursor-pointer d-flex align-items-center justify-content-between ${
                    selectedMethod === 'card' ? 'border-primary bg-primary-subtle bg-opacity-25' : 'bg-light'
                  }`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedMethod('card')}
                >
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-3 bg-white p-2 border shadow-sm text-primary">
                      <CreditCard size={22} />
                    </div>
                    <div>
                      <h6 className="fw-bold text-dark mb-0">Credit / Debit Card</h6>
                      <small className="text-muted">Visa, MasterCard, RuPay, Maestro</small>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={selectedMethod === 'card'}
                    onChange={() => {}}
                    className="form-check-input"
                  />
                </label>
              </div>

              {/* Test Mode Note */}
              <div className="p-3.5 rounded-3 bg-indigo-subtle border border-indigo-subtle text-indigo mb-4 small" style={{ backgroundColor: '#eef2ff', color: '#4338ca' }}>
                <div className="d-flex align-items-center gap-2 fw-bold mb-1">
                  <ShieldCheck size={18} />
                  <span>Razorpay Test Sandbox Enabled</span>
                </div>
                <span>
                  This checkout is running in Razorpay Test Mode. Click "Pay Securely" to complete the test booking without any real money deduction.
                </span>
              </div>

              {/* Pay Button */}
              <button
                type="button"
                onClick={handleRazorpayCheckout}
                disabled={processing}
                className="btn btn-stayguard w-100 py-3 rounded-pill fw-bold fs-5 shadow d-flex align-items-center justify-content-center gap-2"
              >
                <Lock size={20} />
                <span>
                  {processing
                    ? 'Verifying Payment...'
                    : `Pay Securely ₹${booking.totalAmount?.toLocaleString('en-IN')}`}
                </span>
              </button>

              <div className="text-center mt-3 text-muted small">
                By clicking pay, you agree to STAYGUARD terms and hostel house rules.
              </div>
            </div>
          </div>

          {/* Right Column: Reservation Breakdown */}
          <div className="col-lg-5">
            <div className="bg-white p-4 rounded-4 border shadow-sm">
              <h5 className="fw-bold text-dark pb-3 border-bottom mb-3">Booking Information</h5>

              <div className="d-flex gap-3 mb-4">
                <img
                  src={
                    booking.hostel?.images?.[0] ||
                    '/images/hostels/hostel-1/building.jpg'
                  }
                  alt={booking.hostel?.name}
                  className="rounded-3 object-fit-cover shadow-sm"
                  style={{ width: '84px', height: '84px' }}
                />
                <div>
                  <h6 className="fw-bold text-dark mb-1">{booking.hostel?.name}</h6>
                  <div className="d-flex align-items-center gap-1 text-muted small mb-1">
                    <MapPin size={13} className="text-primary" />
                    <span>{booking.hostel?.location?.city}</span>
                  </div>
                  <span className="badge bg-primary-subtle text-primary rounded-pill small">
                    {booking.room?.roomType}
                  </span>
                </div>
              </div>

              {/* Customer Details */}
              <div className="p-3 bg-light rounded-3 mb-3 small">
                <div className="fw-bold text-dark mb-1">Primary Guest:</div>
                <div className="text-secondary">{booking.guestDetails?.name || user?.name}</div>
                <div className="text-muted">{booking.guestDetails?.email || user?.email} • {booking.guestDetails?.phone || user?.phone}</div>
              </div>

              {/* Price Details */}
              <div className="d-flex flex-column gap-2 mb-3 pb-3 border-bottom small">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">
                    Base Stay ({booking.nights} {booking.nights === 1 ? 'night' : 'nights'} × {booking.guests} guest)
                  </span>
                  <span className="fw-semibold text-dark">₹{booking.amount?.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">GST & Taxes (12%)</span>
                  <span className="fw-semibold text-dark">₹{booking.taxes?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center">
                <span className="fs-5 fw-bold text-dark">Total Amount Due</span>
                <span className="fs-3 fw-extrabold text-primary">₹{booking.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
