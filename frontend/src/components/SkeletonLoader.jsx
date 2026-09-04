import React from 'react';

export const HostelCardSkeleton = () => (
  <div className="card h-100 sg-card border-0 overflow-hidden d-flex flex-column rounded-4 bg-white shadow-sm skeleton-card">
    <div className="skeleton-box" style={{ height: '220px', width: '100%' }} />
    <div className="card-body p-3.5 d-flex flex-column gap-2.5">
      <div className="d-flex justify-content-between align-items-center">
        <div className="skeleton-box rounded-2" style={{ width: '70px', height: '22px' }} />
        <div className="skeleton-box rounded-2" style={{ width: '60px', height: '18px' }} />
      </div>
      <div className="skeleton-box rounded-2" style={{ width: '85%', height: '24px' }} />
      <div className="skeleton-box rounded-2" style={{ width: '60%', height: '16px' }} />
      <div className="d-flex gap-2 my-1">
        <div className="skeleton-box rounded-pill" style={{ width: '55px', height: '20px' }} />
        <div className="skeleton-box rounded-pill" style={{ width: '55px', height: '20px' }} />
        <div className="skeleton-box rounded-pill" style={{ width: '55px', height: '20px' }} />
      </div>
      <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
        <div className="skeleton-box rounded-2" style={{ width: '80px', height: '26px' }} />
        <div className="d-flex gap-2">
          <div className="skeleton-box rounded-pill" style={{ width: '65px', height: '32px' }} />
          <div className="skeleton-box rounded-pill" style={{ width: '65px', height: '32px' }} />
        </div>
      </div>
    </div>
  </div>
);

export const HostelDetailsSkeleton = () => (
  <div className="container py-4">
    <div className="skeleton-box rounded-pill mb-3" style={{ width: '120px', height: '34px' }} />
    <div className="skeleton-box rounded-2 mb-2" style={{ width: '40%', height: '36px' }} />
    <div className="skeleton-box rounded-2 mb-4" style={{ width: '30%', height: '20px' }} />
    <div className="row g-3 mb-4">
      <div className="col-lg-8">
        <div className="skeleton-box rounded-4" style={{ height: '420px', width: '100%' }} />
      </div>
      <div className="col-lg-4 d-flex flex-column gap-3">
        <div className="skeleton-box rounded-3" style={{ height: '130px', width: '100%' }} />
        <div className="skeleton-box rounded-3" style={{ height: '130px', width: '100%' }} />
        <div className="skeleton-box rounded-3" style={{ height: '130px', width: '100%' }} />
      </div>
    </div>
  </div>
);

export default HostelCardSkeleton;
