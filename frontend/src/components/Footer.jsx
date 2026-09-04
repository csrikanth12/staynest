import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
  CheckCircle2,
  Lock,
  Globe,
  Instagram,
  Facebook,
  Twitter,
  Linkedin,
  Youtube,
  Heart,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto border-top border-secondary border-opacity-25">
      <div className="container">
        <div className="row g-4 mb-5">
          {/* Brand Info */}
          <div className="col-lg-3 col-md-6">
            <div className="d-flex align-items-center gap-2 mb-3">
              <div
                className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
                style={{ width: '36px', height: '36px', background: 'var(--primary-gradient)' }}
              >
                <ShieldCheck size={20} />
              </div>
              <span className="fw-bold fs-4 text-white">
                STAY<span style={{ color: '#818cf8' }}>GUARD</span>
              </span>
            </div>
            <p className="text-secondary mb-4" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
              India's premier modern hostel booking marketplace. Discover verified accommodations, transparent prices, and book with complete confidence.
            </p>
            <div className="d-flex flex-column gap-2 text-secondary mb-3" style={{ fontSize: '0.85rem' }}>
              <div className="d-flex align-items-center gap-2">
                <MapPin size={15} className="text-primary flex-shrink-0" />
                <span>HITEC City, Hyderabad, Telangana 500081</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Mail size={15} className="text-primary flex-shrink-0" />
                <span>support@stayguard.com</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Phone size={15} className="text-primary flex-shrink-0" />
                <span>+91 98450 12345</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="d-flex align-items-center gap-2 pt-1">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="btn btn-sm btn-dark border border-secondary border-opacity-50 text-secondary rounded-circle p-2" aria-label="Instagram">
                <Instagram size={14} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="btn btn-sm btn-dark border border-secondary border-opacity-50 text-secondary rounded-circle p-2" aria-label="Facebook">
                <Facebook size={14} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="btn btn-sm btn-dark border border-secondary border-opacity-50 text-secondary rounded-circle p-2" aria-label="Twitter">
                <Twitter size={14} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="btn btn-sm btn-dark border border-secondary border-opacity-50 text-secondary rounded-circle p-2" aria-label="LinkedIn">
                <Linkedin size={14} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="btn btn-sm btn-dark border border-secondary border-opacity-50 text-secondary rounded-circle p-2" aria-label="YouTube">
                <Youtube size={14} />
              </a>
            </div>
          </div>

          {/* About StayGuard / Company */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold text-uppercase mb-3 tracking-wider" style={{ fontSize: '0.85rem' }}>About StayGuard</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 text-secondary" style={{ fontSize: '0.88rem' }}>
              <li>
                <a href="/#about" className="text-secondary hover-text-white">
                  About Us
                </a>
              </li>
              <li>
                <a href="/#how-it-works" className="text-secondary hover-text-white">
                  How It Works
                </a>
              </li>
              <li>
                <a href="/#why-choose-us" className="text-secondary hover-text-white">
                  Why Choose Us
                </a>
              </li>
              <li>
                <a href="mailto:support@stayguard.com" className="text-secondary hover-text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="mailto:support@stayguard.com" className="text-secondary hover-text-white">
                  Contact Support
                </a>
              </li>
            </ul>
          </div>

          {/* For Customers */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold text-uppercase mb-3 tracking-wider" style={{ fontSize: '0.85rem' }}>For Customers</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 text-secondary" style={{ fontSize: '0.88rem' }}>
              <li>
                <Link to="/explore" className="text-secondary hover-text-white">
                  Explore Hostels
                </Link>
              </li>
              <li>
                <Link to="/customer/dashboard" className="text-secondary hover-text-white">
                  Customer Dashboard
                </Link>
              </li>
              <li>
                <Link to="/my-bookings" className="text-secondary hover-text-white">
                  My Bookings
                </Link>
              </li>
              <li>
                <Link to="/customer/dashboard" className="text-secondary hover-text-white d-flex align-items-center gap-1">
                  <span>Wishlist / Saved</span>
                  <Heart size={12} className="text-danger" />
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-secondary hover-text-white">
                  Profile Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* For Hostel Owners */}
          <div className="col-lg-2 col-md-6 col-6">
            <h6 className="text-white fw-bold text-uppercase mb-3 tracking-wider" style={{ fontSize: '0.85rem' }}>For Hostel Owners</h6>
            <ul className="list-unstyled d-flex flex-column gap-2 text-secondary" style={{ fontSize: '0.88rem' }}>
              <li>
                <Link to="/register?role=owner" className="text-secondary hover-text-white">
                  List Your Hostel
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-secondary hover-text-white">
                  Owner Login
                </Link>
              </li>
              <li>
                <Link to="/owner/dashboard" className="text-secondary hover-text-white">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/owner/rooms" className="text-secondary hover-text-white">
                  Room Inventory
                </Link>
              </li>
              <li>
                <Link to="/owner/revenue" className="text-secondary hover-text-white">
                  Revenue Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Safe Booking */}
          <div className="col-lg-3 col-md-6 col-6">
            <h6 className="text-white fw-bold text-uppercase mb-3 tracking-wider" style={{ fontSize: '0.85rem' }}>Trust & Safety</h6>
            <p className="text-secondary mb-3" style={{ fontSize: '0.85rem', lineHeight: '1.5' }}>
              Every hostel on STAYGUARD undergoes physical verification for safety, hygiene, and guest security.
            </p>
            <div className="d-flex flex-column gap-2">
              <div className="d-flex align-items-center gap-2 text-success small fw-semibold">
                <CheckCircle2 size={16} />
                <span>100% Verified Properties</span>
              </div>
              <div className="d-flex align-items-center gap-2 text-info small fw-semibold">
                <Lock size={16} />
                <span>256-Bit SSL Safe Checkout</span>
              </div>
            </div>
          </div>
        </div>

        <hr className="border-secondary border-opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 text-secondary" style={{ fontSize: '0.85rem' }}>
          <div>
            &copy; {new Date().getFullYear()} STAYGUARD Technologies Inc. All rights reserved.
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="text-secondary">Privacy Policy</span>
            <span>•</span>
            <span className="text-secondary">Terms & Conditions</span>
            <span>•</span>
            <span className="text-secondary">Hostel Partner Agreement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
