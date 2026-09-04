import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SearchBar from '../../components/SearchBar';
import HostelCard from '../../components/HostelCard';
import Loader from '../../components/Loader';
import hostelService from '../../services/hostelService';
import { POPULAR_CITIES } from '../../data/hostels';
import {
  ShieldCheck,
  Tag,
  CheckCircle2,
  Lock,
  ArrowRight,
  Compass,
  Star,
  Users,
  MapPin,
  Sparkles,
  Building2,
  Percent,
  Clock,
  ThumbsUp,
  Headphones,
  Search,
  Check,
  CalendarCheck,
  BedDouble,
  Heart,
  Quote,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [featuredHostels, setFeaturedHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    const fetchHostels = async () => {
      try {
        const res = await hostelService.getAllHostels({ limit: 6, sort: 'recommended' });
        if (res.success && res.data) {
          setFeaturedHostels(res.data);
        }
      } catch (err) {
        console.error('Error fetching popular hostels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHostels();
  }, []);

  const handleCityClick = (cityName) => {
    navigate(`/explore?city=${encodeURIComponent(cityName)}`);
  };

  // Curated Popular Destinations: Hyderabad, Bangalore, Chennai, Delhi, Mumbai, Pune
  const targetCities = ['Hyderabad', 'Bangalore', 'Chennai', 'Delhi', 'Mumbai', 'Pune'];
  const destinations = POPULAR_CITIES.filter((c) => targetCities.includes(c.name));

  // Promotional Offers
  const specialOffers = [
    {
      id: 'weekend',
      title: 'Weekend Deals',
      subtitle: 'Flat 15% OFF on 2-night weekend getaways',
      code: 'STAYWEEKEND',
      validity: 'Fri - Sun check-ins',
      badge: 'POPULAR',
      color: '#4f46e5',
    },
    {
      id: 'longstay',
      title: 'Long Stay Discounts',
      subtitle: 'Save up to 25% on weekly & monthly student stays',
      code: 'LONGSTAY25',
      validity: '7+ nights reservation',
      badge: 'BEST VALUE',
      color: '#0f766e',
    },
    {
      id: 'student',
      title: 'Student-Friendly Stays',
      subtitle: 'Special ₹200 cashback on verified student bookings',
      code: 'STUDENTPASS',
      validity: 'Valid student ID check-in',
      badge: 'FOR STUDENTS',
      color: '#0ea5e9',
    },
    {
      id: 'newuser',
      title: 'New User Offers',
      subtitle: 'Instant ₹150 discount on your first hostel reservation',
      code: 'WELCOMESTAY',
      validity: 'First-time travelers',
      badge: 'NEW',
      color: '#e11d48',
    },
  ];

  // Customer Testimonial Data
  const customerReviews = [
    {
      id: 1,
      name: 'Aarav Sharma',
      role: 'Solo Backpacker',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      rating: 5,
      review:
        'STAYGUARD made finding a safe AC hostel in Hyderabad effortless! The check-in was instant and the property matched every photo shown on the site.',
      hostel: 'The Hyderabad Luxury AC Backpackers Haven',
      city: 'Hyderabad',
    },
    {
      id: 2,
      name: 'Pooja Iyer',
      role: 'Tech Intern & Traveler',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      rating: 5,
      review:
        'Loved the transparent INR pricing and the bed selection. The Wi-Fi speed and electronic lockers made it the perfect base for my work trip.',
      hostel: 'Indiranagar Urban AC Co-Living Hostel',
      city: 'Bangalore',
    },
    {
      id: 3,
      name: 'Kunal Deshmukh',
      role: 'Digital Nomad',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      rating: 5,
      review:
        'Zero hidden charges and genuine guest reviews. Booking through Razorpay took under a minute. Definitely my go-to hostel platform across India!',
      hostel: 'Anjuna Beachside Luxury AC Social Hostel',
      city: 'Goa',
    },
  ];

  return (
    <div className="home-page pb-5">
      {/* 2. Hero & Search Area */}
      <section className="hero-wrapper position-relative text-center">
        <div className="hero-glow" />
        <div className="container position-relative z-2">
          <div className="row align-items-center py-4">
            <div className="col-lg-9 mx-auto">
              <span className="badge bg-indigo-500 bg-opacity-25 border border-indigo-400 border-opacity-30 text-white rounded-pill px-3.5 py-1.5 mb-3 fw-semibold small d-inline-flex align-items-center gap-1.5">
                <Sparkles size={14} className="text-warning" />
                <span>India's Premier Hostel Booking Marketplace</span>
              </span>
              <h1 className="display-4 fw-extrabold text-white mb-2 tracking-tight">
                Find a Safe & Affordable Stay
              </h1>
              <p className="lead text-light text-opacity-90 mb-4 mx-auto" style={{ maxWidth: '640px', fontSize: '1.15rem' }}>
                Discover verified hostels, compare prices and book your stay with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Prominent Search Bar */}
      <div className="container position-relative z-3">
        <div className="row">
          <div className="col-12 col-xl-10 mx-auto">
            <SearchBar />

            {/* Quick Location Search: Popular Cities Pills */}
            <div className="d-flex flex-wrap align-items-center justify-content-center gap-2 mt-3 pt-1">
              <span className="text-muted small fw-bold text-uppercase tracking-wider me-1">Popular Cities:</span>
              {['Hyderabad', 'Bangalore', 'Chennai', 'Delhi', 'Mumbai', 'Pune'].map((cityName) => (
                <button
                  key={cityName}
                  type="button"
                  onClick={() => handleCityClick(cityName)}
                  className="btn btn-sm btn-white bg-white border rounded-pill px-3 py-1 text-dark fw-medium shadow-sm hover-text-primary"
                  style={{ fontSize: '0.82rem' }}
                >
                  <MapPin size={12} className="text-primary me-1" />
                  {cityName}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Popular Destinations */}
      <section className="container mt-5 pt-4">
        <div className="d-flex flex-column flex-md-row md-align-items-end justify-content-between mb-4">
          <div>
            <span className="text-primary fw-bold small text-uppercase tracking-wider">Top Locations</span>
            <h2 className="fw-bold text-dark mb-1">Popular Destinations</h2>
            <p className="text-muted mb-0">Explore verified backpacker and student hostels across India's top cities</p>
          </div>
          <Link to="/explore" className="btn btn-link text-primary fw-bold text-decoration-none d-flex align-items-center gap-1 p-0 mt-2 mt-md-0">
            <span>Explore All Cities</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="row g-3">
          {destinations.map((city) => (
            <div className="col-6 col-md-4 col-lg-2" key={city.name}>
              <div
                onClick={() => handleCityClick(city.name)}
                className="destination-card"
              >
                <img
                  src={city.img}
                  alt={city.name}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1572455044327-7348c1be7267?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="destination-card-overlay">
                  <h6 className="fw-bold mb-0 text-white">{city.name}</h6>
                  <span className="small text-light opacity-90" style={{ fontSize: '0.75rem' }}>{city.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Smart Hostel Discovery Section */}
      <section className="container mt-5 pt-4">
        <div className="d-flex flex-column flex-md-row md-align-items-end justify-content-between mb-4">
          <div>
            <span className="text-primary fw-bold small text-uppercase tracking-wider">Smart Discovery</span>
            <h2 className="fw-bold text-dark mb-1">Recommended Hostels</h2>
            <p className="text-muted mb-0">Verified properties handpicked for comfort, cleanliness, and security</p>
          </div>
          <Link to="/explore" className="btn btn-stayguard-outline btn-sm rounded-pill px-4 mt-2 mt-md-0">
            <span>Browse All Stays</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="row g-4">
            {[1, 2, 3].map((n) => (
              <div className="col-12 col-md-6 col-lg-4" key={n}>
                <div className="card h-100 border-0 rounded-4 bg-white shadow-sm p-3">
                  <div className="skeleton-box rounded-3 mb-3" style={{ height: '200px', width: '100%' }} />
                  <div className="skeleton-box rounded-2 mb-2" style={{ height: '24px', width: '70%' }} />
                  <div className="skeleton-box rounded-2 mb-3" style={{ height: '18px', width: '40%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="row g-4">
            {featuredHostels.map((hostel) => (
              <div className="col-12 col-md-6 col-lg-4" key={hostel._id}>
                <HostelCard hostel={hostel} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Special Offers */}
      <section className="container mt-5 pt-4">
        <div className="d-flex flex-column flex-md-row md-align-items-end justify-content-between mb-4">
          <div>
            <span className="text-primary fw-bold small text-uppercase tracking-wider">Exclusive Deals</span>
            <h2 className="fw-bold text-dark mb-1">Special Offers & Discounts</h2>
            <p className="text-muted mb-0">Use verified promo codes at checkout for instant savings</p>
          </div>
        </div>

        <div className="row g-3">
          {specialOffers.map((offer) => (
            <div className="col-12 col-sm-6 col-lg-3" key={offer.id}>
              <div className="offer-card h-100 d-flex flex-column justify-content-between">
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary text-white rounded-pill px-2.5 py-1" style={{ fontSize: '0.68rem', letterSpacing: '0.5px' }}>
                      {offer.badge}
                    </span>
                    <Percent size={16} className="text-primary" />
                  </div>
                  <h5 className="fw-bold text-dark mb-1" style={{ fontSize: '1.05rem' }}>{offer.title}</h5>
                  <p className="text-muted small mb-3">{offer.subtitle}</p>
                </div>
                <div className="pt-2 border-top d-flex align-items-center justify-content-between">
                  <span className="offer-code-pill">{offer.code}</span>
                  <span className="text-muted" style={{ fontSize: '0.72rem' }}>{offer.validity}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Why Choose STAYGUARD */}
      <section id="why-choose-us" className="container mt-5 pt-5">
        <div className="text-center max-w-2xl mx-auto mb-5">
          <span className="text-primary fw-bold small text-uppercase tracking-wider">Trusted Ecosystem</span>
          <h2 className="fw-bold text-dark mb-2">Why Choose STAYGUARD?</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '580px' }}>
            We provide a transparent, hassle-free hostel booking experience designed for modern travelers, students, and backpackers.
          </p>
        </div>

        <div className="row g-4">
          {/* 1. Verified Hostels */}
          <div className="col-md-6 col-lg-4">
            <div className="feature-box h-100">
              <div className="feature-icon-wrapper">
                <ShieldCheck size={26} />
              </div>
              <h5 className="fw-bold text-dark mb-2">Verified Hostels</h5>
              <p className="text-muted small mb-0">
                Every property on STAYGUARD is physically verified for safety, biometric access, cleanliness, and optic Wi-Fi reliability.
              </p>
            </div>
          </div>

          {/* 2. Affordable Prices */}
          <div className="col-md-6 col-lg-4">
            <div className="feature-box h-100">
              <div className="feature-icon-wrapper">
                <Tag size={26} />
              </div>
              <h5 className="fw-bold text-dark mb-2">Affordable Prices</h5>
              <p className="text-muted small mb-0">
                Transparent standard INR pricing from ₹1,150/night with zero surprise fees or hidden booking surcharges.
              </p>
            </div>
          </div>

          {/* 3. Secure Booking */}
          <div className="col-md-6 col-lg-4">
            <div className="feature-box h-100">
              <div className="feature-icon-wrapper">
                <Lock size={26} />
              </div>
              <h5 className="fw-bold text-dark mb-2">Secure Booking</h5>
              <p className="text-muted small mb-0">
                Seamless 256-bit encrypted checkout with instant bed reservation locking and official booking passes.
              </p>
            </div>
          </div>

          {/* 4. Easy Cancellation */}
          <div className="col-md-6 col-lg-4">
            <div className="feature-box h-100">
              <div className="feature-icon-wrapper">
                <Clock size={26} />
              </div>
              <h5 className="fw-bold text-dark mb-2">Easy Cancellation</h5>
              <p className="text-muted small mb-0">
                Flexible cancellation policies up to 24 hours prior to check-in with 1-click self-service refund management.
              </p>
            </div>
          </div>

          {/* 5. Trusted Reviews */}
          <div className="col-md-6 col-lg-4">
            <div className="feature-box h-100">
              <div className="feature-icon-wrapper">
                <ThumbsUp size={26} />
              </div>
              <h5 className="fw-bold text-dark mb-2">Trusted Reviews</h5>
              <p className="text-muted small mb-0">
                100% authentic ratings and feedback written exclusively by verified travelers who have completed stays.
              </p>
            </div>
          </div>

          {/* 6. 24/7 Support */}
          <div className="col-md-6 col-lg-4">
            <div className="feature-box h-100">
              <div className="feature-icon-wrapper">
                <Headphones size={26} />
              </div>
              <h5 className="fw-bold text-dark mb-2">24/7 Support</h5>
              <p className="text-muted small mb-0">
                Dedicated traveler helpline, in-app notification tracking, and on-ground property support around the clock.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. How It Works */}
      <section id="how-it-works" className="container mt-5 pt-5">
        <div className="bg-primary-subtle bg-opacity-40 rounded-4 p-4 p-md-5 border border-primary border-opacity-25">
          <div className="text-center mb-5">
            <span className="text-primary fw-bold small text-uppercase tracking-wider">Simple 4-Step Flow</span>
            <h2 className="fw-bold text-dark mb-2">How It Works</h2>
            <p className="text-muted">Book your dream stay in under 2 minutes</p>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-6 col-lg-3">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100">
                <div className="badge bg-primary text-white rounded-circle p-2 fs-6 mb-3" style={{ width: '40px', height: '40px' }}>
                  1
                </div>
                <h5 className="fw-bold text-dark mb-2">Search</h5>
                <p className="text-muted small mb-0">
                  Enter your destination city, check-in dates, and number of guests in the search bar.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100">
                <div className="badge bg-primary text-white rounded-circle p-2 fs-6 mb-3" style={{ width: '40px', height: '40px' }}>
                  2
                </div>
                <h5 className="fw-bold text-dark mb-2">Compare</h5>
                <p className="text-muted small mb-0">
                  Filter by budget, AC dorm type, customer ratings, and verified property amenities.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100">
                <div className="badge bg-primary text-white rounded-circle p-2 fs-6 mb-3" style={{ width: '40px', height: '40px' }}>
                  3
                </div>
                <h5 className="fw-bold text-dark mb-2">Book</h5>
                <p className="text-muted small mb-0">
                  Lock your bed inventory with instant confirmation through Razorpay test payments.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-3">
              <div className="bg-white p-4 rounded-4 shadow-sm h-100">
                <div className="badge bg-primary text-white rounded-circle p-2 fs-6 mb-3" style={{ width: '40px', height: '40px' }}>
                  4
                </div>
                <h5 className="fw-bold text-dark mb-2">Stay</h5>
                <p className="text-muted small mb-0">
                  Check-in with your digital booking pass and enjoy a world-class luxury hostel stay!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Customer Reviews & Testimonials */}
      <section className="container mt-5 pt-5">
        <div className="text-center max-w-2xl mx-auto mb-5">
          <span className="text-primary fw-bold small text-uppercase tracking-wider">Guest Stories</span>
          <h2 className="fw-bold text-dark mb-2">What Our Guests Say</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '580px' }}>
            Real reviews from solo backpackers, students, and digital nomads across India
          </p>
        </div>

        <div className="row g-4">
          {customerReviews.map((rev) => (
            <div className="col-12 col-md-4" key={rev.id}>
              <div className="testimonial-card">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <div className="d-flex align-items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={15} className="fill-warning text-warning" />
                    ))}
                  </div>
                  <Quote size={20} className="text-primary opacity-50" />
                </div>

                <p className="text-dark small mb-4 flex-grow-1" style={{ lineHeight: '1.6' }}>
                  "{rev.review}"
                </p>

                <div className="d-flex align-items-center gap-3 pt-3 border-top">
                  <img
                    src={rev.avatar}
                    alt={rev.name}
                    className="rounded-circle object-fit-cover shadow-sm"
                    style={{ width: '42px', height: '42px' }}
                  />
                  <div>
                    <h6 className="fw-bold text-dark mb-0" style={{ fontSize: '0.9rem' }}>{rev.name}</h6>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{rev.role}</small>
                    <span className="text-primary fw-semibold" style={{ fontSize: '0.72rem' }}>{rev.city}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Frequently Asked Questions (FAQ) */}
      <section className="container mt-5 pt-5">
        <div className="text-center max-w-2xl mx-auto mb-5">
          <span className="text-primary fw-bold small text-uppercase tracking-wider">Got Questions?</span>
          <h2 className="fw-bold text-dark mb-2">Frequently Asked Questions</h2>
          <p className="text-muted mx-auto" style={{ maxWidth: '560px' }}>
            Everything you need to know about booking, check-in, and staying safe with STAYGUARD.
          </p>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8 d-flex flex-column gap-3">
            {[
              {
                q: 'What government ID is required during check-in?',
                a: 'All guests must present a valid government-issued photo ID (Aadhaar Card, Passport, Driver’s License, or Voter ID) upon arrival. College IDs alone are not accepted without official photo identification.',
              },
              {
                q: 'How does STAYGUARD ensure safety for solo female travelers?',
                a: 'All our listed hostels are physically audited for 24/7 CCTV surveillance, biometric/RFID door access, female-only dorm options, verified reception staff, and well-lit neighborhood connectivity.',
              },
              {
                q: 'Can I cancel or reschedule my hostel reservation?',
                a: 'Yes! Most verified properties offer free cancellation up to 24 hours prior to your check-in time with 1-click self-service refund processing directly to your original payment method.',
              },
              {
                q: 'Are high-speed Wi-Fi and power backup included?',
                a: 'Yes, 100% of our featured and luxury AC backpacker hostels provide complimentary high-speed optic fiber Wi-Fi (50–150 Mbps) and dedicated generator/inverter power backup for seamless remote working.',
              },
              {
                q: 'What payment modes are supported on STAYGUARD?',
                a: 'We accept UPI (Google Pay, PhonePe, Paytm), Credit & Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Razorpay test checkout with zero convenience surcharges.',
              },
            ].map((faq, idx) => (
              <div key={idx} className="faq-card shadow-sm">
                <div
                  className="faq-header"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? -1 : idx)}
                >
                  <span className="d-flex align-items-center gap-2">
                    <HelpCircle size={18} className="text-primary flex-shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  {openFaqIndex === idx ? (
                    <ChevronUp size={18} className="text-primary flex-shrink-0" />
                  ) : (
                    <ChevronDown size={18} className="text-muted flex-shrink-0" />
                  )}
                </div>
                {openFaqIndex === idx && <div className="faq-body border-top pt-3">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Hostel Owner CTA Banner */}
      <section id="about" className="container mt-5 pt-4">
        <div
          className="rounded-4 p-4 p-md-5 text-white position-relative overflow-hidden shadow-lg"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)' }}
        >
          <div className="row align-items-center position-relative z-2">
            <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="d-flex align-items-center gap-2 mb-2">
                <Building2 size={24} className="text-warning" />
                <span className="badge bg-white bg-opacity-20 text-white rounded-pill px-3 py-1">For Property Owners & Operators</span>
              </div>
              <h2 className="fw-bold text-white mb-2">Own or Manage a Hostel in India?</h2>
              <p className="text-light text-opacity-90 mb-0 lead" style={{ fontSize: '1.05rem' }}>
                Join STAYGUARD's growing network. Manage live bed inventory, automate bookings, and boost your property revenue with our dedicated owner dashboard.
              </p>
            </div>
            <div className="col-lg-4 text-lg-end">
              <Link to="/register?role=owner" className="btn btn-light btn-lg rounded-pill px-4 fw-bold text-primary shadow">
                List Your Hostel Free
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
