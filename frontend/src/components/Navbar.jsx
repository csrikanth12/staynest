import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import {
  Building2,
  Compass,
  CalendarCheck,
  User,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  PlusCircle,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isOwner } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom sticky-top py-3 shadow-sm">
      <div className="container">
        {/* Brand Logo */}
        <Link
          to="/"
          className="navbar-brand d-flex align-items-center gap-2 fw-bold text-dark fs-4 tracking-tight"
          onClick={() => {
            setMobileMenuOpen(false);
            setUserMenuOpen(false);
          }}
        >
          <div
            className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
            style={{ width: '38px', height: '38px', background: 'var(--primary-gradient)' }}
          >
            <ShieldCheck size={22} />
          </div>
          <span>
            STAY<span style={{ color: 'var(--primary)' }}>GUARD</span>
          </span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-0 shadow-none p-1"
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Collapsible Navbar */}
        <div className={`collapse navbar-collapse ${mobileMenuOpen ? 'show' : ''}`}>
          {/* Main Nav Links */}
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 gap-lg-3 fw-semibold">
            <li className="nav-item">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `nav-link px-2 ${isActive ? 'text-primary active fw-bold' : 'text-secondary'}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/explore"
                className={({ isActive }) =>
                  `nav-link px-2 ${isActive ? 'text-primary active fw-bold' : 'text-secondary'}`
                }
                onClick={() => setMobileMenuOpen(false)}
              >
                Explore Hostels
              </NavLink>
            </li>
            <li className="nav-item">
              <a
                href="/#how-it-works"
                className="nav-link px-2 text-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
            </li>
            <li className="nav-item">
              <a
                href="/#about"
                className="nav-link px-2 text-secondary"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
            </li>
          </ul>

          {/* Right Action Buttons */}
          <div className="d-flex align-items-lg-center flex-column flex-lg-row gap-2.5 mt-3 mt-lg-0">
            {user ? (
              <div className="d-flex align-items-center gap-2">
                {/* Notification Bell Dropdown */}
                <NotificationDropdown isOwnerView={isOwner} />

                {/* User Menu Dropdown */}
                <div className="position-relative" ref={userMenuRef}>
                  <button
                    className="btn btn-light d-flex align-items-center gap-2 rounded-pill px-3 py-1.5 border shadow-sm"
                    type="button"
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    aria-expanded={userMenuOpen}
                  >
                    <img
                      src={user.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                      alt={user.name}
                      className="rounded-circle"
                      style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                    />
                    <span className="fw-semibold text-truncate" style={{ maxWidth: '120px' }}>
                      {user.name.split(' ')[0]}
                    </span>
                    {user.role === 'owner' && (
                      <span className="badge bg-primary text-white" style={{ fontSize: '0.65rem' }}>
                        Owner
                      </span>
                    )}
                    <ChevronDown size={14} className="text-muted" />
                  </button>

                  {userMenuOpen && (
                    <div
                      className="position-absolute end-0 mt-2 bg-white rounded-4 border shadow-lg p-2 z-3"
                      style={{ width: '230px' }}
                    >
                      <div className="px-3 py-2 border-bottom mb-2 bg-light rounded-3">
                        <p className="fw-bold mb-0 text-truncate text-dark small">{user.name}</p>
                        <small className="text-muted text-truncate d-block" style={{ fontSize: '0.72rem' }}>
                          {user.email}
                        </small>
                      </div>

                      {isOwner ? (
                        <Link
                          to="/owner/dashboard"
                          className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 fw-medium text-dark text-decoration-none"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            setUserMenuOpen(false);
                          }}
                        >
                          <LayoutDashboard size={17} className="text-primary" />
                          <span className="small">Owner Dashboard</span>
                        </Link>
                      ) : (
                        <>
                          <Link
                            to="/customer/dashboard"
                            className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 fw-medium text-dark text-decoration-none"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setUserMenuOpen(false);
                            }}
                          >
                            <LayoutDashboard size={17} className="text-primary" />
                            <span className="small">My Dashboard</span>
                          </Link>
                          <Link
                            to="/my-bookings"
                            className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 fw-medium text-dark text-decoration-none"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              setUserMenuOpen(false);
                            }}
                          >
                            <CalendarCheck size={17} className="text-secondary" />
                            <span className="small">My Bookings</span>
                          </Link>
                        </>
                      )}

                      <Link
                        to="/profile"
                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 fw-medium text-dark text-decoration-none"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setUserMenuOpen(false);
                        }}
                      >
                        <User size={17} className="text-secondary" />
                        <span className="small">My Profile</span>
                      </Link>

                      <hr className="my-1 border-secondary border-opacity-25" />

                      <button
                        onClick={handleLogout}
                        className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-danger fw-medium w-100 text-start border-0 bg-transparent"
                      >
                        <LogOut size={17} />
                        <span className="small">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="btn btn-link text-decoration-none text-dark fw-semibold px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-outline-primary rounded-pill fw-semibold px-3"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
                <Link
                  to="/register?role=owner"
                  className="btn btn-stayguard rounded-pill px-3 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Building2 size={16} />
                  <span>List Your Hostel</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
