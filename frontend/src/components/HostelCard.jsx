import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  MapPin,
  Wifi,
  Wind,
  Shield,
  Coffee,
  Heart,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Image as ImageIcon,
  Eye,
} from 'lucide-react';

const CATEGORY_NAMES = [
  'Building / Exterior',
  'Room',
  'Beds / Dormitory',
];

const THUMBNAILS_CONFIG = [
  { index: 1, label: 'ROOM', name: 'Room' },
  { index: 2, label: 'BEDS', name: 'Beds / Dormitory' },
];

const HostelCard = ({ hostel }) => {
  if (!hostel) return null;

  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('sg_wishlist') || '[]');
      setIsFavorite(saved.includes(hostel._id));
    } catch (e) {
      // Ignore
    }
  }, [hostel._id]);

  const defaultBuilding = '/images/hostels/hostel-1/building.jpg';
  const defaultRoom = '/images/hostels/hostel-1/room.jpg';
  const defaultBeds = '/images/hostels/hostel-1/beds.jpg';

  const buildingImage = hostel.images?.[0] || defaultBuilding;
  const roomImage = hostel.images?.[1] || defaultRoom;
  const bedsImage = hostel.images?.[2] || defaultBeds;

  const cardImages = [buildingImage, roomImage, bedsImage];
  const currentMainImage = cardImages[activeImageIndex] || buildingImage;
  const totalPhotosCount = cardImages.length;

  useEffect(() => {
    if (!showLightbox) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setShowLightbox(false);
      else if (e.key === 'ArrowLeft') setLightboxIndex((prev) => (prev - 1 + totalPhotosCount) % totalPhotosCount);
      else if (e.key === 'ArrowRight') setLightboxIndex((prev) => (prev + 1) % totalPhotosCount);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox, totalPhotosCount]);

  const toggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const saved = JSON.parse(localStorage.getItem('sg_wishlist') || '[]');
      let updated;
      if (saved.includes(hostel._id)) {
        updated = saved.filter((id) => id !== hostel._id);
        setIsFavorite(false);
      } else {
        updated = [...saved, hostel._id];
        setIsFavorite(true);
      }
      localStorage.setItem('sg_wishlist', JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not update wishlist in localStorage:', err);
    }
  };

  const handleImageError = (idx) => {
    setImageErrors((prev) => ({ ...prev, [idx]: true }));
  };

  const openLightbox = (e, index = activeImageIndex) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const closeLightbox = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowLightbox(false);
  };

  const nextLightboxImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex((prev) => (prev + 1) % totalPhotosCount);
  };

  const prevLightboxImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxIndex((prev) => (prev - 1 + totalPhotosCount) % totalPhotosCount);
  };

  const handleCardPrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev - 1 + totalPhotosCount) % totalPhotosCount);
  };

  const handleCardNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIndex((prev) => (prev + 1) % totalPhotosCount);
  };

  // Icon mapper for quick amenities preview
  const renderAmenityIcon = (amenity) => {
    switch (amenity.toLowerCase()) {
      case 'wi-fi':
      case 'wifi':
        return <Wifi size={13} key={amenity} />;
      case 'ac':
        return <Wind size={13} key={amenity} />;
      case 'locker':
        return <Shield size={13} key={amenity} />;
      case 'breakfast':
        return <Coffee size={13} key={amenity} />;
      default:
        return null;
    }
  };

  const numReviews = hostel.numReviews || (hostel.reviews ? hostel.reviews.length : 12);
  const ratingValue = hostel.rating ? Number(hostel.rating).toFixed(1) : '4.6';
  const startingPrice = hostel.startingPrice || 1200;

  return (
    <>
      <div className="card h-100 sg-card sg-card-hover border-0 overflow-hidden d-flex flex-column rounded-4 bg-white shadow-sm hostel-property-card">
        {/* Multi-Image Gallery Layout (Large Main Building on Left + Exactly 2 Small Thumbnails Stacked on Right: ROOM, BEDS) */}
        <div className="hostel-card-gallery-layout">
          {/* Main Large Image */}
          <div
            className="hostel-card-main-img-wrap"
            onClick={(e) => openLightbox(e, activeImageIndex)}
            title="Click to view full image"
          >
            {imageErrors[activeImageIndex] ? (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 bg-dark text-white p-3 text-center">
                <ImageIcon size={28} className="mb-2 opacity-50" />
                <span className="small text-muted">Photo Unavailable</span>
              </div>
            ) : (
              <img
                src={currentMainImage}
                alt={`${hostel.name} - ${CATEGORY_NAMES[activeImageIndex] || 'Building / Exterior'}`}
                loading="lazy"
                onError={() => handleImageError(activeImageIndex)}
              />
            )}

            {/* Category Tag & Quick Return to Building on Main Photo */}
            <div className="position-absolute bottom-0 start-0 m-2 d-flex align-items-center gap-1.5" style={{ zIndex: 3 }}>
              <span
                className="badge bg-dark bg-opacity-75 text-white px-2.5 py-1 rounded-2 fw-medium d-inline-flex align-items-center gap-1.5 shadow-sm"
                style={{ fontSize: '0.7rem', backdropFilter: 'blur(6px)' }}
              >
                <ImageIcon size={11} className="text-primary-light" />
                <span>{CATEGORY_NAMES[activeImageIndex] || 'Building / Exterior'}</span>
              </span>

              {activeImageIndex !== 0 && (
                <button
                  type="button"
                  className="badge bg-primary text-white border-0 px-2 py-1 rounded-2 fw-medium shadow-sm d-inline-flex align-items-center gap-1 cursor-pointer hover-bg-primary-dark"
                  style={{ fontSize: '0.68rem', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setActiveImageIndex(0);
                  }}
                  title="Switch back to Building exterior view"
                >
                  <span>↺ Building</span>
                </button>
              )}
            </div>

            {/* Mobile Prev & Next Navigation */}
            {totalPhotosCount > 1 && (
              <>
                <button
                  type="button"
                  onClick={handleCardPrevImage}
                  className="card-mobile-img-nav prev d-sm-none"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleCardNextImage}
                  className="card-mobile-img-nav next d-sm-none"
                  aria-label="Next image"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {/* Side Thumbnail Column (ONLY TWO small image cards stacked vertically: 1. ROOM, 2. BEDS) */}
          <div className="hostel-card-thumbs-col">
            {THUMBNAILS_CONFIG.map((thumb) => {
              const thumbUrl = cardImages[thumb.index];
              const isActive = activeImageIndex === thumb.index;

              return (
                <div
                  key={thumb.label}
                  className={`hostel-card-thumb-item ${isActive ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isActive) {
                      setActiveImageIndex(0); // Clicking again switches back to Building
                    } else {
                      setActiveImageIndex(thumb.index); // Switch to clicked image
                    }
                  }}
                  title={`Click to view ${thumb.name}`}
                >
                  {imageErrors[thumb.index] ? (
                    <div className="d-flex align-items-center justify-content-center h-100 bg-secondary text-white small">
                      <ImageIcon size={14} />
                    </div>
                  ) : (
                    <img
                      src={thumbUrl}
                      alt={`${hostel.name} - ${thumb.name}`}
                      loading="lazy"
                      onError={() => handleImageError(thumb.index)}
                    />
                  )}

                  {/* Thumbnail Label Badge (ROOM, BEDS) */}
                  <span className="hostel-card-thumb-tag">
                    {thumb.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Verified Badge */}
          <div className="position-absolute top-0 start-0 m-2.5 pointer-events-none" style={{ zIndex: 4 }}>
            <span className="badge-verified shadow-sm">
              <CheckCircle2 size={12} strokeWidth={3} />
              <span>Verified Stay</span>
            </span>
          </div>

          {/* Favorite Heart Button */}
          <div className="position-absolute top-0 end-0 m-2.5" style={{ zIndex: 4 }}>
            <button
              type="button"
              onClick={toggleFavorite}
              className={`wishlist-btn ${isFavorite ? 'active' : ''}`}
              aria-label={isFavorite ? 'Remove from wishlist' : 'Save to wishlist'}
              title={isFavorite ? 'Saved to Wishlist' : 'Add to Wishlist'}
            >
              <Heart size={16} className={isFavorite ? 'fill-danger text-danger' : ''} />
            </button>
          </div>
        </div>

        {/* Card Body Content */}
        <div className="card-body p-3.5 d-flex flex-column flex-grow-1">
          {/* Rating & Review Count Header */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div className="d-flex align-items-center gap-1.5">
              <span className="badge bg-success text-white px-2 py-1 rounded-2 fw-bold d-inline-flex align-items-center gap-1" style={{ fontSize: '0.78rem' }}>
                <span>{ratingValue}</span>
                <Star size={12} className="fill-white" />
              </span>
              <span className="text-muted small" style={{ fontSize: '0.8rem' }}>
                ({numReviews} reviews)
              </span>
            </div>

            <span className="text-muted small fw-medium" style={{ fontSize: '0.78rem' }}>
              {hostel.location?.city || 'India'}
            </span>
          </div>

          {/* Hostel Title */}
          <h5 className="card-title fw-bold text-dark mb-1.5 text-truncate" style={{ fontSize: '1.05rem' }}>
            <Link to={`/hostels/${hostel._id}`} className="text-dark hover-text-primary text-decoration-none">
              {hostel.name}
            </Link>
          </h5>

          {/* Location Landmark */}
          <div className="d-flex align-items-center gap-1 text-muted small mb-2" style={{ fontSize: '0.82rem' }}>
            <MapPin size={14} className="text-primary flex-shrink-0" />
            <span className="text-truncate">
              {hostel.location?.landmark ? `${hostel.location.landmark}, ` : ''}{hostel.location?.city || 'India'}
            </span>
          </div>

          {/* Amenities Preview */}
          <div className="d-flex flex-wrap gap-1 mb-2">
            {hostel.amenities?.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="badge bg-light text-secondary border px-2 py-1 rounded-pill d-inline-flex align-items-center gap-1"
                style={{ fontSize: '0.72rem' }}
              >
                {renderAmenityIcon(amenity)}
                <span>{amenity}</span>
              </span>
            ))}
            {hostel.amenities?.length > 3 && (
              <span className="badge bg-light text-muted border px-2 py-1 rounded-pill" style={{ fontSize: '0.72rem' }}>
                +{hostel.amenities.length - 3} more
              </span>
            )}
          </div>

          {/* Room Type & Availability Indicator */}
          <div className="d-flex align-items-center justify-content-between mb-3 pt-1">
            <span className="badge bg-primary-subtle text-primary rounded-pill px-2.5 py-1 fw-medium" style={{ fontSize: '0.72rem' }}>
              {hostel.rooms && hostel.rooms.length > 0 ? hostel.rooms[0].roomType || hostel.rooms[0].type : 'AC Dorm / Private'}
            </span>
            <span className="text-success small fw-semibold d-flex align-items-center gap-1" style={{ fontSize: '0.75rem' }}>
              <span className="d-inline-block rounded-circle bg-success" style={{ width: '6px', height: '6px' }} />
              Available Now
            </span>
          </div>

          {/* Price & Action Buttons */}
          <div className="mt-auto pt-3 border-top d-flex align-items-center justify-content-between">
            <div>
              <span className="text-muted small d-block" style={{ fontSize: '0.72rem' }}>From</span>
              <div className="d-flex align-items-baseline gap-1">
                <span className="fs-5 fw-extrabold text-primary">₹{startingPrice.toLocaleString('en-IN')}</span>
                <span className="text-muted small" style={{ fontSize: '0.78rem' }}>/ night</span>
              </div>
            </div>

            <div className="d-flex gap-1.5">
              <Link
                to={`/hostels/${hostel._id}`}
                className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-semibold"
                style={{ fontSize: '0.82rem' }}
              >
                View Details
              </Link>
              <Link
                to={`/hostels/${hostel._id}#rooms`}
                className="btn btn-stayguard btn-sm rounded-pill px-3 fw-semibold"
                style={{ fontSize: '0.82rem' }}
              >
                Book
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Screen Lightbox Modal for this specific Hostel */}
      {showLightbox && (
        <div
          className="hostel-lightbox-modal"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          {/* Header */}
          <div className="lightbox-header" onClick={(e) => e.stopPropagation()}>
            <div>
              <h5 className="fw-bold mb-0 text-white">{hostel.name}</h5>
              <small className="text-white-50">
                {CATEGORY_NAMES[lightboxIndex] || 'Property View'} • {lightboxIndex + 1} of {totalPhotosCount}
              </small>
            </div>
            <button
              type="button"
              className="btn btn-outline-light btn-sm rounded-circle p-2 d-flex align-items-center justify-content-center"
              onClick={closeLightbox}
              aria-label="Close photo gallery"
            >
              <X size={20} />
            </button>
          </div>

          {/* Lightbox Stage */}
          <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
            {totalPhotosCount > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn prev"
                onClick={prevLightboxImage}
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {imageErrors[lightboxIndex] ? (
              <div className="d-flex flex-column align-items-center justify-content-center bg-dark text-white p-5 rounded-4">
                <ImageIcon size={48} className="mb-3 opacity-50" />
                <h5 className="text-white-50">Photo Unavailable</h5>
              </div>
            ) : (
              <img
                src={cardImages[lightboxIndex]}
                alt={`${hostel.name} photo ${lightboxIndex + 1}`}
                className="lightbox-main-img"
                onError={() => handleImageError(lightboxIndex)}
              />
            )}

            {totalPhotosCount > 1 && (
              <button
                type="button"
                className="lightbox-nav-btn next"
                onClick={nextLightboxImage}
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            )}
          </div>

          {/* Filmstrip Footer */}
          <div className="lightbox-footer-filmstrip" onClick={(e) => e.stopPropagation()}>
            {cardImages.map((img, idx) => (
              <div
                key={idx}
                className={`lightbox-filmstrip-thumb ${lightboxIndex === idx ? 'active' : ''}`}
                onClick={() => setLightboxIndex(idx)}
                title={CATEGORY_NAMES[idx] || `Photo ${idx + 1}`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  onError={() => handleImageError(idx)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default HostelCard;

