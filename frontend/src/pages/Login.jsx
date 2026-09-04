import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BackButton from '../components/BackButton';
import { ShieldCheck, Mail, Lock, ArrowRight, UserCheck, Building2, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectPath = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login(email, password);
      if (redirectPath) {
        navigate(redirectPath);
      } else if (loggedInUser.role === 'owner') {
        navigate('/owner/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (role) => {
    if (role === 'owner') {
      setEmail('owner@stayguard.com');
      setPassword('password123');
    } else {
      setEmail('customer@stayguard.com');
      setPassword('password123');
    }
  };

  return (
    <div className="login-page bg-light py-5 min-vh-100 d-flex align-items-center">
      <div className="container" style={{ maxWidth: '480px' }}>
        <BackButton fallback="/" />

        <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm">
          {/* Logo & Header */}
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
            <h4 className="fw-bold text-dark mb-1">Welcome Back</h4>
            <p className="text-muted small">Sign in to manage your bookings or hostel properties</p>
          </div>

          {/* Error Alert */}
          {error && <div className="alert alert-danger py-2.5 small mb-4">{error}</div>}

          {/* Quick Demo Autofill Box */}
          <div className="p-3 bg-light rounded-3 mb-4 border">
            <div className="text-muted small fw-bold text-uppercase mb-2" style={{ fontSize: '0.72rem', letterSpacing: '0.5px' }}>
              ⚡ Quick Demo One-Click Login
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-outline-primary btn-sm flex-grow-1 rounded-pill d-flex align-items-center justify-content-center gap-1.5"
                onClick={() => handleDemoFill('customer')}
              >
                <UserCheck size={14} />
                <span>Customer</span>
              </button>
              <button
                type="button"
                className="btn btn-outline-dark btn-sm flex-grow-1 rounded-pill d-flex align-items-center justify-content-center gap-1.5"
                onClick={() => handleDemoFill('owner')}
              >
                <Building2 size={14} />
                <span>Hostel Owner</span>
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold text-dark">Email Address</label>
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

            <div className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <label className="form-label small fw-bold text-dark mb-0">Password</label>
              </div>
              <div className="input-group">
                <span className="input-group-text bg-light text-muted">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-light text-muted border-start-0"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="d-flex align-items-center justify-content-between mb-4 small">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <label className="form-check-label text-muted" htmlFor="rememberMe">
                  Remember me
                </label>
              </div>
              <span className="text-primary text-decoration-none cursor-pointer">
                Forgot password?
              </span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-stayguard w-100 py-2.5 rounded-pill fw-bold shadow mb-3"
            >
              <span>{loading ? 'Signing in...' : 'Sign In'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-3 border-top text-muted small">
            Don't have an account?{' '}
            <Link to="/register" className="fw-bold text-primary text-decoration-none">
              Register now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
