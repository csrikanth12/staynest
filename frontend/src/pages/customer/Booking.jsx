import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import hostelService from '../../services/hostelService';
import bookingService from '../../services/bookingService';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import {
  Calendar,
  Users,
  MapPin,
  ShieldCheck,
  CreditCard,
  Bed,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const hostelId = searchParams.get('hostelId');
  const roomId = searchParams.get('roomId');

  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 24 * 3600 * 1000)
    .toISOString()
    .split('T')[0];

  const [hostel, setHostel] = useState(null);
  const [room, setRoom] = useState(null);
  const [allRooms, setAllRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [guests, setGuests] = useState(1);
  const [selectedRoomId, setSelectedRoomId] = useState(roomId || '');
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Promo Code State
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'STAYWEEKEND') {
      setAppliedPromo({ code, type: 'percent', value: 0.15, label: 'Weekend Deals (15% OFF)' });
      setPromoSuccess('Promo applied! 15% discount deducted.');
    } else if (code === 'LONGSTAY25') {
      setAppliedPromo({ code, type: 'percent', value: 0.25, label: 'Long Stay Special (25% OFF)' });
      setPromoSuccess('Promo applied! 25% discount deducted.');
    } else if (code === 'WELCOMESTAY') {
      setAppliedPromo({ code, type: 'flat', value: 150, label: 'New User Offer (₹150 OFF)' });
      setPromoSuccess('Promo applied! ₹150 discount deducted.');
    } else if (code === 'STUDENTPASS') {
      setAppliedPromo({ code, type: 'flat', value: 200, label: 'Student Pass (₹200 OFF)' });
      setPromoSuccess('Promo applied! ₹200 discount deducted.');
    } else {
      setPromoError('Invalid promo code. Try STAYWEEKEND or WELCOMESTAY');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoSuccess('');
    setPromoError('');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!hostelId) {
        navigate('/explore');
        return;
      }

      try {
        const res = await hostelService.getHostelById(hostelId);
        if (res.success && res.data) {
          setHostel(res.data);
          setAllRooms(res.data.rooms || []);

          if (roomId) {
            const targetRoom = res.data.rooms?.find((r) => r._id === roomId);
            if (targetRoom) {
              setRoom(targetRoom);
              setSelectedRoomId(targetRoom._id);
            }
          } else if (res.data.rooms && res.data.rooms.length > 0) {
            setRoom(res.data.rooms[0]);
            setSelectedRoomId(res.data.rooms[0]._id);
          }
        }
      } catch (err) {
        console.error('Error loading booking data:', err);
        setError('Failed to load hostel and room details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [hostelId, roomId, navigate]);

  // Update room object when selectedRoomId changes
  const handleRoomChange = (e) => {
    const newRoomId = e.target.value;
    setSelectedRoomId(newRoomId);
    const matched = allRooms.find((r) => r._id === newRoomId);
    if (matched) setRoom(matched);
  };

  // Compute stay calculations
  const calculateStay = () => {
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diffTime = d2.getTime() - d1.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 3600 * 24)));
    const roomRate = room ? room.price : 500;
    const baseAmount = roomRate * nights * Number(guests);
    const taxes = Math.round(baseAmount * 0.12);

    let discount = 0;
    if (appliedPromo) {
      if (appliedPromo.type === 'percent') {
        discount = Math.round(baseAmount * appliedPromo.value);
      } else if (appliedPromo.type === 'flat') {
        discount = appliedPromo.value;
      }
    }

    const totalAmount = Math.max(0, baseAmount + taxes - discount);

    return { nights, baseAmount, taxes, discount, totalAmount };
  };

  const { nights, baseAmount, taxes, discount, totalAmount } = calculateStay();

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedRoomId) {
      setError('Please select a room to continue');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await bookingService.createBooking({
        hostelId: hostel._id,
        roomId: selectedRoomId,
        checkIn,
        checkOut,
        guests: Number(guests),
        specialRequests,
        guestDetails: {
          name,
          email,
          phone,
        },
      });

      if (res.success && res.data) {
        // Redirect to payment page with created booking ID
        navigate(`/payment/${res.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Loader fullScreen message="Preparing your booking..." />;
  }

  if (!hostel) {
    return (
      <div className="container py-5 text-center">
        <h4 className="fw-bold text-dark">Hostel not found</h4>
        <Link to="/explore" className="btn btn-stayguard rounded-pill px-4 mt-3">
          Explore Hostels
        </Link>
      </div>
    );
  }

  return (
    <div className="booking-page bg-light py-5">
      <div className="container">
        <BackButton fallback={hostelId ? `/hostels/${hostelId}` : '/explore'} />

        {/* Step Indicator */}
        <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
          <div className="d-flex align-items-center gap-2 fw-bold text-primary">
            <span className="badge bg-primary text-white rounded-circle p-2" style={{ width: '28px', height: '28px' }}>
              1
            </span>
            <span>Guest & Dates</span>
          </div>
          <div style={{ width: '40px', height: '2px', backgroundColor: '#cbd5e1' }} />
          <div className="d-flex align-items-center gap-2 text-muted fw-semibold">
            <span className="badge bg-secondary bg-opacity-25 text-secondary rounded-circle p-2" style={{ width: '28px', height: '28px' }}>
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
          {/* Left Form Column */}
          <div className="col-lg-7">
            <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm">
              <h3 className="fw-bold text-dark mb-1">Guest Information & Dates</h3>
              <p className="text-muted small mb-4">
                Please provide primary guest details matching government identification.
              </p>

              {error && <div className="alert alert-danger py-2.5 small mb-4">{error}</div>}

              <form onSubmit={handleBookingSubmit}>
                {/* Guest Contact Details */}
                <div className="row g-3 mb-4">
                  <div className="col-md-12">
                    <label className="form-label small fw-bold text-dark">Full Name (as per Govt ID) *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Rohan Mehra"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Email Address *</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rohan@example.com"
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Phone Number (with WhatsApp) *</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                    />
                  </div>
                </div>

                <hr className="my-4" />

                {/* Stay Dates & Room Selection */}
                <h5 className="fw-bold text-dark mb-3">Stay & Room Details</h5>

                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Check-in Date *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <Calendar size={16} />
                      </span>
                      <input
                        type="date"
                        min={todayStr}
                        className="form-control"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Check-out Date *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <Calendar size={16} />
                      </span>
                      <input
                        type="date"
                        min={checkIn || todayStr}
                        className="form-control"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Room / Dorm Type *</label>
                    <select
                      className="form-select"
                      value={selectedRoomId}
                      onChange={handleRoomChange}
                      required
                    >
                      {allRooms.map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.roomType} (₹{r.price}/night • {r.availableBeds} beds left)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-dark">Number of Guests *</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <Users size={16} />
                      </span>
                      <select
                        className="form-select"
                        value={guests}
                        onChange={(e) => setGuests(e.target.value)}
                      >
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4 Guests</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-bold text-dark">Special Requests (Optional)</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="e.g. Lower bunk preference, late night check-in around 10:30 PM..."
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-stayguard w-100 py-3 rounded-pill fw-bold fs-6 shadow d-flex align-items-center justify-content-center gap-2"
                >
                  <span>{submitting ? 'Processing...' : 'Continue to Payment'}</span>
                  <ArrowRight size={18} />
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Booking Summary */}
          <div className="col-lg-5">
            <div className="sticky-top bg-white p-4 rounded-4 border shadow-sm" style={{ top: '90px' }}>
              <h5 className="fw-bold text-dark pb-3 border-bottom mb-3">Booking Summary</h5>

              {/* Hostel Overview */}
              <div className="d-flex gap-3 mb-4">
                <img
                  src={
                    hostel.images?.[0] ||
                    '/images/hostels/hostel-1/building.jpg'
                  }
                  alt={hostel.name}
                  className="rounded-3 object-fit-cover shadow-sm"
                  style={{ width: '88px', height: '88px' }}
                />
                <div>
                  <h6 className="fw-bold text-dark mb-1">{hostel.name}</h6>
                  <div className="d-flex align-items-center gap-1 text-muted small mb-1">
                    <MapPin size={13} className="text-primary" />
                    <span>{hostel.location?.city}</span>
                  </div>
                  <span className="badge bg-primary-subtle text-primary rounded-pill small">
                    {room?.roomType || 'Standard Room'}
                  </span>
                </div>
              </div>

              {/* Dates & Duration Summary */}
              <div className="p-3 bg-light rounded-3 mb-4 small">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Check-in:</span>
                  <span className="fw-bold text-dark">{checkIn} (1:00 PM)</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Check-out:</span>
                  <span className="fw-bold text-dark">{checkOut} (11:00 AM)</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Total Duration:</span>
                  <span className="fw-bold text-primary">
                    {nights} {nights === 1 ? 'Night' : 'Nights'}, {guests} {guests === 1 ? 'Guest' : 'Guests'}
                  </span>
                </div>
              </div>

              {/* Promo Code Section */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-dark">Have a Promo Code?</label>
                {!appliedPromo ? (
                  <form onSubmit={handleApplyPromo} className="d-flex gap-2">
                    <input
                      type="text"
                      className="form-control form-control-sm text-uppercase fw-bold"
                      placeholder="e.g. STAYWEEKEND"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <button type="submit" className="btn btn-dark btn-sm rounded-3 px-3 fw-bold">
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="d-flex align-items-center justify-content-between p-2.5 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-3 text-success small">
                    <div>
                      <span className="fw-bold d-block">{appliedPromo.code}</span>
                      <span>{appliedPromo.label}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="btn btn-link btn-sm text-danger p-0 fw-bold text-decoration-none"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {promoError && <small className="text-danger d-block mt-1">{promoError}</small>}
                {promoSuccess && <small className="text-success d-block mt-1">{promoSuccess}</small>}
              </div>

              {/* Price Breakdown in INR */}
              <h6 className="fw-bold text-dark mb-2">Price Breakdown</h6>
              <div className="d-flex flex-column gap-2 mb-3 pb-3 border-bottom small">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">
                    ₹{room?.price || 500} × {nights} {nights === 1 ? 'night' : 'nights'} × {guests} guest(s)
                  </span>
                  <span className="fw-semibold text-dark">₹{baseAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">GST & Taxes (12%)</span>
                  <span className="fw-semibold text-dark">₹{taxes.toLocaleString('en-IN')}</span>
                </div>
                {discount > 0 && (
                  <div className="d-flex justify-content-between text-success fw-bold">
                    <span>Promo Discount ({appliedPromo?.code})</span>
                    <span>- ₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="d-flex justify-content-between text-success">
                  <span>Booking Platform Fee</span>
                  <span className="fw-bold">FREE</span>
                </div>
              </div>

              {/* Total Row */}
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="fs-5 fw-bold text-dark">Total Amount (INR)</span>
                <span className="fs-3 fw-extrabold text-primary">₹{totalAmount.toLocaleString('en-IN')}</span>
              </div>

              {/* Trust Badges */}
              <div className="p-3 rounded-3 bg-indigo-subtle border border-indigo-subtle d-flex align-items-center gap-2 text-indigo small" style={{ backgroundColor: '#eef2ff', color: '#4338ca' }}>
                <ShieldCheck size={20} className="flex-shrink-0" />
                <span>Zero cancellation fee if cancelled at least 24h before check-in.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
