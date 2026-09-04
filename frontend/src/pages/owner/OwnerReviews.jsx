import React, { useState, useEffect } from 'react';
import reviewService from '../../services/reviewService';
import Loader from '../../components/Loader';
import BackButton from '../../components/BackButton';
import OwnerFilterPanel from '../../components/OwnerFilterPanel';
import {
  Star,
  MessageSquareReply,
  CheckCircle2,
  Building,
  Calendar,
  Send,
  Search,
} from 'lucide-react';

const OwnerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Reply State
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await reviewService.getOwnerReviews();
      if (res.success && res.data) {
        setReviews(res.data);
      }
    } catch (err) {
      console.error('Error fetching owner reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleSendReply = async (reviewId) => {
    if (!replyText.trim()) return;
    setSubmittingReply(true);

    try {
      const res = await reviewService.replyToReview(reviewId, replyText);
      if (res.success && res.data) {
        setReviews((prev) =>
          prev.map((r) => (r._id === reviewId ? { ...r, ownerReply: res.data.ownerReply } : r))
        );
        setReplyingReviewId(null);
        setReplyText('');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filteredReviews = reviews.filter((r) => {
    if (ratingFilter !== 'all' && r.rating !== parseInt(ratingFilter, 10)) {
      return false;
    }
    if (searchKeyword) {
      const q = searchKeyword.toLowerCase();
      const comment = (r.comment || '').toLowerCase();
      const guestName = (r.customer?.name || '').toLowerCase();
      const hostelName = (r.hostel?.name || '').toLowerCase();
      return comment.includes(q) || guestName.includes(q) || hostelName.includes(q);
    }
    return true;
  });

  const activeCount = (ratingFilter !== 'all' ? 1 : 0) + (searchKeyword ? 1 : 0);

  return (
    <div className="owner-reviews-page pb-5">
      <BackButton />

      {/* Header */}
      <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1">Guest Feedback & Reviews</h2>
          <p className="text-muted small mb-0">Read customer reviews, star ratings, and interact with traveler responses</p>
        </div>
      </div>

      {/* Enhanced Scrollable Filter Panel with Sticky Actions */}
      <OwnerFilterPanel
        title="Filter Guest Feedback"
        subtitle="Filter by star ratings and review keywords"
        activeCount={activeCount}
        onClear={() => {
          setRatingFilter('all');
          setSearchKeyword('');
        }}
        onApply={() => {}}
      >
        <div className="row g-3">
          {/* Star Rating Filter */}
          <div className="col-12 col-md-7">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Star Rating
            </label>
            <div className="owner-filter-pills">
              {[
                { id: 'all', label: `All Reviews (${reviews.length})` },
                { id: '5', label: '5 ★ Excellent' },
                { id: '4', label: '4 ★ Very Good' },
                { id: '3', label: '3 ★ Average' },
                { id: '2', label: '2 ★ & below' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setRatingFilter(opt.id)}
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-semibold ${
                    ratingFilter === opt.id
                      ? 'btn-primary'
                      : 'btn-light border text-secondary'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Keywords */}
          <div className="col-12 col-md-5">
            <label className="form-label fw-bold text-dark small text-uppercase mb-2">
              Search Comments
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light text-muted">
                <Search size={16} />
              </span>
              <input
                type="text"
                className="form-control form-control-sm bg-light"
                placeholder="Search keywords, guest, property..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
        </div>
      </OwnerFilterPanel>

      {/* Review Cards List */}
      {loading ? (
        <Loader message="Loading guest feedback..." />
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-4 border p-5 text-center shadow-sm">
          <Star size={48} className="text-muted opacity-40 mb-3" />
          <h4 className="fw-bold text-dark mb-1">No Reviews Yet</h4>
          <p className="text-muted small mb-0">Guest reviews and feedback for your hostels will appear here.</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white rounded-4 border p-5 text-center shadow-sm">
          <Star size={48} className="text-muted opacity-40 mb-3" />
          <h5 className="fw-bold text-dark mb-1">No reviews match this filter</h5>
          <p className="text-muted small mb-0">Try clearing the rating filter or keyword search.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {filteredReviews.map((review) => (
            <div key={review._id} className="card bg-white border rounded-4 p-4 shadow-sm">
              <div className="d-flex flex-column flex-md-row md-align-items-center justify-content-between mb-3 gap-2">
                {/* Customer Info */}
                <div className="d-flex align-items-center gap-3">
                  <img
                    src={
                      review.customer?.profileImage ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                    }
                    alt={review.customer?.name}
                    className="rounded-circle shadow-sm"
                    style={{ width: '44px', height: '44px', objectFit: 'cover' }}
                  />
                  <div>
                    <h6 className="fw-bold text-dark mb-0">{review.customer?.name || 'Guest'}</h6>
                    <small className="text-muted">
                      Stayed at <strong className="text-dark">{review.hostel?.name}</strong> • {formatDate(review.createdAt)}
                    </small>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="d-flex align-items-center gap-1 rating-pill">
                  <Star size={15} className="fill-warning text-warning" />
                  <span className="fw-bold fs-6">{review.rating}.0</span>
                </div>
              </div>

              {/* Review Text */}
              <p className="text-secondary small mb-3" style={{ fontSize: '0.92rem', lineHeight: '1.6' }}>
                "{review.comment}"
              </p>

              {/* Existing Owner Reply */}
              {review.ownerReply && review.ownerReply.reply ? (
                <div className="p-3 bg-light rounded-3 border-start border-primary border-3 ms-2 mb-2">
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <div className="d-flex align-items-center gap-1.5 text-primary fw-bold small">
                      <MessageSquareReply size={14} />
                      <span>Your Response</span>
                    </div>
                    {review.ownerReply.repliedAt && (
                      <small className="text-muted">{formatDate(review.ownerReply.repliedAt)}</small>
                    )}
                  </div>
                  <p className="text-secondary small mb-0" style={{ fontSize: '0.86rem' }}>
                    {review.ownerReply.reply}
                  </p>
                </div>
              ) : (
                /* Reply Action */
                <div>
                  {replyingReviewId === review._id ? (
                    <div className="mt-2 p-3 bg-light rounded-3 border">
                      <label className="form-label small fw-bold text-dark mb-1">
                        Reply as Property Owner:
                      </label>
                      <textarea
                        className="form-control form-control-sm mb-2"
                        rows="3"
                        placeholder="Thank the guest or address their suggestions..."
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                      />
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-light rounded-pill px-3"
                          onClick={() => {
                            setReplyingReviewId(null);
                            setReplyText('');
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-stayguard rounded-pill px-3"
                          disabled={submittingReply}
                          onClick={() => handleSendReply(review._id)}
                        >
                          <Send size={13} />
                          <span>{submittingReply ? 'Posting...' : 'Post Reply'}</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm rounded-pill px-3 d-flex align-items-center gap-1.5"
                      onClick={() => {
                        setReplyingReviewId(review._id);
                        setReplyText('');
                      }}
                    >
                      <MessageSquareReply size={14} />
                      <span>Reply to Guest</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OwnerReviews;
