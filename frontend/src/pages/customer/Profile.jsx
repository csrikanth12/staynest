import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';
import BackButton from '../../components/BackButton';
import { User, Mail, Phone, Lock, Save, CheckCircle, ShieldCheck, Camera } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password && password !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setSaving(true);

    try {
      const payload = { name, phone, profileImage };
      if (password) {
        payload.password = password;
      }

      const res = await authService.updateProfile(payload);
      if (res.success && res.data) {
        updateUser(res.data);
        setMessage('Your profile has been updated successfully!');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page bg-light py-5 min-vh-100">
      <div className="container" style={{ maxWidth: '750px' }}>
        <BackButton fallback="/" />

        <div className="bg-white p-4 p-md-5 rounded-4 border shadow-sm">
          {/* Header */}
          <div className="d-flex align-items-center gap-3 pb-4 border-bottom mb-4">
            <div className="position-relative">
              <img
                src={
                  profileImage ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                }
                alt={user?.name}
                className="rounded-circle shadow-sm object-fit-cover"
                style={{ width: '80px', height: '80px' }}
              />
            </div>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1">
                <h4 className="fw-bold text-dark mb-0">{user?.name}</h4>
                <span className="badge bg-primary-subtle text-primary rounded-pill text-uppercase small">
                  {user?.role}
                </span>
              </div>
              <span className="text-muted small">{user?.email}</span>
            </div>
          </div>

          {/* Feedback Alerts */}
          {message && (
            <div className="alert alert-success d-flex align-items-center gap-2 py-2.5 small mb-4">
              <CheckCircle size={18} />
              <span>{message}</span>
            </div>
          )}
          {error && <div className="alert alert-danger py-2.5 small mb-4">{error}</div>}

          {/* Edit Form */}
          <form onSubmit={handleProfileUpdate}>
            <h5 className="fw-bold text-dark mb-3">Personal Information</h5>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">Full Name</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <User size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={user?.email || ''}
                    disabled
                  />
                </div>
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Email address cannot be modified.
                </small>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">Phone Number</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Phone size={16} />
                  </span>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">Profile Image URL</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Camera size={16} />
                  </span>
                  <input
                    type="url"
                    className="form-control"
                    value={profileImage}
                    onChange={(e) => setProfileImage(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            <hr className="my-4" />

            <h5 className="fw-bold text-dark mb-1">Security & Password</h5>
            <p className="text-muted small mb-3">Leave blank if you do not wish to change your password</p>

            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">New Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              </div>

              <div className="col-md-6">
                <label className="form-label small fw-bold text-dark">Confirm New Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light text-muted">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-stayguard rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
              >
                <Save size={16} />
                <span>{saving ? 'Saving changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
