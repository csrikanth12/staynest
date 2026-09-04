import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton = ({
  fallback,
  label = 'Back',
  className = '',
  onClick,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine smart fallback based on portal route
  const defaultFallback = location.pathname.startsWith('/owner')
    ? '/owner/dashboard'
    : '/';

  const resolvedFallback = fallback || defaultFallback;

  const handleBack = (e) => {
    if (onClick) {
      onClick(e);
      return;
    }

    // Use browser history if available, else navigate to fallback
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(resolvedFallback);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`btn btn-sm bg-white text-dark border shadow-sm rounded-pill px-3 py-1.5 d-inline-flex align-items-center gap-1.5 fw-semibold mb-3 sg-back-btn ${className}`}
      style={{
        fontSize: '0.84rem',
        color: '#1e293b',
        borderColor: '#e2e8f0',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
      }}
      aria-label="Go back to previous page"
    >
      <ArrowLeft size={16} className="sg-back-arrow" style={{ transition: 'transform 0.2s ease' }} />
      <span>{label}</span>
    </button>
  );
};

export default BackButton;
