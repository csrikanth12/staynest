import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { ShieldCheck, User, Mail, Phone, Lock, Building2, UserCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('customer');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'owner') {
      setRole('owner');
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const newUser = await register({
        name,
        email,
        phone,
        password,
        role,
      });

      if (newUser.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page bg-light py-5 min-vh-100 d-flex align-items-center">
      <div className="container" style={{ maxWidth: '540px' }}>
        <BackButton fallback="/" />

        <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm">
          {/* Brand Header */}
          <div className="text-center mb-4">
            <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
              <div
                className="d-flex align-items-center justify-content-center text-white rounded-3 shadow-sm"
                style={{ width: '42px', height: '42px', background: 'var(--primary-gradient)' }}
              >
                <ShieldCheck size={24} />
              </div>
              <span className="fw-bold fs-3 text-dark tracking-tight">
                STAY<span style={{ color: 'var(--primary)' }}>GUARD</span>
              </span>
            </Link>
            <h4 className="fw-bold text-dark mb-1">Create Your Account</h4>
            <p className="text-muted small">Join thousands of travelers & hostel owners across India</p>
          </div>

          {/* Error Alert */}
          {error && <div className="alert alert-danger py-2.5 small mb-4">{error}</div>}

          {/* Account Type Selection */}
          <div className="mb-4">
            <label className="form-label small fw-bold text-dark mb-2">I want to register as:</label>
            <div className="row g-2">
              <div className="col-6">
                <button
                  type="button"
                  className={`btn w-100 p-3 rounded-3 border text-start d-flex flex-column gap-1 ${
                    role === 'customer'
                      ? 'border-primary bg-primary-subtle bg-opacity-30 text-primary'
                      : 'bg-light text-secondary'
                  }`}
                  onClick={() => setRole('customer')}
                >
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <UserCheck size={20} className={role === 'customer' ? 'text-primary' : 'text-muted'} />
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'customer'}
                      onChange={() => {}}
                      className="form-check-input m-0"
                    />
                  </div>
                  <span className="fw-bold fs-6 text-dark mt-1">Traveler / Guest</span>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    Book beds & hostels
                  </small>
                </button>
              </div>

              <div className="col-6">
                <button
                  type="button"
                  className={`btn w-100 p-3 rounded-3 border text-start d-flex flex-column gap-1 ${
                    role === 'owner'
                      ? 'border-primary bg-primary-subtle bg-opacity-30 text-primary'
                      : 'bg-light text-secondary'
                  }`}
                  onClick={() => setRole('owner')}
                >
                  <div className="d-flex align-items-center justify-content-between w-100">
                    <Building2 size={20} className={role === 'owner' ? 'text-primary' : 'text-muted'} />
                    <input
                      type="radio"
                      name="role"
                      checked={role === 'owner'}
                      onChange={() => {}}
                      className="form-check-input m-0"
                    />
                  </div>
                  <span className="fw-bold fs-6 text-dark mt-1">Hostel Owner</span>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                    List & manage properties
                  </small>
                </button>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark">Full Name *</label>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Rohan Mehra"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">Email Address *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">Phone Number *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="row g-2 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">Password *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="input-group-text bg-light text-muted border-start-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">Confirm Password *</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Repeat password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-stayguard w-100 py-2.5 rounded-pill fw-bold shadow mb-3"
            >
              <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-3 border-top text-muted small">
            Already have an account?{' '}
            <Link to="/login" className="fw-bold text-primary text-decoration-none">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
