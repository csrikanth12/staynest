import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="not-found-page bg-light py-5 min-vh-100 d-flex align-items-center justify-content-center text-center">
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="bg-white p-5 rounded-4 border shadow-sm">
          <div className="d-inline-flex p-3 rounded-circle bg-primary bg-opacity-10 text-primary mb-3">
            <Compass size={56} />
          </div>
          <h1 className="display-4 fw-extrabold text-dark mb-1">404</h1>
          <h4 className="fw-bold text-dark mb-2">Page Not Found</h4>
          <p className="text-muted small mb-4">
            The destination or page you are trying to visit does not exist or has been relocated.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link to="/" className="btn btn-stayguard rounded-pill px-4">
              <Home size={16} />
              <span>Back to Home</span>
            </Link>
            <Link to="/explore" className="btn btn-outline-primary rounded-pill px-4">
              Explore Hostels
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
