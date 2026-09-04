import React from 'react';
import { Star, MessageSquareReply, CheckCircle2 } from 'lucide-react';

const ReviewCard = ({ review }) => {
  if (!review) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="card border rounded-4 p-3.5 mb-3 bg-white shadow-sm">
      {/* Customer Info & Rating */}
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2.5">
          <img
            src={
              review.customer?.profileImage ||
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
            }
            alt={review.customer?.name || 'Customer'}
            className="rounded-circle object-fit-cover shadow-sm"
            style={{ width: '40px', height: '40px' }}
          />
          <div>
            <h6 className="fw-bold text-dark mb-0">{review.customer?.name || 'Verified Traveler'}</h6>
            <div className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: '0.78rem' }}>
              <CheckCircle2 size={12} className="text-success" />
              <span>Verified Stay • {formatDate(review.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Rating Stars */}
        <div className="d-flex align-items-center gap-1 bg-warning-subtle px-2.5 py-1 rounded-pill">
          <Star size={14} className="fill-warning text-warning" />
          <span className="fw-bold text-warning-emphasis small">{review.rating}.0</span>
        </div>
      </div>

      {/* Review Comment */}
      <p className="text-secondary small mb-2" style={{ lineHeight: '1.5' }}>
        "{review.comment}"
      </p>

      {/* Owner Reply Box (if replied) */}
      {review.ownerReply && review.ownerReply.reply && (
        <div className="mt-3 p-3 rounded-3 bg-light border-start border-primary border-3 ms-2">
          <div className="d-flex align-items-center gap-1.5 text-primary fw-bold small mb-1">
            <MessageSquareReply size={14} />
            <span>Response from Hostel Management</span>
          </div>
          <p className="text-secondary small mb-0" style={{ fontSize: '0.84rem' }}>
            {review.ownerReply.reply}
          </p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
