import React from 'react';

const Loader = ({ message = 'Loading...', fullScreen = false }) => {
  const content = (
    <div className="d-flex flex-column align-items-center justify-content-center p-4">
      <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted fw-semibold mb-0">{message}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div
        className="d-flex align-items-center justify-content-center bg-white"
        style={{ minHeight: '80vh', width: '100%' }}
      >
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
